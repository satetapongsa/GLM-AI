import { Attachment } from "@/lib/types";

export interface StreamChunk {
  content: string;
  delta: string;
  isComplete: boolean;
  reasoningDelta?: string;
  reasoningContent?: string;
}

export interface ChatProviderOptions {
  modelId: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  attachments?: Attachment[];
  signal?: AbortSignal;
  isOpMode?: boolean;
  onChunk?: (chunk: StreamChunk) => void;
}

export interface AIProvider {
  name: string;
  streamMessage(
    prompt: string,
    history: { role: "user" | "assistant" | "system"; content: string }[],
    options: ChatProviderOptions
  ): AsyncGenerator<StreamChunk>;
  sendMessage(
    prompt: string,
    history: { role: "user" | "assistant" | "system"; content: string }[],
    options: ChatProviderOptions
  ): Promise<{ content: string; reasoning?: string; tokensUsed?: number }>;
}
