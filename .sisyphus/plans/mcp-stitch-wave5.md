# MCP Stitch UI Parity - Wave 5 Plan

This plan outlines Wave 5: Infra stabilization + QA governance + UI parity extension for 2-3 screens (Checkout, Orders history, Profile settings).

## TL;DR
- Objective: Stabilize QA infra, fix axe integration and porting, re-run Wave QA, and extend Stitch UI parity to 2-3 screens.
- Approach: Sequential execution: Infra fixes → QA run → UI parity tasks.
- Deliverables: Updated QA artifacts, updated parity draft, 2-3 new UI screens parity entries.

## Context
- Previous waves completed (1-4). Infra issues identified: axe-core API mismatch and port handling. Port updated to 3001 across config. QA results to be re-run once infra is stabilized.

## Work Objectives
- Core Objective: Restore reliable QA loop for customer-next and admin-next, and extend Stitch parity to 2-3 new screens.
- Concrete Deliverables:
- 1) Infra fixes implemented and verified.
- 2) Wave QA re-run results documented (wave5-qa-report.json).
- 3) UI parity entries for Checkout, Orders history, Profile settings screens added to parity draft.

## Definition of Done
- [ ] Infra fixes implemented and verified locally.
- [ ] QA CI/local run passes for Wave 5 scope.
- [ ] Parity entries for 2-3 screens added with design-token alignment notes.

## Execution Strategy
- Wave-based execution with 1-2 weeks window for feedback. Parallelism: low for infra fixes; medium for UI parity entries pending infra success.

## TODOs
- [ ] 1) Fix Axe integration in accessibility.spec.ts (replace with AxeBuilder usage)
- [ ] 2) Ensure dev server port consistency (prefer 3001) across Playwright config and Next dev command
- [ ] 3) Re-run Wave QA for Wave 5 after infra fixes
- [ ] 4) Add 2-3 UI parity screens: Checkout, Orders history, Profile settings with token alignment
- [ ] 5) Update Wave QA report: .sisyphus/qa/wave5-qa-report.json
- [ ] 6) Update parity draft with results
- [ ] 1) Stabilize Axe integration in accessibility.spec.ts (replace with AxeBuilder usage)
- [ ] 2) Ensure dev server port consistency (prefer 3001) across Playwright config and Next dev command
- [ ] 3) Re-run Wave QA for Wave 5 after infra fixes
- [ ] 4) Add 2-3 UI parity screens: Checkout, Orders history, Profile settings with token alignment
- [ ] 5) Update Wave QA report: .sisyphus/qa/wave5-qa-report.json
- [ ] 6) Update parity draft with results

## Evidence & Artifacts
- QA report: .sisyphus/qa/wave5-qa-report.json
- Draft updates: .sisyphus/drafts/mcp-stitch-wave5.md
