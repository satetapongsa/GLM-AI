import { AIProvider, ChatProviderOptions, StreamChunk } from "./AIProvider";

/**
 * Google Gemini Provider implementation
 * Ready for GOOGLE_API_KEY environment variable.
 */
export class GoogleProvider implements AIProvider {
  name = "GoogleProvider";
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_API_KEY;
  }

  async *streamMessage(
    prompt: string,
    history: { role: "user" | "assistant" | "system"; content: string }[],
    options: ChatProviderOptions
  ): AsyncGenerator<StreamChunk> {
    if (!this.apiKey) {
      throw new Error("GOOGLE_API_KEY is not configured on the server");
    }
    // Production implementation would call Google Generative AI SDK
    // and yield chunks seamlessly.
    yield { content: "Google Gemini streaming connection...", delta: "", isComplete: true };
  }

  async sendMessage(
    prompt: string,
    history: { role: "user" | "assistant" | "system"; content: string }[],
    options: ChatProviderOptions
  ) {
    if (!this.apiKey) {
      throw new Error("GOOGLE_API_KEY is not configured on the server");
    }
    return { content: "Google Gemini response" };
  }
}
