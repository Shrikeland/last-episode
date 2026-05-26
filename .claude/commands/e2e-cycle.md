---
description: Run one iteration of the autonomous E2E cycle locally (same as scheduled-agent does)
---

You are entering the autonomous E2E cycle for this iteration.

Read `autotests-plans/driver-playbook.md` and execute exactly one phase
of the cycle, then commit the result on branch `e2e/autotests` and stop.

State file: `autotests-plans/state/cycle-state.json`
Working directory: repo root

Constraints:
- Execute MAXIMUM ONE phase per invocation.
- Always end with a commit (even if just updating cycle-state.json with `blocked`).
- Never modify files outside the repo or files unrelated to the current phase.

Begin.
