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

The application uses the reusable `BrandLogo` component rather than a fixed image in navigational and footer surfaces. It inherits its treatment from the surrounding surface and updates when that surface changes. Add `data-logo-surface="light"` or `data-logo-surface="dark"` to an intentional surface for immediate, flicker-free contrast; the component also observes runtime class and style changes for dynamic surfaces.
