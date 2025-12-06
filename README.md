# Badminton analytics (web)

Mono-repo using Turborepo + Next.js + Tailwind + Neon (Postgres) for personal badminton match/rally tracking. Data is stored in the cloud and can later plug into video/model analysis.

## Structure
- `apps/web`: Next.js (App Router), Tailwind UI, server actions.
- `packages/db`: Drizzle ORM schema/client for Neon.

## Getting started
```bash
npm install
npm run dev
```

Set env (root `.env`):
```
NEON_DATABASE_URL=postgres://user:password@host/dbname
NEXT_PUBLIC_APP_NAME=Badminton Analytics
```

Useful scripts:
- `npm run dev` – run all dev servers via Turborepo.
- `npm run build` – build all.
- `npm run lint` – lint.
- `npx drizzle-kit generate` – generate SQL migrations from schema (uses `drizzle.config.ts`).