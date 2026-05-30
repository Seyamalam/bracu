# Clinic Copilot BD

AI clinical documentation and patient communication assistant for low-resource clinics in Bangladesh.

This is the hackathon build for CloudCamp's Infinity AI BuildFest: a fast, bilingual clinic workflow that turns Bengali/English intake notes into structured visit summaries, doctor checklists, patient-friendly discharge instructions, and follow-up tasks.

## Product Positioning

Clinic Copilot BD is not a diagnosis or prescription engine. It is a clinical workflow copilot that helps trained clinicians document visits faster, ask better intake questions, communicate clearly with patients, and spot safety red flags.

## Core Demo

- Temporary email/password clinic access
- Judge demo mode with a 3-minute story rail
- Natural-language Command Copilot for operating the app by typing
- Current-case AI Q&A assistant
- Win Readiness scorecard for safety, accessibility, workflow coverage, and judge proof
- Reception intake in Bangla or English
- AI generated chief complaint, timeline, severity, missing questions, and red flags
- Doctor console with SOAP note, checklist, and safety framing
- Patient handout in Bangla/English with medicine schedule and return warnings
- Medicine safety clarity checker
- AI document extraction for prescription, lab, or OCR text
- AI risk explanation, staff handoff, approval guard, visit closeout, and next-step navigator
- AI referral, visit summary, patient question answer, reply triage, and follow-up scheduler
- Voice intake where browser speech recognition is available
- Realtime case board powered by Convex
- Clinic trend dashboard for anonymized severity/follow-up signals
- Impact snapshot for time saved, missing questions found, and red flags caught
- Clinician approval workflow and audit log viewer
- Follow-up due panel
- Full-screen presentation mode
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

Seed a judge-friendly demo account:

```bash
bunx convex run seed:demo
```

Default seeded login:

```txt
doctor@demo.clinic / demo1234
```

The seed command creates six fake Bangladesh-native cases for fever, cardiac
risk, child dehydration, dengue watch, pregnancy fever, and diabetic wound
follow-up.

Quality checks:

```bash
bun run lint
bun run build
bun run validate
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

## Demo Checklist

1. Create a temporary clinic account.
2. Pick a judge demo script from the intake panel.
3. Generate the clinical draft and review red flags.
4. Copy or print the patient handout.
5. Run the medicine safety checker.
6. Move the case to handout or follow-up from the live queue.
7. Show the Win Readiness card, anonymized trend dashboard, and audit log.
8. Close on the impact snapshot: minutes saved, questions found, red flags caught.

Command Copilot examples:

```txt
Load dengue watch and generate a draft
Switch to Bangla and open presentation mode
Approve this case and move it to handout
Check medicine safety for paracetamol 500mg and antibiotic twice daily
```

## Deployment Checklist

- Set `NEXT_PUBLIC_CONVEX_URL` for the deployed Convex project.
- Set `GOOGLE_GENERATIVE_AI_API_KEY` in the hosting provider and Convex env.
- Run `bunx convex deploy` for production Convex functions.
- Optionally run `bunx convex run seed:demo` before the judging session.
- Run `bun run validate` before creating the final demo build.
- Replace temporary password auth before any real-world pilot.
