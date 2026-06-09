# Brag

A **local-first, privacy-first** record of achievements — plus the goals you set,
the people you mentor, the enablement you run, and a weekly energy check-in to
catch burnout before it catches you.

Everything lives in your browser (SQLite via OPFS). There is **no server and no
sync** — your data never leaves your machine. Back it up to JSON or export a
Markdown "brag doc" for reviews whenever you like.

## Stack

- **Nuxt 4** + **Vue 3** + **Nuxt UI 4** + **Tailwind 4**
- **SQLocal** (SQLite WASM + OPFS) + **Drizzle ORM** + **drizzle-zod**
- **TipTap** WYSIWYG editor that stores **Markdown** (`tiptap-markdown`)
- **Vitest** for unit + schema tests; **oxlint / ESLint / oxfmt** quality gates
  enforced on commit via **Husky**

## Getting started

```bash
make install   # install dependencies (pnpm)
make watch     # dev server at http://localhost:3000
```

## Common commands

| Command            | What it does                        |
| ------------------ | ----------------------------------- |
| `make watch`       | Dev server with hot reload          |
| `make build`       | Production build (SPA)              |
| `make validate`    | Lint (oxlint + ESLint) + typecheck  |
| `make test`        | Run the unit/schema test suite      |
| `make db-generate` | Generate + embed Drizzle migrations |

## Modules

- **Dashboard** — recent wins, goal progress, energy trend at a glance
- **Achievements** — log wins with Markdown notes, impact, tags, optional goal link
- **Goals** — yearly goals grouped by year with status + progress
- **Mentoring** — people you mentor (ad-hoc / regular) and per-person session logs
- **Enablement** — workshops, talks, training and docs you delivered
- **Energy** — a weekly reflection (energy / workload / satisfaction) with a trend
  chart and a burnout-risk signal
- **Settings** — JSON backup & restore, and Markdown brag-doc export by date range

## Data & privacy

All data is stored locally in OPFS and is specific to this browser profile.
Use **Settings → Export JSON** regularly to keep a backup, since clearing browser
storage will erase it.

## Editing the schema

Edit `app/local-db/schema.ts`, then run `make db-generate` to create the SQL
migration and embed it for the in-browser migrator (`app/local-db/migrate.ts`).
