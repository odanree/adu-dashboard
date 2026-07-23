# .audit

Anti-pattern instrumentation ledger. Auto-managed — do not hand-edit.

## What's here

- **`counts.jsonl`** — one row per commit-to-`master`. Appended by
  `.github/workflows/antipattern-counts.yml` after every merge that
  touches `packages/ui/**`. Format:

  ```json
  {"ts": "2026-07-23T12:00:00Z", "sha": "abc1234", "tier1_you_might_not_need_effect": 8}
  ```

  Query:
  ```bash
  # Count trajectory over time
  jq -r '[.ts, .tier1_you_might_not_need_effect] | @tsv' .audit/counts.jsonl
  ```

## The tier this ledger measures

| Tier | What | Signal | Landing spot |
|---|---|---|---|
| 1 | ESLint `you-might-not-need-an-effect` (10 rules) | CI static analysis | This file (`counts.jsonl`) |

Tier 1 is the only tier with a CI-time count because it's the only one
with a static-analysis signal. Future tiers (React `<Profiler>` runtime
telemetry) would need a running environment to produce data and would
sink elsewhere (Hetzner disk, etc.).

## Baseline

**8 findings** at seed time — clustered in two files:

- `src/components/ProgressBar.tsx` (3 findings)
- `src/hooks/useAuth.ts` (5 findings)

Both are the `no-initialize-state` + `no-event-handler` pattern class —
`useEffect` doing what a `useState` initializer or an event handler
should do directly. Fixable in single-file PRs.

## Ratcheting policy

The `antipattern-lint` job in `.github/workflows/tests.yml` runs on
every PR. It computes the head count vs base count. If head > base, the
job **hard-fails** and posts a comment showing the delta. This means
the baseline can only trend down over time — a PR that would add new
findings must fix them first.

If you WANT to add an anti-pattern (e.g. a deliberate escape hatch), you
have to explain in the PR why the count went up and either revert
before merge or bake a tolerance into the workflow.

## Templated from

`wildlife-detector` (private repo). Same tier-1 mechanism proven there:
tier-1 count trajectory 13 → 17 → 16 → 12 across five PRs, with the
regression at 17 caught and reverted via a follow-up PR — validated
both directions.
