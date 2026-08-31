import { AIProvider, ChatProviderOptions, StreamChunk } from "./AIProvider";

/**
 * OpenAI Provider implementation
 * Ready for OPENAI_API_KEY environment variable.
 */
export class OpenAIProvider implements AIProvider {
  name = "OpenAIProvider";
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;
  }

  async *streamMessage(
    prompt: string,
    history: { role: "user" | "assistant" | "system"; content: string }[],
    options: ChatProviderOptions
  ): AsyncGenerator<StreamChunk> {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is not configured on the server");
    }
    yield { content: "OpenAI streaming connection...", delta: "", isComplete: true };
  }

  async sendMessage(
    prompt: string,
    history: { role: "user" | "assistant" | "system"; content: string }[],
    options: ChatProviderOptions
  ) {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is not configured on the server");
    }
    return { content: "OpenAI response" };
  }
}
