# Clinic Copilot BD

AI clinical documentation and patient communication assistant for low-resource clinics in Bangladesh.

This is the hackathon build for CloudCamp's Infinity AI BuildFest: a fast, bilingual clinic workflow that turns Bengali/English intake notes into structured visit summaries, doctor checklists, patient-friendly discharge instructions, and follow-up tasks.

## Product Positioning

Clinic Copilot BD is not a diagnosis or prescription engine. It is a clinical workflow copilot that helps trained clinicians document visits faster, ask better intake questions, communicate clearly with patients, and spot safety red flags.

## Core Demo

- Temporary email/password clinic access
- Reception intake in Bangla or English
- AI generated chief complaint, timeline, severity, missing questions, and red flags
- Doctor console with SOAP note, checklist, and safety framing
- Patient handout in Bangla/English with medicine schedule and return warnings
- Medicine safety clarity checker
- Voice intake where browser speech recognition is available
- Realtime case board powered by Convex
- Clinic trend dashboard for anonymized severity/follow-up signals
- Responsive mobile-first interface for clinic desks and phones

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Convex backend
- Vercel AI SDK 6
- Google Gemini provider through `@ai-sdk/google`
- Biome for linting and formatting

## Environment

Convex is already configured in `.env.local`.

Add a Gemini key for live AI generation:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

Optional model override:

```bash
GOOGLE_GENERATIVE_AI_MODEL=gemini-2.5-flash
```

Without an API key, the app uses a polished demo response so the UI remains fully presentable.

## Development

```bash
bun install
bun run dev
```

In a second terminal, run Convex when changing backend functions:

```bash
npx convex dev
```

Quality checks:

```bash
bun run lint
bun run build
```

## Safety Principles

- AI output is marked as draft clinical documentation.
- The product avoids diagnosis claims.
- Clinicians remain responsible for medical decisions.
- Patient-facing output uses plain language and urgent-return warnings.
- Demo data should be fake or anonymized.

## Temporary Auth

The current hackathon build uses a deliberately simple email/password flow stored
in Convex. This is only for demo gating and per-user workspace separation. Replace
it with production authentication before handling real users or real patient data.
