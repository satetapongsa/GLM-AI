import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Conversation, Message, Attachment } from "@/lib/types";
import { INITIAL_CONVERSATIONS, INITIAL_MESSAGES } from "@/lib/config/defaultData";
import { DEFAULT_MODEL_ID, AVAILABLE_MODELS } from "@/lib/config/models";
import { getAIProvider } from "@/lib/providers";
import { calculateTokensForRequest, useTokenStore } from "@/lib/store/useTokenStore";
import { useAuthStore } from "@/lib/store/useAuthStore";

function buildOptimizedHistory(
  messages: Message[],
  excludeId: string,
  isOpMode: boolean
): { role: "user" | "assistant" | "system"; content: string }[] {
  // Exclude placeholder assistant message and admin commands from sent history
  const filtered = messages.filter(
    (m) =>
      m.id !== excludeId &&
      m.content &&
      m.content.trim() !== "/op" &&
      m.content.trim() !== "/deop" &&
      !m.content.startsWith("✦ **[Admin OP Mode")
  );

  // In Standard Mode: Smart Token Saver (Sliding Window of last 6 messages, truncate old verbose text)
  if (!isOpMode) {
    const recent = filtered.slice(-6);
    return recent.map((m) => {
      // Truncate past assistant message outputs to max 350 chars so old answers don't blow up token cost
      const content =
        m.role === "assistant" && m.content.length > 350
          ? m.content.slice(0, 350) + "..."
          : m.content;
      return {
        role: m.role,
        content,
      };
    });
  }

  // In OP Mode: Keep comprehensive history up to 14 turns
  return filtered.slice(-14).map((m) => ({
    role: m.role,
    content: m.content,
  }));
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  activeModelId: string;
  composerText: string;
  composerAttachments: Attachment[];
  isStreaming: boolean;
  streamingMessageId: string | null;
  abortController: AbortController | null;
  isOpMode: boolean;

  // Actions
  setActiveConversation: (id: string | null) => void;
  setActiveModel: (modelId: string) => void;
  setComposerText: (text: string) => void;
  addComposerAttachment: (attachment: Attachment) => void;
  removeComposerAttachment: (id: string) => void;
  clearComposerAttachments: () => void;
  setOpMode: (enabled: boolean) => void;

  createNewConversation: (title?: string, modelId?: string) => string;
  renameConversation: (id: string, newTitle: string) => void;
  togglePinConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  clearAllConversations: () => void;

  sendMessage: (customPrompt?: string, customAttachments?: Attachment[]) => Promise<void>;
  stopGeneration: () => void;
  regenerateResponse: (messageId: string) => Promise<void>;
  editMessageAndResend: (messageId: string, newContent: string) => Promise<void>;
  rateMessage: (messageId: string, rating: "like" | "dislike" | null) => void;
  syncFromCloud: (userEmail: string) => Promise<void>;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: INITIAL_CONVERSATIONS,
      activeConversationId: null,
      messages: INITIAL_MESSAGES,
      activeModelId: DEFAULT_MODEL_ID,
      composerText: "",
      composerAttachments: [],
      isStreaming: false,
      streamingMessageId: null,
      abortController: null,
      isOpMode: false,

      setActiveConversation: (id) => set({ activeConversationId: id }),

      setActiveModel: (modelId) => set({ activeModelId: modelId }),

      setComposerText: (text) => set({ composerText: text }),

      setOpMode: (enabled) => set({ isOpMode: enabled }),

      addComposerAttachment: (attachment) =>
        set((state) => ({
          composerAttachments: [...state.composerAttachments, attachment],
        })),

      removeComposerAttachment: (id) =>
        set((state) => ({
          composerAttachments: state.composerAttachments.filter((a) => a.id !== id),
        })),

      clearComposerAttachments: () => set({ composerAttachments: [] }),

      createNewConversation: (title, modelId) => {
        const newId = `conv-${Date.now()}`;
        const newConv: Conversation = {
          id: newId,
          title: title || "การสนทนาใหม่",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          modelId: modelId || get().activeModelId,
          pinned: false,
          messageCount: 0,
        };

        set((state) => ({
          conversations: [newConv, ...state.conversations],
          activeConversationId: newId,
          messages: {
            ...state.messages,
            [newId]: [],
          },
        }));

        // Fire-and-forget sync to Neon Database
        const currentUserEmail = useAuthStore.getState().user?.email;
        if (currentUserEmail && currentUserEmail !== "guest_user") {
          fetch("/api/chat/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "save_conversation",
              userEmail: currentUserEmail,
              conversation: newConv,
            }),
          }).catch(() => {});
        }

        return newId;
      },

      renameConversation: (id, newTitle) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title: newTitle, updatedAt: new Date().toISOString() } : c
          ),
        }));

        const currentUserEmail = useAuthStore.getState().user?.email;
        if (currentUserEmail && currentUserEmail !== "guest_user") {
          fetch("/api/chat/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "rename_conversation",
              userEmail: currentUserEmail,
              id,
              title: newTitle,
            }),
          }).catch(() => {});
        }
      },

      togglePinConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, pinned: !c.pinned } : c
          ),
        })),

      deleteConversation: (id) => {
        set((state) => {
          const nextActiveId =
            state.activeConversationId === id
              ? state.conversations.find((c) => c.id !== id)?.id || null
              : state.activeConversationId;

          const updatedMessages = { ...state.messages };
          delete updatedMessages[id];

          return {
            conversations: state.conversations.filter((c) => c.id !== id),
            messages: updatedMessages,
            activeConversationId: nextActiveId,
          };
        });

        const currentUserEmail = useAuthStore.getState().user?.email;
        if (currentUserEmail && currentUserEmail !== "guest_user") {
          fetch("/api/chat/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "delete_conversation",
              userEmail: currentUserEmail,
              id,
            }),
          }).catch(() => {});
        }
      },

      clearAllConversations: () =>
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
        }),

      sendMessage: async (customPrompt, customAttachments) => {
        const state = get();
        const promptText = (customPrompt !== undefined ? customPrompt : state.composerText).trim();
        const attachments = customAttachments || state.composerAttachments;

        if (!promptText && attachments.length === 0) return;
        if (state.isStreaming) return;

        let convId = state.activeConversationId;
        if (!convId) {
          convId = state.createNewConversation(promptText, state.activeModelId);
        }

        const currentModel = AVAILABLE_MODELS.find((m) => m.id === state.activeModelId);
        const userMessageId = `msg-user-${Date.now()}`;
        const assistantMessageId = `msg-asst-${Date.now() + 1}`;

        // SECRET ADMIN OP COMMAND: /op
        if (promptText.toLowerCase() === "/op") {
          set((s) => {
            const userMsg: Message = {
              id: userMessageId,
              conversationId: convId as string,
              role: "user",
              content: "/op",
              createdAt: new Date().toISOString(),
            };
            const opReply: Message = {
              id: assistantMessageId,
              conversationId: convId as string,
              role: "assistant",
              modelId: s.activeModelId,
              modelName: currentModel?.name || "GML AI",
              content: "✦ **[Admin OP Mode Activated]** ปลดล็อคขีดจำกัดความยาวและปลดปล่อยศักยภาพสูงสุดเรียบร้อยแล้วครับ! ตอนนี้ AI จะตอบคำถามได้อย่างละเอียด ลึกซึ้ง เต็มประสิทธิภาพ และไม่จำกัดความยาว 300 คำ (พิมพ์ `/deop` เมื่อต้องการกลับสู่โหมดประหยัดปกติ)",
              createdAt: new Date().toISOString(),
              isStreaming: false,
            };
            return {
              isOpMode: true,
              composerText: "",
              composerAttachments: [],
              messages: {
                ...s.messages,
                [convId as string]: [...(s.messages[convId as string] || []), userMsg, opReply],
              },
            };
          });
          return;
        }

        // SECRET ADMIN DEOP COMMAND: /deop
        if (promptText.toLowerCase() === "/deop") {
          set((s) => {
            const userMsg: Message = {
              id: userMessageId,
              conversationId: convId as string,
              role: "user",
              content: "/deop",
              createdAt: new Date().toISOString(),
            };
            const deopReply: Message = {
              id: assistantMessageId,
              conversationId: convId as string,
              role: "assistant",
              modelId: s.activeModelId,
              modelName: currentModel?.name || "GML AI",
              content: "✦ **[Admin OP Mode Deactivated]** ปิดการปลดลิมิตเรียบร้อยแล้วครับ ระบบกลับสู่โหมดประหยัดโทเคนและตอบกระชับไม่เกิน 300 คำตามปกติ",
              createdAt: new Date().toISOString(),
              isStreaming: false,
            };
            return {
              isOpMode: false,
              composerText: "",
              composerAttachments: [],
              messages: {
                ...s.messages,
                [convId as string]: [...(s.messages[convId as string] || []), userMsg, deopReply],
              },
            };
          });
          return;
        }

        const userMessage: Message = {
          id: userMessageId,
          conversationId: convId,
          role: "user",
          content: promptText,
          createdAt: new Date().toISOString(),
          attachments: attachments.length > 0 ? [...attachments] : undefined,
        };

        const initialAssistantMessage: Message = {
          id: assistantMessageId,
          conversationId: convId,
          role: "assistant",
          modelId: state.activeModelId,
          modelName: currentModel?.name || "AI Assistant",
          content: "",
          createdAt: new Date().toISOString(),
          isStreaming: true,
        };

        // Update state with user message and placeholder assistant message
        set((s) => ({
          composerText: "",
          composerAttachments: [],
          messages: {
            ...s.messages,
            [convId as string]: [
              ...(s.messages[convId as string] || []),
              userMessage,
              initialAssistantMessage,
            ],
          },
          conversations: s.conversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  title: c.messageCount === 0 ? promptText.slice(0, 38) : c.title,
                  lastMessageSnippet: promptText.slice(0, 45),
                  messageCount: (s.messages[convId as string]?.length || 0) + 2,
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
          isStreaming: true,
          streamingMessageId: assistantMessageId,
        }));

        // Fire-and-forget sync user message & conversation to Neon Database
        const currentUserEmail = useAuthStore.getState().user?.email;
        if (currentUserEmail && currentUserEmail !== "guest_user") {
          const updatedConv = get().conversations.find((c) => c.id === convId);
          if (updatedConv) {
            fetch("/api/chat/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "save_conversation",
                userEmail: currentUserEmail,
                conversation: updatedConv,
              }),
            }).catch(() => {});
          }
          fetch("/api/chat/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "save_message",
              userEmail: currentUserEmail,
              message: userMessage,
            }),
          }).catch(() => {});
        }

        const controller = new AbortController();
        set({ abortController: controller });
        const startTime = performance.now();
        let finalResponseText = "";

        try {
          // Build smart token-optimized history (Sliding Context Window)
          const allMsgs = get().messages[convId] || [];
          const history = buildOptimizedHistory(allMsgs, assistantMessageId, state.isOpMode);

          // Construct enriched prompt with attached file contents
          let fullPrompt = promptText;
          if (attachments && attachments.length > 0) {
            const fileContexts = attachments
              .filter((a) => a.content)
              .map((a) => `[ไฟล์แนบ: ${a.name}]\n\`\`\`\n${a.content}\n\`\`\``)
              .join("\n\n");

            if (fileContexts) {
              fullPrompt = `${fileContexts}\n\n[คำถาม/คำสั่งของผู้ใช้]:\n${promptText || "ช่วยอ่าน วิเคราะห์ หรืออธิบายไฟล์แนบนี้ให้หน่อย"}`;
            }
          }

          // Try calling Next.js streaming API route first
          const currentUserEmail = useAuthStore.getState().user?.email || "guest_user";
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: fullPrompt,
              modelId: state.activeModelId,
              history,
              isOpMode: state.isOpMode,
              userEmail: currentUserEmail,
            }),
            signal: controller.signal,
          });

          if (response.ok && response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
              const { value, done } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (!line.trim()) continue;
                try {
                  const payload = JSON.parse(line);
                  finalResponseText = payload.content || finalResponseText;

                  set((s) => {
                    const currentList = s.messages[convId as string] || [];
                    return {
                      messages: {
                        ...s.messages,
                        [convId as string]: currentList.map((m) =>
                          m.id === assistantMessageId
                            ? {
                                ...m,
                                content: payload.content,
                                reasoning: payload.reasoningContent,
                                isStreaming: !payload.isComplete,
                              }
                            : m
                        ),
                      },
                    };
                  });
                } catch {
                  // partial chunk
                }
              }
            }
          } else {
            // Fallback direct provider streaming
            const provider = getAIProvider(currentModel?.provider);
            const stream = provider.streamMessage(fullPrompt, history, {
              modelId: state.activeModelId,
              signal: controller.signal,
              isOpMode: state.isOpMode,
            });

            for await (const chunk of stream) {
              finalResponseText = chunk.content;
              set((s) => {
                const currentList = s.messages[convId as string] || [];
                return {
                  messages: {
                    ...s.messages,
                    [convId as string]: currentList.map((m) =>
                      m.id === assistantMessageId
                        ? {
                            ...m,
                            content: chunk.content,
                            reasoning: chunk.reasoningContent,
                            isStreaming: !chunk.isComplete,
                          }
                        : m
                    ),
                  },
                };
              });
            }
          }
        } catch (error: unknown) {
          if ((error as { name?: string })?.name === "AbortError") {
            // User intentionally stopped generation
          } else {
            console.error("Chat generation failed:", error);
            set((s) => {
              const currentList = s.messages[convId as string] || [];
              return {
                messages: {
                  ...s.messages,
                  [convId as string]: currentList.map((m) =>
                    m.id === assistantMessageId
                      ? {
                          ...m,
                          content:
                            finalResponseText ||
                            "ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง",
                          isStreaming: false,
                          isError: !finalResponseText,
                        }
                      : m
                  ),
                },
              };
            });
          }
        } finally {
          const endTime = performance.now();
          const thinkingTimeSeconds = (endTime - startTime) / 1000;
          const tokensUsed = calculateTokensForRequest(promptText, finalResponseText.length);

          // Deduct tokens
          useTokenStore.getState().consumeTokens(tokensUsed);

          set((s) => {
            const currentList = s.messages[convId as string] || [];
            return {
              isStreaming: false,
              streamingMessageId: null,
              abortController: null,
              messages: {
                ...s.messages,
                [convId as string]: currentList.map((m) =>
                  m.id === assistantMessageId
                    ? {
                        ...m,
                        isStreaming: false,
                        tokensUsed,
                        thinkingTimeSeconds: Math.max(0.6, thinkingTimeSeconds),
                      }
                    : m
                ),
              },
            };
          });

          // Assistant responses are kept in local state/storage and not synced to cloud DB to save database storage
        }
      },

      stopGeneration: () => {
        const { abortController } = get();
        if (abortController) {
          abortController.abort();
        }
        set({ isStreaming: false, streamingMessageId: null, abortController: null });
      },

      regenerateResponse: async (messageId) => {
        const state = get();
        const convId = state.activeConversationId;
        if (!convId || state.isStreaming) return;

        const msgList = state.messages[convId] || [];
        const targetIdx = msgList.findIndex((m) => m.id === messageId);
        if (targetIdx === -1) return;

        const userMsg = msgList.slice(0, targetIdx).reverse().find((m) => m.role === "user");
        if (!userMsg) return;

        set((s) => ({
          isStreaming: true,
          streamingMessageId: messageId,
          messages: {
            ...s.messages,
            [convId]: (s.messages[convId] || []).map((m) =>
              m.id === messageId
                ? { ...m, content: "", reasoning: undefined, isError: false, isStreaming: true }
                : m
            ),
          },
        }));

        const controller = new AbortController();
        set({ abortController: controller });
        const startTime = performance.now();
        let finalResponseText = "";

        try {
          const rawHistory = msgList.slice(0, targetIdx);
          const history = buildOptimizedHistory(rawHistory, messageId, state.isOpMode);

          const currentModel = AVAILABLE_MODELS.find((m) => m.id === state.activeModelId);
          const provider = getAIProvider(currentModel?.provider);

          const stream = provider.streamMessage(userMsg.content, history, {
            modelId: state.activeModelId,
            signal: controller.signal,
            isOpMode: state.isOpMode,
          });

          for await (const chunk of stream) {
            finalResponseText = chunk.content;
            set((s) => ({
              messages: {
                ...s.messages,
                [convId]: (s.messages[convId] || []).map((m) =>
                  m.id === messageId
                    ? {
                        ...m,
                        content: chunk.content,
                        reasoning: chunk.reasoningContent,
                        isStreaming: !chunk.isComplete,
                      }
                    : m
                ),
              },
            }));
          }
        } catch {
          // ignore
        } finally {
          const endTime = performance.now();
          const thinkingTimeSeconds = (endTime - startTime) / 1000;
          const tokensUsed = calculateTokensForRequest(userMsg.content, finalResponseText.length);

          useTokenStore.getState().consumeTokens(tokensUsed);

          set((s) => ({
            isStreaming: false,
            streamingMessageId: null,
            abortController: null,
            messages: {
              ...s.messages,
              [convId]: (s.messages[convId] || []).map((m) =>
                m.id === messageId
                  ? {
                      ...m,
                      isStreaming: false,
                      tokensUsed,
                      thinkingTimeSeconds: Math.max(0.6, thinkingTimeSeconds),
                    }
                  : m
              ),
            },
          }));
        }
      },

      editMessageAndResend: async (messageId, newContent) => {
        const state = get();
        const convId = state.activeConversationId;
        if (!convId || state.isStreaming) return;

        const msgList = state.messages[convId] || [];
        const targetIdx = msgList.findIndex((m) => m.id === messageId);
        if (targetIdx === -1) return;

        const trimmedMessages = msgList.slice(0, targetIdx);
        set((s) => ({
          messages: {
            ...s.messages,
            [convId]: trimmedMessages,
          },
        }));

        await get().sendMessage(newContent);
      },

      rateMessage: (messageId, rating) => {
        const { activeConversationId } = get();
        if (!activeConversationId) return;

        set((state) => ({
          messages: {
            ...state.messages,
            [activeConversationId]: (state.messages[activeConversationId] || []).map((m) =>
              m.id === messageId ? { ...m, rating } : m
            ),
          },
        }));
      },

      syncFromCloud: async (userEmail: string) => {
        if (!userEmail || userEmail === "guest_user") return;
        try {
          const res = await fetch(`/api/chat/sync?userEmail=${encodeURIComponent(userEmail)}`);
          const data = await res.json();
          if (data.success && data.conversations) {
            set((state) => {
              const localConvs = state.conversations || [];
              const cloudConvs = data.conversations || [];

              // Merge conversations by ID
              const convMap = new Map<string, Conversation>();
              localConvs.forEach((c) => convMap.set(c.id, c));
              cloudConvs.forEach((c: Conversation) => convMap.set(c.id, c));

              const mergedConversations = Array.from(convMap.values()).sort(
                (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
              );

              // Merge messages by ID per conversation
              const mergedMessages = { ...state.messages };
              if (data.messages) {
                Object.keys(data.messages).forEach((convId) => {
                  const cloudList = data.messages[convId] || [];
                  const localList = mergedMessages[convId] || [];
                  const msgMap = new Map<string, Message>();
                  localList.forEach((m) => msgMap.set(m.id, m));
                  cloudList.forEach((m: Message) => msgMap.set(m.id, m));
                  mergedMessages[convId] = Array.from(msgMap.values()).sort(
                    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                  );
                });
              }

              return {
                conversations: mergedConversations,
                messages: mergedMessages,
              };
            });
          }
        } catch (e) {
          console.error("Non-fatal: Cloud chat sync failed:", e);
        }
      },
    }),
    {
      name: "gml-chat-storage",
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages,
        activeModelId: state.activeModelId,
        isOpMode: state.isOpMode,
      }),
    }
  )
);
