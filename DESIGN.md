# Design rules

These rules apply to the product card and anything built from it.

## Tokens

Use the custom properties defined in `product-card.css`. Never hard-code a
color.

| Token | Value | Use |
| --- | --- | --- |
| `--color-surface` | `#ffffff` | Card background |
| `--color-text` | `#111827` | Primary text |
| `--color-text-muted` | `#4b5563` | Secondary text |
| `--color-border` | `#e5e7eb` | Card border and disabled button |
| `--color-action` | `#1d4ed8` | Primary button |
| `--color-action-hover` | `#1e40af` | Primary button on hover |
| `--color-on-action` | `#ffffff` | Text on the primary button |
| `--color-focus` | `#1d4ed8` | Focus outline |

## Spacing

Spacing uses a four-point scale: 4, 8, 12, 16 and 24 pixels, from `--space-1`
to `--space-5`. Use no other values.

## Type

Use the system UI font stack. The product name is 1.125rem semibold, the price
is 1.25rem bold, and everything else is 1rem regular.

## States

Every interactive control has a hover state and a visible focus state: a 2px
outline in `--color-focus` with a 2px offset. A control that can be disabled
also has a disabled state.

## Shape

The card has an 8px radius (`--radius`) and a 1px border. No shadows.
