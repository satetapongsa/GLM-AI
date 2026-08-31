export type Role = "user" | "assistant" | "system";

export type MessageRating = "like" | "dislike" | null;

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  previewUrl?: string;
  content?: string;
  status: "uploading" | "complete" | "error";
  progress?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: Role;
  content: string;
  createdAt: string;
  modelId?: string;
  modelName?: string;
  attachments?: Attachment[];
  rating?: MessageRating;
  isStreaming?: boolean;
  isError?: boolean;
  errorMessage?: string;
  reasoning?: string;
  executionTimeMs?: number;
  tokensUsed?: number;
  thinkingTimeSeconds?: number;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
  archived?: boolean;
  modelId: string;
  assistantId?: string;
  folderId?: string;
  lastMessageSnippet?: string;
  messageCount: number;
}

export type ModelCategory =
  | "all"
  | "recommended"
  | "chat"
  | "reasoning"
  | "coding"
  | "research"
  | "image"
  | "video"
  | "music"
  | "fast"
  | "advanced"
  | "google"
  | "openai"
  | "anthropic"
  | "meta"
  | "mistral"
  | "deepseek"
  | "xai"
  | "qwen";

export type ModelCapability =
  | "Reasoning"
  | "Coding"
  | "Vision"
  | "Fast"
  | "Creative"
  | "Long Context"
  | "Research"
  | "Audio"
  | "Multimodal";

export type AIProviderName =
  | "Google"
  | "OpenAI"
  | "Anthropic"
  | "Meta"
  | "Mistral"
  | "DeepSeek"
  | "xAI"
  | "Qwen"
  | "Cohere"
  | "Flux"
  | "Sora"
  | "Suno";

export interface Model {
  id: string;
  name: string;
  provider: AIProviderName;
  description: string;
  category: ModelCategory[];
  capabilities: ModelCapability[];
  contextWindow: string;
  speed: "Ultra Fast" | "Fast" | "Balanced" | "Deep Reasoning";
  isNew?: boolean;
  isPopular?: boolean;
  isPro?: boolean;
  isFeatured?: boolean;
  defaultTemperature?: number;
  maxTokens?: number;
  iconUrl?: string;
}

export interface ModelCustomSettings {
  temperature: number;
  maxTokens: number;
  reasoningLevel: "low" | "medium" | "high";
  responseStyle: "precise" | "balanced" | "creative";
  webSearch: boolean;
  codeInterpreter: boolean;
  imageUnderstanding: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  iconName: string;
  category: "compare" | "creative" | "analysis" | "generation" | "coding" | "business";
  suggestedPrompt: string;
}

export type PromptCategory =
  | "Marketing"
  | "Coding"
  | "Writing"
  | "Research"
  | "Business"
  | "Design"
  | "Productivity";

export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: PromptCategory;
  tags: string[];
  isFavorite: boolean;
  isCustom?: boolean;
  author?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Assistant {
  id: string;
  name: string;
  avatar: string;
  tagline: string;
  description: string;
  systemPrompt: string;
  modelId: string;
  temperature: number;
  tools: string[];
  knowledgeFiles?: string[];
  isPinned?: boolean;
  isBuiltIn?: boolean;
  createdAt: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: "document" | "image" | "pdf" | "code" | "audio" | "archive" | "other";
  mimeType: string;
  size: number;
  uploadedAt: string;
  url: string;
  previewUrl?: string;
  conversationId?: string;
  tags: string[];
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  conversationIds: string[];
  createdAt: string;
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  defaultModelId: string;
  enterToSend: boolean;
  streamingSpeed: "natural" | "instant" | "cinematic";
  soundEffects: boolean;
  showDisclaimer: boolean;
  autoSaveHistory: boolean;
  systemPromptPreset: string;
  temperature: number;
}
