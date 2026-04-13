# Wave 3 Execution Draft (M1–M5)

Context: Wave 2 gating (G5-G7) completed; D1-D3 locked (A, A, B). Prepare Wave 3 M1–M5 with concrete owners, deliverables, and evidence requirements.

## Mappings
- M1 Flutter Token Export Completion
  - Objective: Produce production-ready flutter-token-export.json and flutter-token-export.scss; verify provenance and versioning
  - Owners: Design Token Lead; Platform Engineer Lead; Verification Lead
  - Deliverables: flutter-token-export.json, flutter-token-export.scss; cross-reference in token-governance.md
  - Evidence: token export artifact available in governance docs; version 1.0.0 tag

- M2 Brand Color Alignment Complete
  - Objective: Lock brand color token (Amber) as single source; align docs and plan matrices
  - Owners: Branding Lead; Design Token Lead
  - Deliverables: token-color contract; cross-reference matrix showing token ⇄ UI
  - Evidence: updated design-system mapping and token registry

- M3 Landing-page Token Alignment Finalization
  - Objective: Align landing-page tokens with main token set; create usage matrix
  - Owners: Landing-page UX Lead; Verification Lead
  - Deliverables: landing-page token usage matrix; updated landing-page components
  - Evidence: updated docs and sample pages consuming tokens

- M4 Accessibility Baseline Remediation
  - Objective: Complete baseline a11y fixes; establish remediation plan with timeline
  - Owners: Accessibility Lead; Verification Lead
  - Deliverables: remediation plan; baseline audit results in verification.md
  - Evidence: a11y scoring improvements; checklist entries

- M5 Path Fragility Hardening
  - Objective: Harden critical token paths; implement monitoring and retry/fallback
  - Owners: Platform Engineer Lead; Verification Lead
  - Deliverables: path-hardening plan; monitoring hooks; fallback documentation
  - Evidence: monitoring configured; retry logic documented

## Risks & Mitigations (linked to owners)
- Flutter export delay → milestone-driven delivery; mock paths if needed
- Brand color misalignment → single source of truth; automated diff checks
- Landing-page alignment → token usage matrix; cross-check marketing assets
- A11y baseline → baseline audit; remediation sprint
- Path fragility → observability and fallback paths

## File Anchors
- verification: .sisyphus/notepads/uiux/verification.md
- plan: .sisyphus/plans/uiux-review.md
- gap-analysis: gap-analysis.md, gap-analysis-wave2-blockers.md
- governance: token-governance.md
- Flutter export: libs/design-tokens/flutter-token-export.json, libs/design-tokens/flutter-token-export.scss

## Flutter Token Export Status
- Flutter token export artifact: READY
- Location: libs/design-tokens/flutter-token-export.json, libs/design-tokens/flutter-token-export.scss
- Version: 1.0.0
- Tokens included: brand, teal, bg, surface, text, muted, spacing, radius, fonts
- Status: ✅ COMPLETE

## M1-M5 Current Status (2026-04-12)
- M1 Flutter Token Export: ✅ COMPLETE
- M2 Brand Color Alignment: 🔄 IN PROGRESS (D1 locked as Amber #C8853C)
- M3 Landing-page Token Alignment: ✅ COMPLETE (landing-page now imports design-tokens.css)
- M4 Accessibility Baseline: 🔄 IN PROGRESS (remediation plan in development)
- M5 Path Fragility: 🔄 IN PROGRESS (path hardening plan in development)
