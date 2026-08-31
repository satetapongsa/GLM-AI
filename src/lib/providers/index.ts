import { AIProvider } from "./AIProvider";
import { MockAIProvider } from "./MockAIProvider";
import { GoogleProvider } from "./GoogleProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { AnthropicProvider } from "./AnthropicProvider";
import { DeepSeekProvider } from "./DeepSeekProvider";

export * from "./AIProvider";
export * from "./MockAIProvider";
export * from "./GoogleProvider";
export * from "./OpenAIProvider";
export * from "./AnthropicProvider";
export * from "./DeepSeekProvider";

export function getAIProvider(providerName?: string): AIProvider {
  if (process.env.DEEPSEEK_API_KEY && providerName === "DeepSeek") {
    return new DeepSeekProvider();
  }
  if (process.env.GOOGLE_API_KEY && providerName === "Google") {
    return new GoogleProvider();
  }
  if (process.env.OPENAI_API_KEY && providerName === "OpenAI") {
    return new OpenAIProvider();
  }
  if (process.env.ANTHROPIC_API_KEY && providerName === "Anthropic") {
    return new AnthropicProvider();
  }

  // If DeepSeek model selected, return DeepSeekProvider (which handles fallback automatically)
  if (providerName === "DeepSeek") {
    return new DeepSeekProvider();
  }

  // Default to our rich MockAIProvider
  return new MockAIProvider();
}
