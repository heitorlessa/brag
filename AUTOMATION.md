# Automating Brag — agent ingestion guide

This document tells an AI agent (or any script) how to **add data to Brag**
quickly and cheaply. Brag is **local-first**: the database is SQLite stored in
your browser's **OPFS**, so all writes happen *inside a browser page*. There is
no server to POST to.

> **Token tip:** browser automation is only expensive when the agent *reads*
> pages (DOM snapshots / screenshots) to decide what to click. Ingestion here is
> **blind, scripted execution** — one `page.evaluate(...)` call with a JSON
> payload, or appending a file. No page reading required. Keep it that way.

---

## The one rule: OPFS is per-browser-profile

Data lives in the OPFS of **the exact browser profile that has Brag open**. A
throwaway/headless browser writes to its *own* empty OPFS — invisible to the
Brag tab you actually look at. So choose a path that writes to **your** profile:

| Path | Writes to your real data? | Needs a tab open? | Best for |
| --- | --- | --- | --- |
| **A. `window.brag` over CDP** | ✅ (drives your Chrome) | yes | local, fully automated |
| **B. Append-from-file** | ✅ | no | anywhere, incl. deployed |
| **C. WebMCP tools** | ✅ if the agent runs in your browser | yes | WebMCP-capable hosts |
| Fresh headless Playwright | ❌ throwaway profile | — | avoid for real data |

For **fast local ingestion**, use **A** (full automation) or **B** (simplest).

---

## Path A — `window.brag` by driving your real Chrome (CDP)

Every Brag page exposes a `window.brag` API. To make writes land in *your*
data, attach to your already-running Chrome instead of launching a fresh one.

**1. Start the app and Chrome with a debugging port:**

```bash
make watch   # serves http://localhost:3000
# then launch (or relaunch) Chrome with remote debugging:
open -a "Google Chrome" --args --remote-debugging-port=9222   # macOS
# open http://localhost:3000 in a tab and leave it open
```

**2. Connect and call the API (Node + Playwright):**

```js
import { chromium } from "playwright";

const browser = await chromium.connectOverCDP("http://localhost:9222");
const ctx = browser.contexts()[0];
const page =
  ctx.pages().find((p) => p.url().includes("localhost:3000")) ??
  (await ctx.newPage());
if (!page.url().includes("localhost:3000")) {
  await page.goto("http://localhost:3000");
}

// Blind write — no DOM reading:
const result = await page.evaluate(async (payload) => {
  return await window.brag.importMerge(payload);
}, {
  achievements: [
    { title: "Shipped X", occurredAt: "2026-06-01", impact: "Cut latency 40%", tags: ["launch"] },
  ],
  goals: [{ title: "Grow as a leader", year: 2026, progress: 30 }],
});

console.log(result); // { goals: 1, achievements: 1, people: 0, ... }
await browser.close();
```

You can also just paste `await window.brag.importMerge({...})` into the
**DevTools console** of the open tab. Run `brag.help()` for a live reference.

### `window.brag` methods

```
brag.addAchievement(input)   -> created row
brag.addGoal(input)          -> created row
brag.addPerson(input)        -> created row
brag.addSession(input)       -> created row   // input.personId required
brag.addEnablement(input)    -> created row
brag.setEnergy(input)        -> upserts the week
brag.importMerge(payload)    -> { counts }    // appends; never replaces
brag.listAchievements() / listGoals() / listPeople() / listSessions() / listEnablement() / listEnergy()
brag.exportAll()             -> full JSON snapshot
brag.help()                  -> usage text
```

---

## Path B — Append from a JSON file (no browser automation)

Cheapest and works even on the deployed app. The agent just **writes a JSON
file**; a human appends it in one click.

1. Agent writes a file in the **merge-payload** shape (see below), e.g.
   `brag-ingest.json`.
2. In Brag: **Settings → Backup & restore → Append from file** → pick the file.
3. Records are added; existing data is untouched.

The file may be a merge payload **or** a full Brag backup (`{ "app": "brag",
"data": { ... } }`). Append never replaces — use **Import (replace)** for a full
restore.

---

## Path C — WebMCP tools

If the browser exposes the W3C `navigator.modelContext` API (Chrome WebMCP
preview, or an extension that injects it), Brag auto-registers these tools, so a
WebMCP-capable agent can call them with no glue code:

```
brag_add_achievement   brag_add_goal     brag_add_enablement
brag_add_person        brag_set_energy   brag_import_merge
brag_list_achievements brag_export
```

