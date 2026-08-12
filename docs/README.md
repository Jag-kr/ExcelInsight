# ExcelInsight docs

| Area | Start here |
|---|---|
| Design system — tokens, colour, type, motion, components | [design/README.md](design/README.md) |
| Animation techniques used by the design system | [animations/README.md](animations/README.md) |
| Product analytics — the shipped event taxonomy | [analytics/events.md](analytics/events.md) |

## Conventions

- **Living docs** describe what is in `main` right now. `docs/design/`, `docs/animations/`
  and `docs/analytics/` are living docs — if you change the code, change these.
- **Historical records** are point-in-time and are never rewritten:
  `docs/superpowers/specs/` (design specs as approved) and `docs/superpowers/plans/`
  (task-by-task execution plans). A spec that has shipped carries a status header
  pointing at the living doc that superseded it.

## Legacy files

- `IMPLEMENTATION_PATTERNS.tsx` — a 2026 scratch file of copy-paste responsive
  patterns (chart titles, dashboard grid, toolbars, tables, upload box, dialogs).
  It is not imported by anything and is not maintained. The patterns it proposed
  now live in the components themselves; prefer reading
  [design/components.md](design/components.md) and the real component source.
