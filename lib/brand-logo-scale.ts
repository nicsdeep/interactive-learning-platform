import type { CSSProperties } from "react";

export const DEFAULT_LOGO_SCALE = 1.2;
export const MIN_LOGO_SCALE = 0.8;
export const MAX_LOGO_SCALE = 4;
const MIN_RESPONSIVE_LOGO_PRESENCE = 0.78;

export type BrandLogoCssVariables = CSSProperties & Record<`--${string}`, string>;

export function normalizeLogoScale(value: unknown) {
  const scale = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(scale)) return undefined;
  const rounded = Math.round(scale * 100) / 100;
  return rounded >= MIN_LOGO_SCALE && rounded <= MAX_LOGO_SCALE ? rounded : undefined;
}

/**
 * A 4× lockup cannot physically fit inside a fixed phone header. Instead of
 * letting an oversized SVG reflow the page, map the requested range onto the
 * safe space each placement owns. Every value still produces a visible logo
 * change, while navigation and footer geometry stay intact.
 */
export function getResponsiveLogoPresence(value: unknown) {
  const scale = normalizeLogoScale(value) ?? DEFAULT_LOGO_SCALE;
  const progress = (scale - MIN_LOGO_SCALE) / (MAX_LOGO_SCALE - MIN_LOGO_SCALE);
  return MIN_RESPONSIVE_LOGO_PRESENCE + (1 - MIN_RESPONSIVE_LOGO_PRESENCE) * progress;
}

/**
 * Each public placement applies this percentage inside its own responsive
 * display rail. The setting changes the SVG—not the dimensions of the page.
 */
export function getBrandLogoCssVariables(logoScale: number): BrandLogoCssVariables {
  const presence = getResponsiveLogoPresence(logoScale);
  return {
    "--trussline-logo-presence": `${Math.round(presence * 10_000) / 100}%`,
  };
}
