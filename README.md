# Goomairu AI (กูไม่รู้ เอไอ)

A Production-Grade Multi-Model AI Chat Platform and Workspace Architecture Built on Next.js 16 (App Router), TypeScript, Tailwind CSS, and Neon PostgreSQL.

Official Domain: **[https://goomairu.vercel.app/](https://goomairu.vercel.app/)**  
Creator: **satetapong sanguansuk**

---

## Overview

**Goomairu AI** is an advanced artificial intelligence workspace designed for multi-model interactions, conversational agent orchestration, and contextual workflow management. The system is powered by **DeepSeek** as the central reasoning engine while supporting seamless switching across models like Google Gemini 3.1 Pro / Flash Lite, Claude 3.7 Sonnet, GPT-5.6 Terra, Microsoft Copilot, Grok 3, and Qwen 2.5.

---

## Architectural Highlights

- **Master Engine**: DeepSeek V3 optimized for lightning-fast latency, high accuracy, and low token consumption.
- **Multi-Model Catalog**: Switch dynamically between Gemini, Claude, GPT, Copilot, Grok, and Goomairu models with reactive brand icons.
- **Real-Time Admin Control**: Admin panel supporting `/op` / `/deop` role assignment, account suspension (ban/unban), and token limit customization directly on Neon PostgreSQL.
- **Export & Tools**: 1-click Markdown chat export, interactive prompt cards, and quota telemetry.

---

## Tech Stack

| Domain | Technology | Version |
| :--- | :--- | :--- |
| Framework | Next.js (App Router, Turbopack) | 16.3.3 |
| Database | Neon PostgreSQL (Serverless) | Latest |
| Runtime | Node.js | >= 20.x |
| Core Language | TypeScript | 5.x |
| State Engine | Zustand | 5.0.3 |
| Iconography | Lucide React | 0.475.0 |
| Styling | Tailwind CSS | 4.0.6 |

---

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/satetapongsa/Goomairu.git
cd Goomairu
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env.local` file in the root directory:
```env
DEEPSEEK_API_KEY=your_deepseek_api_key
NEXTAUTH_URL=https://goomairu.vercel.app
NEXTAUTH_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DATABASE_URL=your_neon_postgres_url
```

4. Build or start development server:
```bash
npm run build
npm run dev
```

---

## License

This project is licensed under the MIT License - created by satetapong sanguansuk.
