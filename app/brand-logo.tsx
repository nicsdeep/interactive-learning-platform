"use client";

import { useEffect, useState } from "react";

type BrandLogoProps = {
  dark?: boolean;
  monochrome?: boolean;
};

type Tone = "light" | "dark" | "blue";
type Rgba = { red: number; green: number; blue: number; alpha: number };

const assets = {
  light: "/logo.svg",
  dark: "/brand/logo-dark.svg",
  blue: "/brand/logo-blue.svg",
  monoLight: "/brand/logo-mono-ink.svg",
  monoDark: "/brand/logo-mono-white.svg",
} as const;

function rgba(value: string) {
  const parts = value.match(/[\d.]+/g)?.map(Number);
  if (!parts || parts.length < 3 || value === "transparent") return undefined;
  return { red: parts[0], green: parts[1], blue: parts[2], alpha: parts[3] ?? 1 } satisfies Rgba;
}

function relativeLuminance({ red, green, blue }: Rgba) {
  const channel = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
}

function surfaceTone(element: HTMLElement): Tone {
  let surface: HTMLElement | null = element.parentElement;
  while (surface) {
    const declaredTone = surface.dataset.logoSurface;
    if (declaredTone === "light" || declaredTone === "dark" || declaredTone === "blue") return declaredTone;

    const color = rgba(window.getComputedStyle(surface).backgroundColor);
    if (color && color.alpha > 0.75) {
      const isBrandBlue = color.blue >= 120 && color.blue > color.red * 1.55 && color.blue > color.green * 1.55 && relativeLuminance(color) < 0.45;
      if (isBrandBlue) return "blue";
      return relativeLuminance(color) < 0.34 ? "dark" : "light";
    }
    surface = surface.parentElement;
  }
  return "light";
}

function assetFor(tone: Tone, monochrome: boolean) {
  if (monochrome) return tone === "light" ? assets.monoLight : assets.monoDark;
  if (tone === "blue") return assets.blue;
  return assets[tone];
}

export default function BrandLogo({ dark = false, monochrome = false }: BrandLogoProps) {
  const [logoElement, setLogoElement] = useState<HTMLSpanElement | null>(null);
  const [tone, setTone] = useState<Tone>(dark || monochrome ? "dark" : "light");

  useEffect(() => {
    if (!logoElement) return;
    const updateTone = () => setTone(surfaceTone(logoElement));
    const ancestors: HTMLElement[] = [];
    let ancestor = logoElement.parentElement;
    while (ancestor) {
      ancestors.push(ancestor);
      ancestor = ancestor.parentElement;
    }

    const observer = new MutationObserver(updateTone);
    ancestors.forEach((element) => observer.observe(element, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme", "data-logo-surface"],
    }));
    updateTone();
    window.addEventListener("resize", updateTone);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateTone);
    };
  }, [logoElement]);

  const source = assetFor(tone, monochrome);
  return <span ref={setLogoElement} className={`brand-logo brand-logo--${tone}${monochrome ? " is-monochrome" : ""}`} data-logo-asset={source}>
    <img src={source} width="500" height="110" alt="Trussline Interactive Learning" draggable />
  </span>;
}
