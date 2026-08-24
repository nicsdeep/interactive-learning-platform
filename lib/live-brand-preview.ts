import { getBrandLogoCssVariables, normalizeLogoScale } from "./brand-logo-scale";

export const BRAND_PREVIEW_CHANNEL = "trussline-brand-preview";
const BRAND_PREVIEW_MESSAGE = "logo-scale-preview";

export type BrandPreviewMessage = {
  type: typeof BRAND_PREVIEW_MESSAGE;
  logoScale: number;
};

export function applyLiveBrandPreview(value: unknown) {
  const scale = normalizeLogoScale(value);
  if (!scale || typeof document === "undefined") return;

  const root = document.documentElement;
  Object.entries(getBrandLogoCssVariables(scale)).forEach(([name, pixelValue]) => root.style.setProperty(name, pixelValue));
  root.dataset.logoScale = scale.toFixed(2);
}

export function createBrandPreviewMessage(value: unknown): BrandPreviewMessage | undefined {
  const scale = normalizeLogoScale(value);
  return scale ? { type: BRAND_PREVIEW_MESSAGE, logoScale: scale } : undefined;
}

export function previewScaleFromMessage(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const message = value as Partial<BrandPreviewMessage>;
  return message.type === BRAND_PREVIEW_MESSAGE ? normalizeLogoScale(message.logoScale) : undefined;
}
