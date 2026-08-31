import { AIProvider, ChatProviderOptions, StreamChunk } from "./AIProvider";

/**
 * Anthropic Claude Provider implementation
 * Ready for ANTHROPIC_API_KEY environment variable.
 */
export class AnthropicProvider implements AIProvider {
  name = "AnthropicProvider";
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY;
  }

  async *streamMessage(
    prompt: string,
    history: { role: "user" | "assistant" | "system"; content: string }[],
    options: ChatProviderOptions
  ): AsyncGenerator<StreamChunk> {
    if (!this.apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured on the server");
    }
    yield { content: "Anthropic Claude streaming connection...", delta: "", isComplete: true };
  }

  async sendMessage(
    prompt: string,
    history: { role: "user" | "assistant" | "system"; content: string }[],
    options: ChatProviderOptions
  ) {
    if (!this.apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured on the server");
    }
    return { content: "Anthropic Claude response" };
  }
}
