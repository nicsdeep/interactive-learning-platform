import type { CSSProperties } from "react";

export const DEFAULT_LOGO_SCALE = 1.2;
export const MIN_LOGO_SCALE = 0.8;
export const MAX_LOGO_SCALE = 4;

export type BrandLogoCssVariables = CSSProperties & Record<`--${string}`, string>;

export function normalizeLogoScale(value: unknown) {
  const scale = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(scale)) return undefined;
  const rounded = Math.round(scale * 100) / 100;
  return rounded >= MIN_LOGO_SCALE && rounded <= MAX_LOGO_SCALE ? rounded : undefined;
}

function pixels(value: number, scale: number) {
  return `${Math.round(value * scale)}px`;
}

/**
 * Each public placement maps these requested values into its own responsive
 * display rail. That lets the artwork scale honestly while protected headers
 * and footers keep their layout geometry.
 */
export function getBrandLogoCssVariables(logoScale: number): BrandLogoCssVariables {
  const scale = normalizeLogoScale(logoScale) ?? DEFAULT_LOGO_SCALE;
  return {
    "--trussline-logo-home": pixels(190, scale),
    "--trussline-logo-home-mobile": pixels(205, scale),
    "--trussline-logo-launch": pixels(205, scale),
    "--trussline-logo-launch-mobile": pixels(164, scale),
    "--trussline-logo-info": pixels(205, scale),
    "--trussline-logo-info-mobile": pixels(164, scale),
    "--trussline-logo-footer": pixels(230, scale),
    "--trussline-logo-footer-mobile": pixels(192, scale),
  };
}
