# GLM-AI (GML / GooMiRu)

A Production-Grade Multi-Model AI Chat Platform and Workspace Architecture Built on Next.js 16 (App Router), TypeScript, and Tailwind CSS.

---

## Overview

GLM-AI is an enterprise-grade artificial intelligence workspace designed for multi-model interactions, conversational agent orchestration, and contextual workflow management. The system provides a decoupled provider layer capable of interfacing with leading foundational models while maintaining high-performance client-side rendering, resilient streaming state, and fine-grained token management.

---

## Architectural Highlights

- **Presentation Layer**: Built with React 19 and Next.js 16 App Router using server and client component boundaries for optimal rendering throughput.
- **Provider Abstraction Layer**: Decoupled interface architecture supporting unified stream processing across multiple AI providers including DeepSeek, Google Gemini, OpenAI, Anthropic, and Meta.
- **State Management**: Zustand-powered reactive state architecture with granular persistence strategies for conversation history, authentication state, model parameters, and daily token quotas.
- **Styling and Design System**: Custom Tailwind CSS utility tokens engineered for light and dark operational modes with WCAG AAA accessibility compliance.
- **Streaming Pipeline**: Server-Sent Events (SSE) and chunk-based reader pipeline supporting real-time token rendering, reasoning trace extraction, and execution abort controllers.

---

## Tech Stack

| Domain | Technology | Version |
| :--- | :--- | :--- |
| Framework | Next.js (App Router, Turbopack) | 16.3.3 |
| Runtime | Node.js | >= 20.x |
| Core Language | TypeScript | 5.x |
| State Engine | Zustand | 5.0.3 |
| Theme Controller | next-themes | 0.4.4 |
| Iconography | Lucide React | 0.475.0 |
| Styling | Tailwind CSS | 4.0.6 |

---

## Core Capabilities

### 1. Multi-Model Hub and Model Catalog
- Support for top-tier foundational models: DeepSeek (V3 & Reasoner), Google Gemini 3.1 Pro / Flash Lite, Claude 3.7 Sonnet / Opus 5, GPT-5.6 Terra, and Llama 4.
- Categorization by capability: Reasoning, Coding, Vision, Creative, Fast, Long Context, and Deep Research.
- Parameter calibration modal for temperature control, reasoning levels, web search augmentation, and code execution sandboxing.

### 2. DeepSeek API Integration Architecture
- Dedicated provider client supporting `https://api.deepseek.com` completions.
- Native stream parser for `reasoning_content` chunks (Chain-of-Thought) and `content` payloads.
- Automated fallback protocol ensuring continuity during network interruptions or missing credentials.

### 3. Token Quota and Performance Tracking
- Internal quota engine enforcing a standard daily allocation of 1,000 tokens.
- Algorithmic consumption calculation ranging from 1 to 12 tokens per interaction relative to payload complexity.
- Per-message telemetry exposing execution latency (seconds) and token consumption metrics.
- Real-time quota indicator embedded directly within the input composer interface.

### 4. Authentication and Access Control
- Integrated authentication modal supporting OAuth providers (Google, Microsoft, Apple) and traditional credential pipelines.
- Persistent session storage allowing instant account transitions and state isolation.

---

## Project Structure

```text
ai-chat-workspace/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts
│   │   │   ├── models/route.ts
│   │   │   ├── prompts/route.ts
│   │   │   └── files/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthModal.tsx
│   │   ├── chat/
│   │   │   ├── ChatComposer.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatView.tsx
│   │   │   ├── CodeBlock.tsx
│   │   │   ├── MessageActions.tsx
│   │   │   ├── QuickActionChips.tsx
│   │   │   └── WelcomeScreen.tsx
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── BrandLogo.tsx
│   │   │   ├── MobileDrawer.tsx
│   │   │   ├── MobileHeader.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── UserProfileMenu.tsx
│   │   ├── models/
│   │   │   ├── ModelCard.tsx
│   │   │   ├── ModelSelectorModal.tsx
│   │   │   └── ModelSettingsModal.tsx
│   │   ├── settings/
│   │   │   └── SettingsView.tsx
│   │   └── ui/
│   │       ├── Avatar.tsx
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Dropdown.tsx
│   │       ├── Modal.tsx
│   │       └── ProviderIcon.tsx
│   └── lib/
│       ├── config/
│       │   ├── brand.ts
│       │   ├── defaultData.ts
│       │   ├── models.ts
│       │   └── quickActions.ts
│       ├── providers/
│       │   ├── AIProvider.ts
│       │   ├── AnthropicProvider.ts
│       │   ├── DeepSeekProvider.ts
│       │   ├── GoogleProvider.ts
│       │   ├── MockAIProvider.ts
│       │   ├── OpenAIProvider.ts
│       │   └── index.ts
│       ├── store/
│       │   ├── useAuthStore.ts
│       │   ├── useChatStore.ts
│       │   ├── useModelStore.ts
│       │   ├── useSettingsStore.ts
│       │   ├── useTokenStore.ts
│       │   └── useUIStore.ts
│       ├── types/
│       │   └── index.ts
│       └── utils/
│           ├── cn.ts
│           └── formatters.ts
├── public/
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## Getting Started

### Prerequisites
- Node.js version 20.0.0 or higher
- npm, pnpm, or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/satetapongsa/GLM-AI.git
cd GLM-AI
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env.local` file in the root directory:
```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

The application will be accessible at `http://localhost:3000` (or `http://localhost:3005`).

---

## Production Build

To validate TypeScript compilation and create an optimized production build:

```bash
npm run build
npm run start
```

---

## License

This project is licensed under the MIT License.
