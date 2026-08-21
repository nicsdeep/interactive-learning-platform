"use client";

import { useEffect, useRef, useState } from "react";

type BrandLogoProps = { dark?: boolean; monochrome?: boolean };

type Rgba = { red: number; green: number; blue: number; alpha: number };

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

function hasDarkSurface(element: HTMLElement) {
  let surface: HTMLElement | null = element.parentElement;
  while (surface) {
    const color = rgba(window.getComputedStyle(surface).backgroundColor);
    if (color && color.alpha > 0.75) return relativeLuminance(color) < 0.34;
    surface = surface.parentElement;
  }
  return false;
}

export default function BrandLogo({ dark = false, monochrome = false }: BrandLogoProps) {
  const logoRef = useRef<HTMLSpanElement>(null);
  const [onDarkSurface, setOnDarkSurface] = useState(dark);

  useEffect(() => {
    const logo = logoRef.current;
    if (!logo) return;
    const updateContrast = () => setOnDarkSurface(hasDarkSurface(logo));
    const ancestors: HTMLElement[] = [];
    let ancestor = logo.parentElement;
    while (ancestor) {
      ancestors.push(ancestor);
      ancestor = ancestor.parentElement;
    }
    const observer = new MutationObserver(updateContrast);
    ancestors.forEach((element) => observer.observe(element, { attributes: true, attributeFilter: ["class", "style"] }));
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    updateContrast();
    window.addEventListener("resize", updateContrast);
    colorScheme.addEventListener("change", updateContrast);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateContrast);
      colorScheme.removeEventListener("change", updateContrast);
    };
  }, []);

  return <span ref={logoRef} role="img" className={`brand-logo${onDarkSurface ? " is-dark" : ""}${monochrome ? " is-monochrome" : ""}`} data-logo-contrast={onDarkSurface ? "dark" : "light"} aria-label="Trussline Interactive Learning"><svg viewBox="0 0 72 54" aria-hidden="true"><path d="M8 41 25 22l15 10L59 8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4"/><path d="M7 42h59" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" opacity=".18"/><circle cx="8" cy="41" r="5" fill="var(--logo-coral)"/><circle cx="25" cy="22" r="5" fill="var(--logo-blue)"/><circle cx="40" cy="32" r="5" fill="var(--logo-teal)"/><circle cx="59" cy="8" r="5" fill="var(--logo-amber)"/></svg><span><strong>Trussline</strong><small><i>INTERACTIVE</i><em>LEARNING</em></small></span></span>;
}
