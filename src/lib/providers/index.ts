import { AIProvider } from "./AIProvider";
import { MockAIProvider } from "./MockAIProvider";
import { DeepSeekProvider } from "./DeepSeekProvider";

export * from "./AIProvider";
export * from "./MockAIProvider";
export * from "./DeepSeekProvider";

/**
 * DeepSeek is the Master Engine for all models across the platform.
 * Regardless of what model card the user selects on the UI,
 * DeepSeek AI powers every generation behind the scenes.
 */
export function getAIProvider(providerName?: string): AIProvider {
  return new DeepSeekProvider();
}
