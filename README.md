# LeadWithNadine Content Machine

A private, mobile-first AI content studio for the LeadWithNadine brand.

The app turns raw leadership notes, voice memo transcripts, workplace situations, and observations into premium leadership communication content in the LeadWithNadine voice: grounded, direct, emotionally intelligent, operationally credible, psychologically sharp, calm, and concise.

## Features

- Mobile-first content generation workflow
- Premium dark executive studio UI
- Tone selector for LeadWithNadine voice modes
- Content type filters and tabs
- LinkedIn posts, TikTok captions, hooks, carousel concepts, CTAs, visual prompts, threads, leadership rewrites, and YouTube Shorts assets
- Copy, save, regenerate, draft saving, recent generations, and content history
- Server-only OpenAI integration
- Local browser persistence for drafts, saved outputs, and recent generations
- Vercel-ready Next.js project structure

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- OpenAI JavaScript SDK
- Lucide React icons

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Add your OpenAI key:

```bash
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-5.2
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `OPENAI_API_KEY` | Yes | OpenAI API key used by the server-only generation route. |
| `OPENAI_MODEL` | No | Model used for generation. Defaults to `gpt-5.2`. |

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```

## Vercel Deployment

This project is ready to deploy on Vercel.

1. Import the GitHub repository into Vercel.
2. Add `OPENAI_API_KEY` in Vercel Project Settings.
3. Optionally add `OPENAI_MODEL`.
4. Deploy with the default Next.js settings.

The OpenAI key is only used server-side in `app/api/generate/route.ts`.

## Brand Direction

LeadWithNadine:

> Stop overexplaining. Start leading.

The content system is designed for difficult conversations, overexplaining, frontline leadership, emotional control, women stepping into authority, calm authority, communication clarity, new manager confidence, and leadership under pressure.

The app intentionally avoids motivational fluff, corporate jargon, fake inspiration, influencer language, exaggerated hype, and playful SaaS styling.
