# Brag

> A **local-first, privacy-first** record of your achievements — and the goals,
> people, and energy behind them.

Keep track of the wins you'll forget by review season: the goals you set, the
people you mentor, the enablement you run, and a weekly energy check-in to catch
burnout before it catches you.

Everything lives in your browser — SQLite via OPFS. **No server, no sync, no
account.** Your data never leaves your machine. Back it up to JSON, or export a
Markdown "brag doc" for reviews whenever you like.

<!-- Screenshots coming soon — UI is being polished. -->

## What's inside

- 🏆 **Achievements** — log wins with Markdown notes, impact, tags, and an optional goal link
- 🎯 **Goals** — yearly goals grouped by year, with status and progress
- 🤝 **Mentoring** — the people you mentor and a log of every session
- 🎤 **Enablement** — workshops, talks, training, and docs you delivered
- 🔋 **Energy** — a weekly reflection (energy / workload / satisfaction) with a trend chart and a burnout-risk signal
- 📊 **Dashboard** — recent wins, goal progress, and energy trend at a glance
- 💾 **Settings** — JSON backup & restore, and Markdown brag-doc export by date range

## Quick start

```bash
make install   # install dependencies (pnpm)
make watch     # dev server at http://localhost:3000
```

| Command            | What it does                        |
| ------------------ | ----------------------------------- |
| `make watch`       | Dev server with hot reload          |
| `make build`       | Production build (SPA)              |
| `make validate`    | Lint (oxlint + ESLint) + typecheck  |
| `make test`        | Run the unit/schema test suite      |
| `make db-generate` | Generate + embed Drizzle migrations |

## Data & privacy

All data is stored locally in OPFS and is specific to this browser profile.
There is no telemetry and nothing leaves your device. Use **Settings → Export
JSON** regularly to keep a backup — clearing browser storage will erase it.

## Stack

- **Nuxt 4** · **Vue 3** · **Nuxt UI 4** · **Tailwind 4**
- **SQLocal** (SQLite WASM + OPFS) · **Drizzle ORM** · **drizzle-zod**
- **TipTap** WYSIWYG editor that stores **Markdown**
- **Vitest** · **oxlint / ESLint / oxfmt** quality gates enforced on commit via **Husky**

## Roadmap

Brag is in early dogfooding — the plan is to use it daily for a month before
calling it stable. Coming next:

- 📸 Screenshots and a short walkthrough (once the UI settles)
- 📚 Proper docs
- ✨ Polish driven by real-world use

> ⚠️ Early days: expect rough edges and the occasional breaking change while the
> schema settles. Keep a JSON backup.

---

Built for the wins you'd otherwise forget.
