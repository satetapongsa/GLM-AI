import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Conversation, Message, Attachment } from "@/lib/types";
import { INITIAL_CONVERSATIONS, INITIAL_MESSAGES } from "@/lib/config/defaultData";
import { DEFAULT_MODEL_ID, AVAILABLE_MODELS } from "@/lib/config/models";
import { getAIProvider } from "@/lib/providers";
import { calculateTokensForRequest, useTokenStore } from "@/lib/store/useTokenStore";

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

  // Actions
  setActiveConversation: (id: string | null) => void;
  setActiveModel: (modelId: string) => void;
  setComposerText: (text: string) => void;
  addComposerAttachment: (attachment: Attachment) => void;
  removeComposerAttachment: (id: string) => void;
  clearComposerAttachments: () => void;

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

      setActiveConversation: (id) => set({ activeConversationId: id }),

      setActiveModel: (modelId) => set({ activeModelId: modelId }),

      setComposerText: (text) => set({ composerText: text }),

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
          title: title || "บทสนทนาใหม่",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          pinned: false,
          modelId: modelId || get().activeModelId,
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

        return newId;
      },

      renameConversation: (id, newTitle) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title: newTitle, updatedAt: new Date().toISOString() } : c
          ),
        })),

      togglePinConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, pinned: !c.pinned } : c
          ),
        })),

      deleteConversation: (id) =>
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
        }),

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

        const controller = new AbortController();
        set({ abortController: controller });
        const startTime = performance.now();
        let finalResponseText = "";

        try {
          const history = (get().messages[convId] || [])
            .filter((m) => m.id !== assistantMessageId)
            .map((m) => ({ role: m.role, content: m.content }));

          // Try calling Next.js streaming API route first
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: promptText,
              modelId: state.activeModelId,
              history,
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
            // Direct client fallback
            const provider = getAIProvider(currentModel?.provider);
            const stream = provider.streamMessage(promptText, history, {
              modelId: state.activeModelId,
              signal: controller.signal,
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
        } catch (err: unknown) {
          if ((err as Error).name !== "AbortError") {
            set((s) => {
              const currentList = s.messages[convId as string] || [];
              return {
                messages: {
                  ...s.messages,
                  [convId as string]: currentList.map((m) =>
                    m.id === assistantMessageId
                      ? {
                          ...m,
                          isError: true,
                          errorMessage: "เกิดข้อผิดพลาดในการตอบกลับ โปรดลองใหม่อีกครั้ง",
                          isStreaming: false,
                        }
                      : m
                  ),
                },
              };
            });
          }
        } finally {
          const thinkingTimeSeconds = Number(((performance.now() - startTime) / 1000).toFixed(1));
          const tokensUsed = calculateTokensForRequest(promptText, finalResponseText.length);
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
          const history = msgList.slice(0, targetIdx).map((m) => ({ role: m.role, content: m.content }));
          const currentModel = AVAILABLE_MODELS.find((m) => m.id === state.activeModelId);
          const provider = getAIProvider(currentModel?.provider);

          const stream = provider.streamMessage(userMsg.content, history, {
            modelId: state.activeModelId,
            signal: controller.signal,
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
          // error handled
        } finally {
          const thinkingTimeSeconds = Number(((performance.now() - startTime) / 1000).toFixed(1));
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
        const editIdx = msgList.findIndex((m) => m.id === messageId);
        if (editIdx === -1) return;

        const prunedMessages = msgList.slice(0, editIdx);
        set((s) => ({
          messages: {
            ...s.messages,
            [convId]: prunedMessages,
          },
        }));

        await get().sendMessage(newContent);
      },

      rateMessage: (messageId, rating) => {
        const state = get();
        const convId = state.activeConversationId;
        if (!convId) return;

        set((s) => ({
          messages: {
            ...s.messages,
            [convId]: (s.messages[convId] || []).map((m) =>
              m.id === messageId ? { ...m, rating } : m
            ),
          },
        }));
      },
    }),
    {
      name: "gml-chat-storage",
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages,
        activeModelId: state.activeModelId,
      }),
    }
  )
);
