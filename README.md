# Survey Platform (MVP)

A full-featured survey builder and runtime. MVP implements a basic builder, publish flow, submissions API, responses dashboard with CSV export, and signed webhooks stubs.

Hosting target: AWS Amplify. Stack: Next.js (App Router) + TypeScript + Tailwind + Prisma + PostgreSQL + Redis + S3-compatible storage.

## Quick start (local)

- Prereqs: Node 20+, pnpm, Docker
- Copy .env.example to .env and adjust if needed
- Start services: `docker compose -f infra/docker-compose.yml up -d`
- Install deps: `pnpm install`
- Generate Prisma client: `pnpm --filter web prisma generate`
- Dev server: `pnpm dev` (http://localhost:3000)

## Apps and packages

- apps/web: Next.js app (admin builder + public runtime)

## Roadmap highlights (documented in ROADMAP.md)

- Real-time collaboration (not in MVP)
- Payments and Scheduling integrations (future)
- Custom domains and embed modes (future)
- Authentication (stubbed now; full in later phase)
- Advanced branding/theming (future)

## Deploy (AWS Amplify)

- Connect this repo in Amplify Hosting and use the included `amplify.yml`.
- Configure environment variables for DATABASE_URL, Redis, and S3.
- For SSR, Amplify detects Next.js automatically in apps/web.

## Scripts

- `pnpm dev` – run Next.js app
- `pnpm prisma:generate` – generate Prisma client
- `pnpm prisma:migrate` – apply dev migrations (requires DB)
- `pnpm build` – build all

## Notes

- Authentication is stubbed and documented for a later phase.
- Real-time collaboration is not included in the MVP; tracked on the roadmap.