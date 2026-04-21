# Plan: Cafe Kalcer Premium Luxe Design Implementation
**Created:** 2026-04-18
**Status:** Ready for Execution
**Session:** ses_premium_luxe

---

## 1. Overview
Deliver Premium Luxe visual design direction for Cafe Kalcer using Stitch MCP-based design flow with complete token system, screen patches, and QA validation.

## 2. Deliverables

### 2.1 Design Tokens CSS Patch ✅ COMPLETED
- [x] Add Premium Luxe theme tokens to `libs/design-tokens/design-tokens.css`
- [x] Activation via `data-theme="premium"` on root wrapper
- [x] Color palette: Rich Espresso (#1a0f0a), Aged Copper (#b8860b), Antique Gold (#c9a227)
- [x] Typography: Newsreader (display) + Plus Jakarta Sans (body)
- [x] Shadows with gold glow effects
- [x] Motion tokens with elegant easing

### 2.2 .stitch/DESIGN.md Entry 📋 IN PROGRESS
- [ ] Add Premium Luxe section to `.stitch/DESIGN.md`
- [ ] Document specific tokens, palet, dan usage guidelines
- [ ] Include variant comparison table
- [ ] Add activation instructions

### 2.3 Global Token Imports 🔄 PENDING
- [ ] Update `apps/customer-next/app/globals.css` - import premium tokens
- [ ] Update `apps/admin-next/app/globals.css` - import premium tokens
- [ ] Add data-theme attribute activation guidance
- [ ] Document runtime toggle option (opsional)

### 2.4 Three Design Variants 📋 PENDING
- [ ] **Variant 1: Premium Luxe** - (baseline)
- [ ] **Variant 2: Contemporary Minimal** - clean lines, monokrom
- [ ] **Variant 3: Modern Organic** - earthy tones, soft shapes
- [ ] Create token mapping notes per variant
- [ ] Simpan di parity draft `.sisyphus/drafts/mcp-stitch-missing-ui.md`

### 2.5 Screen Patches 📋 PENDING
- [ ] **Dashboard** - apply premium tokens via wrapper/patch
- [ ] **QR Generator** - apply token mapping
- [ ] **Customer Loyalty** - apply tokens ke loyalty cards/UI
- [ ] **Order Notifications** - apply premium styling
- [ ] Create patch diffs untuk review

### 2.6 QA Plan 📋 PENDING
- [ ] **Contrast** - minimum 4.5:1 ratio verification
- [ ] **Typography** - headline/body scale check
- [ ] **Spacing** - grid consistency validation
- [ ] **Accessibility** - focus states, ARIA labels
- [ ] Regresi visual pada 4 screen utama
- [ ] Buat test cases dalam JSON format

---

## 3. Collaboration (Skills)
| Skill | Role |
|-------|------|
| stitch-design | MCP design work & routing |
| design-token-branding | Tokenize tokens |
| taste-design | Premium Luxe specifics |
| ui-art-direction | Visual language |
| ui-ux-pro-max | Premium UX |
| nextjs-app | Frontend scaffolding |
| memory-merger | Dokumentasi lessons |

---

## 4. Execution Phases

### Phase 1: Token Foundation (COMPLETED)
- [x] Create Premium Luxe CSS block in `design-tokens.css`
- [x] Test activation via data-theme attribute
- [x] Verify all color, typography, spacing tokens defined

### Phase 2: DESIGN.md Entry (IN PROGRESS)
- [ ] Add "Premium Luxe" section ke `.stitch/DESIGN.md`
- [ ] Include token tables
- [ ] Add activation instructions
- [ ] Verify against existing design system

### Phase 3: Global Imports (PENDING)
- [ ] Update customer-next globals.css
- [ ] Update admin-next globals.css
- [ ] Test rendering with premium theme
- [ ] Verify no breaking changes

### Phase 4: Design Variants (PENDING)
- [ ] Create Contemporary Minimal variant notes
- [ ] Create Modern Organic variant notes
- [ ] Add comparison table to DESIGN.md
- [ ] Document token mapping per variant

### Phase 5: Screen Patches (PENDING)
- [ ] Create Dashboard patch diff
- [ ] Create QR Generator patch diff
- [ ] Create Loyalty patch diff
- [ ] Create Order Notifications patch diff

### Phase 6: QA Execution (PENDING)
- [ ] Run contrast checks
- [ ] Verify typography consistency
- [ ] Check spacing grid alignment
- [ ] Validate accessibility
- [ ] Generate QA report

---

## 5. Acceptance Criteria
- [ ] Premium Luxe tokens aktif via data-theme="premium"
- [ ] Semua screen menggunakan tokens (no hardcoded colors)
- [ ] DESIGN.md Premium Luxe entry complete & accurate
- [ ] Patch diffs applies tanpa breaking changes
- [ ] QA pass: contrast, typography, spacing, accessibility
- [ ] Memory merger entry created untuk future reference

---

## 6. Dependencies
- Dev server dapat run pada port yang benar
- Akses ke Stitch MCP (sudah verified - 2 projects)
- Token naming consistency antar apps

---

## 7. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Token drift | UI inconsistency | Single source of truth di shared design-tokens.css |
| Contrast fail | Accessibility violation | Pre-check dengan WCAG tool |
| Regresi UI | Breaking changes | Test pada dev environment dulu |

---

## 8. Next Steps
1. Lanjutkan ke Phase 2 - Update .stitch/DESIGN.md Premium Luxe entry
2. Update global token imports di customer/admin apps
3. Create 3 design variants dengan mapping notes
4. Execute screen patches untuk Dashboard, QR Generator, Loyalty, Notifications
5. Run QA dan generate report
6. Documentation via memory-merger

---

## 9. Notes
- Activation: `data-theme="premium"` pada root wrapper
- Runtime toggle dapat ditambahkan via UI jika diperlukan
- Premium feel: warm coffee tones, subtle gold accents, elegant typography
- Semua patch dapat di-review sebelum merge