"use client";

import { useEffect } from "react";
import { applyLiveBrandPreview, BRAND_PREVIEW_CHANNEL, previewScaleFromMessage } from "@/lib/live-brand-preview";

/** Keeps separately open Trussline pages visually in sync while an admin drags. */
export default function BrandPreviewBridge() {
  useEffect(() => {
    if (!("BroadcastChannel" in window)) return;

    const channel = new BroadcastChannel(BRAND_PREVIEW_CHANNEL);
    const updatePreview = (event: MessageEvent<unknown>) => {
      const scale = previewScaleFromMessage(event.data);
      if (scale !== undefined) applyLiveBrandPreview(scale);
    };

    channel.addEventListener("message", updatePreview);
    return () => {
      channel.removeEventListener("message", updatePreview);
      channel.close();
    };
  }, []);

  return null;
}
