"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { applyLiveBrandPreview } from "@/lib/live-brand-preview";

const VISIBLE_SYNC_INTERVAL = 10_000;

/**
 * BroadcastChannel keeps tabs on one device in sync during a drag. This small,
 * visibility-aware refresh also keeps a separately opened phone up to date
 * after the administrator's automatic save has completed.
 */
export default function BrandSettingsSync() {
  const pathname = usePathname();

  useEffect(() => {
    // The admin's local preview must never be replaced by the last saved value
    // while someone is still adjusting the slider.
    if (pathname.startsWith("/admin")) return;

    let disposed = false;
    let inFlight = false;

    async function syncSettings() {
      if (disposed || inFlight || document.visibilityState !== "visible") return;
      inFlight = true;

      try {
        const response = await fetch("/api/brand-settings", {
          cache: "no-store",
          headers: { "Cache-Control": "no-store" },
        });
        if (!response.ok) return;
        const payload = await response.json() as { logoScale?: unknown };
        applyLiveBrandPreview(payload.logoScale);
      } catch {
        // The server-rendered value remains in place if a temporary network
        // problem prevents a refresh.
      } finally {
        inFlight = false;
      }
    }

    const syncWhenVisible = () => {
      if (document.visibilityState === "visible") void syncSettings();
    };

    void syncSettings();
    document.addEventListener("visibilitychange", syncWhenVisible);
    window.addEventListener("focus", syncWhenVisible);
    const interval = window.setInterval(() => void syncSettings(), VISIBLE_SYNC_INTERVAL);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", syncWhenVisible);
      window.removeEventListener("focus", syncWhenVisible);
      window.clearInterval(interval);
    };
  }, [pathname]);

  return null;
}
