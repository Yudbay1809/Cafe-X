# MCP Stitch UI Parity - Wave 6 Plan

## TL;DR
- Objective: Infra stabilization, QA governance, and UI parity extension to Admin Next screens (2-3 screens).
- Execution: Sequential focus (infra fixes first, then QA run, then UI parity tasks) with 4-5 concrete tasks.
- Deliverables: Updated QA artifacts, Admin parity entries, and design-token alignment notes updated as needed.

## Context
- Wave 5 completed with Axe integration and port fixes. Shell environment issues (snip prefix) still pose a testing hurdle and require a stable local run to re-run Playwright QA.
- Admin Next parity exists as a parallel project area; Wave 6 will extend Stitch parity to Admin screens: Admin Dashboard, Admin Users, Admin Settings.

## Work Objectives
- Core Objective: Stabilize QA test runtime and governance, re-run Wave QA for customer-next and admin-next, and extend Stitch parity to core Admin screens.
- Concrete Deliverables:
  - 1) Infra fixes implemented and validated locally (shell env stability, port binding).
  - 2) Wave QA report updated with Wave 6 results (wave6-qa-report.json).
  - 3) Admin Next parity entries added for 2-3 screens (Dashboard, Users, Settings).

## Definition of Done
- [ ] Infra stability proven in local dev/test env.
- [ ] Wave QA tests re-run for both customer-next and admin-next; results captured.
- [ ] Admin UI parity entries added with design-token alignment notes.
- [ ] Wave 6 QA report generated and patched into draft.
- [ ] Parity draft updated to include Wave 6 results.

## Execution Strategy
- Wave 6: Sequential execution with clear handoffs: infra → QA → UI parity.
- Parallelism: Low for infra (foundation gating), medium for parity entries once infra is ready.

## TODOs
- [ ] 1) Stabilize shell environment for Playwright (remove or adapt the prefix issue; ensure test runner is clean)
- [ ] 2) Re-run Wave QA tests for customer-next and admin-next (verify server ports, baseURL alignment)
- [ ] 3) Add Admin Next parity screens: Admin Dashboard, Admin Users, Admin Settings with token alignment notes
- [ ] 4) Generate wave6-qa-report.json and patch Wave6 results into mcp-stitch-missing-ui.md draft
- [ ] 5) Update parity draft with Wave 6 results

## Verification Strategy (Agent-Executed QA)
- All tasks in Wave 6 must include agent-executed QA scenarios (UI, API, TUI) with concrete steps and evidence paths.
- Evidence artifacts should be saved under .sisyphus/qa/wave6-qa-report.json and related evidence directories.

## Commit Strategy
- Save as: .sisyphus/plans/mcp-stitch-wave6.md
