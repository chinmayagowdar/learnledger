# LearnLedger

A blockchain credential management platform where users complete 3-round skill assessments to earn verifiable credentials with QR codes and shareable blockchain hashes.

## Run & Operate

- `pnpm --filter @workspace/learn-ledger run dev` — run the LearnLedger web app (port 22035)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4 (oklch colors), Framer Motion
- Routing: Wouter
- State: Zustand (persisted to localStorage)
- Charts: Recharts
- Theme: next-themes (dark default)
- QR codes: qrcode.react
- Confetti: canvas-confetti
- No real backend — all data is mock/in-memory

## Where things live

- `artifacts/learn-ledger/` — main React+Vite app
- `artifacts/learn-ledger/src/pages/` — Dashboard, Assessments, Quiz, Credentials, Skills, Verify, VerifyHash
- `artifacts/learn-ledger/src/components/` — all UI components (NavBar, Sidebar, CredentialCard, QuizCard, etc.)
- `artifacts/learn-ledger/src/lib/` — store (zustand), mock-data, blockchain utilities
- `artifacts/learn-ledger/src/index.css` — Tailwind v4 theme with oklch colors and glassmorphism utilities

## Architecture decisions

- All data is mock — no Firebase or real DB, uses zustand persist for session state
- Glassmorphism design: `.glass` utility class + particle canvas background
- Dark mode default via next-themes with class strategy
- Wouter for routing (Next.js-to-Vite migration from `.migration-backup/`)
- Credential cards flip to reveal QR code on click, with confetti on first flip

## Product

- Dashboard: hero section with typewriter animation, stats cards, area chart, how-it-works section
- Assessments: tabbed list with progress bars, difficulty badges, start/view quiz flow
- Quiz: 5-question per assessment with answer explanation reveal and animated progress
- Results: score display, confetti celebration, credential earned flow
- Credentials: flip cards with QR codes, download/copy share links
- Verify: public credential verification page with blockchain hash display

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Sidebar width transitions affect main content `ml` — uses `md:ml-[260px]` fixed offset
- BASE_URL is set via Vite and must be stripped of trailing slash for Wouter base prop
- `qrcode.react` uses named export `QRCodeSVG`, not default export

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Migration source preserved in `.migration-backup/` (original Next.js app)
