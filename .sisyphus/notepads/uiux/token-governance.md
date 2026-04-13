# Cafe-X Design Token Governance

**Last Updated**: 2026-04-11
**Version**: 1.0.0

## Overview

This document establishes governance policy for the Cafe-X design token system (`--cx-*`). The token system is shared across admin-next, customer-next, and pos-flutter apps via a shared CSS library in `libs/design-tokens/`.

## Versioning Policy

- **Format**: Semantic Versioning (MAJOR.MINOR.PATCH)
- **MAJOR**: Breaking changes — tokens removed, renamed, or value changed
- **MINOR**: New tokens, non-breaking additions
- **PATCH**: Bug fixes, value adjustments

### Version Metadata
Tokens include version tracking:
```css
--cx-token-version: 1.0.0;
--cx-last-updated: 2026-04-11;
```

## Naming Conventions

### Primary Tokens (`--cx-*`)
All new tokens MUST use the `--cx-` prefix:
- Colors: `--cx-brand`, `--cx-surface`, `--cx-text`
- Typography: `--cx-text-*`, `--cx-font-*`
- Spacing: `--cx-space-*`
- Radius: `--cx-radius-*`
- Shadow: `--cx-shadow-*`
- Motion: `--cx-ease-*`, `--cx-dur-*`
- Z-index: `--cx-z-*`

### Semantic Aliases
Purpose-mapped aliases for component use:
```css
--cx-ink: var(--cx-text);       /* Don't use directly */
--cx-accent: var(--cx-brand);
```

### Legacy Aliases (Deprecated)
Preserved for backward compatibility:
- `--c-*` (original customer-next naming)
- `--cx-*` patterns from admin-next

## Deprecation Policy

### Timeline
- **Deprecation Notice**: Added when token planned for removal
- **Support Period**: Minimum 2 MINOR versions (e.g., v1.0.0 to v1.2.0)
- **Removal**: MAJOR version bump

### Process
1. Mark token as deprecated in CHANGELOG.md
2. Add deprecation notice section in tokens.css
3. Maintain alias during support period
4. Remove in next MAJOR version

### Current Deprecations (v1.0.0)
| Deprecated | Use Instead | Remove In |
|-----------|-----------|---------|
| `--c-brand` | `--cx-brand` | v2.0.0 |
| `--c-bg` | `--cx-bg` | v2.0.0 |
| `--c-surface` | `--cx-surface` | v2.0.0 |
| `--c-text` | `--cx-text` | v2.0.0 |
| `--dur-fast` | `--cx-dur-fast` | v2.0.0 |
| `--dur-mid` | `--cx-dur-mid` | v2.0.0 |
| `--dur-slow` | `--cx-dur-slow` | v2.0.0 |
| `--ease` | `--cx-ease-out` | v2.0.0 |

## Review Cycle

- **Quarterly Reviews**: Q1, Q2, Q3, Q4 each year
- **Review Focus**:
  - Unused tokens cleanup
  - Consistency audit across apps
  - New token proposals
  - Deprecation timeline assessment

## File Locations

- **Tokens**: `libs/design-tokens/design-tokens.css`
- **Changelog**: `libs/design-tokens/CHANGELOG.md`
- **Governance**: `.sisyphus/notepads/uiux/token-governance.md`

## Consumers

| App | Import Path |
|-----|-----------|
| admin-next | `@cafe-x/design-tokens` |
| customer-next | `@cafe-x/design-tokens` |

## Action Items

- [ ] Migrate apps from legacy `--c-*` to `--cx-*` tokens
- [x] Establish token versioning in v1.0.0
- [ ] Plan quarterly review calendar
- [ ] Evaluate dark mode token support for v1.1.0