Tool inputs mirror the data model below.

---

## Data model (input shapes)

All dates are **`YYYY-MM-DD`** strings. `id`, `createdAt`, `updatedAt` are
generated for you — never send them. Markdown is accepted in text fields.

### Achievement — `addAchievement`
| field | type | required | notes |
| --- | --- | --- | --- |
| `title` | string | ✅ | |
| `occurredAt` | date | ✅ | when it happened |
| `description` | string (md) | – | what happened |
| `impact` | string (md) | – | why it mattered |
| `category` | string | – | e.g. "Delivery" |
| `tags` | string[] | – | e.g. `["launch","oss"]` |
| `goalId` | string \| null | – | link to a goal (must already exist) |

### Goal — `addGoal`
| field | type | required | notes |
| --- | --- | --- | --- |
| `title` | string | ✅ | |
| `year` | integer | ✅ | e.g. `2026` |
| `category` | string | – | |
| `status` | enum | – | `not_started` \| `in_progress` \| `done` \| `dropped` (default `not_started`) |
| `progress` | integer 0–100 | – | default `0` |
| `description` | string (md) | – | |
| `targetDate` | date \| null | – | |

### Person (mentee) — `addPerson`
| field | type | required | notes |
| --- | --- | --- | --- |
| `name` | string | ✅ | |
| `role` | string | – | |
| `relationship` | enum | – | `ad_hoc` \| `regular` (default `ad_hoc`) |
| `cadence` | string | – | e.g. "Biweekly" |
| `notes` | string (md) | – | |
| `active` | boolean | – | default `true` |
| `startedAt` | date \| null | – | |

### Mentoring session — `addSession`
| field | type | required | notes |
| --- | --- | --- | --- |
| `personId` | string | ✅ | id of an existing person |
| `date` | date | ✅ | |
| `topic` | string | – | |
| `notes` | string (md) | – | |

### Enablement — `addEnablement`
| field | type | required | notes |
| --- | --- | --- | --- |
| `title` | string | ✅ | |
| `type` | enum | – | `workshop` \| `talk` \| `training` \| `doc` \| `review` \| `office_hours` (default `workshop`) |
| `date` | date | ✅ | |
| `audience` | string | – | |
| `attendees` | integer \| null | – | |
| `link` | string \| null | – | slides / doc / recording |
| `notes` | string (md) | – | |

> Use `type: "review"` for documents/strategy/posts you were asked to review.

### Energy reflection — `setEnergy` (upsert by week)
| field | type | required | notes |
| --- | --- | --- | --- |
| `weekStart` | date | ✅ | **must be a Monday** (ISO week start) |
| `energy` | integer 1–5 | ✅ | |
| `workload` | integer 1–5 | ✅ | |
| `satisfaction` | integer 1–5 | ✅ | |
| `note` | string (md) | – | |

One row per week; calling again for the same `weekStart` overwrites it.

---

## `importMerge` payload shape

```jsonc
{
  "goals":       [ /* Goal inputs */ ],
  "achievements":[ /* Achievement inputs */ ],
  "people":      [ /* Person inputs */ ],
  "sessions":    [ /* Mentoring session inputs (need personId) */ ],
  "enablement":  [ /* Enablement inputs */ ],
  "energy":      [ /* Energy reflection inputs */ ]
}
```

All keys optional. Records are created in this order: goals → achievements →
people → sessions → enablement → energy.

### Linking caveat (important)

`importMerge` generates fresh ids, so it **cannot link rows created in the same
call**:

- To attach an **achievement to a goal**: create the goal first
  (`addGoal` → returns `{ id }`), then send the achievement with that `goalId`.
- To attach a **session to a person**: create the person first
  (`addPerson` → `{ id }`), then send the session with that `personId`.

Standalone records (no cross-references) are fine to batch in one `importMerge`.

---

## Recommended agent flow (local)

1. Ensure `make watch` is running and a Brag tab is open at
   `http://localhost:3000`.
2. Build the data from your source (notes, calendar, PRs, docs).
3. **Linked data** (goals↔achievements, people↔sessions): create parents first,
   capture returned ids, then create children with those ids.
4. **Everything else**: one `brag.importMerge({...})` call.
5. Verify with `brag.listAchievements()` etc., or just look at the open tab.

Keep it to scripted `evaluate`/file writes — never have the model read the DOM
to navigate. That's how this stays fast and cheap.
