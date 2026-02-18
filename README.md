# Seamanship Exam App

Project documentation is split into two source-of-truth files:

- Long-term product plan: `docs/product-plan.md`
- Current execution plan (MVP): `docs/mvp-plan.md`
- Decision history: `docs/decision-log.md`
- Agent collaboration guide: `docs/agent-workflow-guide.md`
- Agent cheat sheet: `docs/agent-cheatsheet.md`

Legacy planning file:

- `project.md` (archived pointer)

## Phase 1 Foundation

This repository now includes Phase 1 MVP foundation:

- Next.js app skeleton (`app/`, `middleware.js`, `next.config.mjs`)
- Firebase client/admin initialization modules (`src/lib/firebase/`)
- Auth allowlist and route-guard logic (`src/lib/auth/`)
- Hebrew RTL baseline layout and typography (`app/layout.js`, `app/globals.css`)
- Guard unit tests (`tests/`)

## Local Setup

1. Copy `.env.example` to `.env.local` and fill Firebase values.
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Run dev server: `npm run dev`

## Phase 2 Import Commands

- Dry-run (no uploads, no Firestore writes):  
`npm run import:phase2:dry`

- Full import (uploads assets + writes Firestore):  
`npm run import:phase2`

Script defaults:

- input: `test_material/data/questions-all.json`
- manifest: `test_material/data/assets/sq5-option-images.json`
- assets directory: `test_material/data/assets`
- report output: `test_material/data/reports/import-report.json`

Optional flags for `scripts/import-phase2.js`:

- `--dry-run`
- `--skip-upload`
- `--skip-firestore`
- `--limit <N>`
- `--collection <name>`
- `--storage-prefix <path>`
