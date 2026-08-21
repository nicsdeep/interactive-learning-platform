# Trussline Interactive Learning — SVG logo kit

All logo files are vector SVGs and use the full **Trussline / Interactive Learning** lockup.

- `public/logo.svg` — canonical light-surface logo
- `public/brand/logo-dark.svg` — dark-surface logo
- `public/brand/logo-blue.svg` — royal-blue brand-surface logo
- `public/brand/logo-mono-ink.svg` — single-colour ink logo
- `public/brand/logo-mono-white.svg` — single-colour white logo
- `public/brand/logo-compact.svg` — constrained-space logo

Use the colour variants only on their intended background contrast. Light-surface marks carry the waypoint palette; the full logo becomes monochrome on dark or strong-brand surfaces so it remains quiet, clear, and legible.

## Runtime logo treatment

The reusable `BrandLogo` component renders one complete, draggable SVG image—not HTML text beside an icon. It chooses the appropriate source asset for its surrounding light, dark, or brand-blue surface and updates when that surface changes. The mark itself is not a navigation link. Add `data-logo-surface="light"`, `data-logo-surface="dark"`, or `data-logo-surface="blue"` to an intentional surface for immediate, flicker-free contrast; the component also observes runtime class, style, and theme changes.
