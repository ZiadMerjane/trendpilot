# TrendPilot (Open Rebuild)
A Next.js 14 + TypeScript + Tailwind app that mirrors your Rocket build and adds an open foundation for AI + backend.

## Quickstart
```bash
npm i
npm run dev
# open http://localhost:3000
```

## Key Routes
- `/dashboard` — trend ideas (mock)
- `/ideas/[id]` — idea details
- `/projects` — project list
- `/projects/create?idea=ID` — accept idea to project
- `/projects/[id]` — workspace (+ link to builder)
- `/builder/[projectId]` — AppSpec + component tree
- `/visual-editor?project=ID` — JSON Patch editor

## Notes
- State persisted in localStorage via Zustand.
- Replace mocks in `lib/mock-ideas.json`.
- This repo is intentionally minimal so you can extend quickly (Supabase, OpenAI, etc.).
