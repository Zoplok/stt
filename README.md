# SubtitleAI — AI Subtitle Platform

A production-grade AI subtitle generation and editing platform built with Next.js 16, Prisma 7, and Neon PostgreSQL.

## Stack

- **Framework**: Next.js 16 (Turbopack, App Router)
- **Database**: Neon PostgreSQL via `@prisma/adapter-neon`
- **ORM**: Prisma 7
- **Auth**: Clerk
- **AI**: OpenAI Whisper, Deepgram, AssemblyAI
- **Styling**: TailwindCSS 4, Framer Motion
- **State**: Zustand
- **Storage**: AWS S3 (presigned uploads)

## Setup

```bash
# 1. Install dependencies (also runs prisma generate)
npm install

# 2. Configure environment
cp .env.example .env
# Fill in DATABASE_URL, CLERK keys, AI provider keys

# 3. Push schema to database
npx prisma migrate dev

# 4. Start dev server
npm run dev
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/dashboard` | Project list |
| `/projects/[id]` | Subtitle editor |
| `POST /api/projects/[id]/transcribe` | AI transcription |
| `POST /api/projects/[id]/export` | Export SRT/VTT/TXT/JSON/ASS |
| `POST /api/projects/[id]/translate` | AI translation |
| `POST /api/projects/[id]/ai-tools` | Summary / chapters / keywords |
| `GET /api/projects/[id]/progress` | SSE job progress |

## Deploy

Set all env vars from `.env.example` in your deployment platform. The `postinstall` script runs `prisma generate` automatically.
