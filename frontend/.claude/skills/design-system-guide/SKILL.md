---
name: design-system-guide
description: Nordvolt design system — color, type, spacing, radius, elevation tokens extracted from Figma and wired into Tailwind v4, plus usage rules
---

# Nordvolt design system guide

Source of truth: Figma file **"Nordvolt · Design System + Screens"** (`fileKey: gEkUH2nWXoepam205EWQ2S`), page/frame **"Design System / Foundations"** (node `2:2`). This skill documents that page as implemented in code — read it before styling any UI, and re-pull from Figma (`get_variable_defs` / `get_design_context` on node `2:2`) if the Figma foundations page changes.

All tokens below are already wired into `src/app/globals.css` as Tailwind v4 CSS-first `@theme` tokens (no `tailwind.config.js` in this project — see the root stack notes). **Use the Tailwind utility classes they produce — never hardcode a hex value, px size, or shadow that duplicates one of these tokens.**

## Brand voice

"Light, Scandinavian, premium." Generous whitespace, restrained color (blue brand + cyan accent only), high-contrast neutral text, soft shadows rather than heavy borders for hierarchy.

## Color

| Token | Hex | Tailwind class | Use |
|---|---|---|---|
| `color-brand-primary` | `#2563EB` | `bg-brand-primary` / `text-brand-primary` | Primary actions, links, active state |
| `color-brand-hover` | `#1D4ED8` | `bg-brand-hover` | Hover/active state of primary brand color |
| `color-brand-subtle` | `#EFF6FF` | `bg-brand-subtle` | Light brand-tinted backgrounds (selected states, subtle highlights) |
| `color-accent` | `#06B6D4` | `bg-accent` / `text-accent` | Secondary accent, sparingly (badges, highlights) |
| `color-accent-subtle` | `#ECFEFF` | `bg-accent-subtle` | Light accent-tinted backgrounds |
| `color-success` | `#10B981` | `bg-success` / `text-success` | Success states, in-stock indicators |
| `color-warning` | `#F59E0B` | `bg-warning` / `text-warning` | Warning states, low-stock indicators |
| `color-danger` | `#EF4444` | `bg-danger` / `text-danger` | Errors, destructive actions |
| `color-text-primary` | `#111827` | `text-text-primary` | Headings, primary body text |
| `color-text-secondary` | `#6B7280` | `text-text-secondary` | Secondary/muted text, captions, metadata |
| `color-border` | `#E5E7EB` | `border-border` | All hairline borders/dividers |
| `color-bg-section` | `#F3F4F6` | `bg-bg-section` | Alternating section backgrounds on long pages |
| `color-bg-primary` | `#F8FAFC` | `bg-bg-primary` | Default page background |
| `color-surface` | `#FFFFFF` | `bg-surface` | Cards, modals, any raised surface |

There is no dark mode defined in the Figma foundations page yet — this is a light-only design system at present. Don't invent dark-mode values; if dark mode is needed, get it added to Figma first.

## Typography

Font family: **Inter** (all weights used: Regular 400, Medium 500, Semi Bold 600). Every size below is a Tailwind utility class already producing the exact px, line-height, letter-spacing, and weight from Figma — don't recreate these with raw `text-[Npx]` arbitrary values.

| Token | Class | Size / Line-height | Weight | Letter-spacing | Use |
|---|---|---|---|---|---|
| Display | `text-display` | 48 / 56 | 600 | -2px | Hero headlines |
| H1 | `text-h1` | 40 / 48 | 600 | -2px | Page titles |
| H2 | `text-h2` | 32 / 40 | 600 | -1px | Section titles |
| H3 | `text-h3` | 24 / 32 | 600 | -1px | Subsection titles |
| H4 | `text-h4` | 20 / 28 | 600 | 0 | Card/component titles |
| Body Large | `text-body-lg` | 18 / 28 | 400 | 0 | Lead paragraphs |
| Body | `text-body` | 16 / 24 | 400 | 0 | Default body text |
| Small | `text-small` | 14 / 20 | 400 | 0 | Secondary text |
| Small Semibold | `text-small-semibold` | 14 / 20 | 600 | 0 | Labels, emphasized small text |
| Caption | `text-caption` | 12 / 16 | 500 | 1px | Metadata, timestamps |
| Overline | `text-overline` | 12 / 16 | 600 | 8px | Eyebrow labels above headings (uppercase in usage) |

## Spacing — 8pt system

Scale (with one 4px half-step): `4, 8, 12, 16, 24, 32, 40, 48, 64, 80` px → Tailwind classes `spacing-1, spacing-2, spacing-3, spacing-4, spacing-6, spacing-8, spacing-10, spacing-12, spacing-16, spacing-20` (usable as `p-1`, `gap-6`, `px-20`, etc. — these override/extend Tailwind's default numeric spacing scale to match Figma exactly, so prefer them over eyeballing a default Tailwind spacing number).

## Radius

| Token | Value | Class | Use |
|---|---|---|---|
| `radius-sm` | 8px | `rounded-sm` | Small elements (chips, inputs) |
| `radius-md` | 12px | `rounded-md` | Default — cards, buttons |
| `radius-lg` | 16px | `rounded-lg` | Large surfaces (modals, hero panels) |
| `radius-full` | 999px | `rounded-full` | Pills, avatars, circular buttons |

## Elevation

Soft, low-contrast shadows — never a hard drop shadow.

| Token | Class | Use |
|---|---|---|
| `shadow-e1` | `shadow-e1` | Resting card |
| `shadow-e2` | `shadow-e2` | Raised/hovered card |
| `shadow-e3` | `shadow-e3` | Overlay (modal, dropdown, popover) |

## Layout grid

- Desktop 1440: container 1280, 12 columns, 80px margins, 24px gutters
- Tablet 834: 8 columns, 40px margins
- Mobile 390: 4 columns, 20px margins

Use these as the basis for responsive container widths and breakpoint behavior — the storefront's max content width is 1280px on desktop.

## Rules

1. **Never hardcode a color, font-size, spacing value, radius, or shadow that has a token above.** If a new value is genuinely needed, it likely belongs in Figma first — flag it rather than inventing an ad hoc one-off in code.
2. Prefer the semantic class names (`bg-brand-primary`, `text-text-secondary`) over rebuilding the same visual result from Tailwind's default palette (`bg-blue-600`, `text-gray-500`) — the Figma tokens are the ones that stay in sync with design, defaults will drift.
3. All tokens live in `src/app/globals.css` under `:root` (raw values) and `@theme inline` (Tailwind-facing aliases). Add new tokens there, in both places, following the existing naming pattern — never inline a second source of truth.
4. When implementing a new screen from Figma, pull it with `get_design_context`/`get_screenshot` on that screen's node, then map every color/type/spacing value back to a token from this table rather than copying the raw px/hex values Figma's generated code suggests.
