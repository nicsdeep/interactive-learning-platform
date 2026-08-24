"use client";

import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Gauge,
  LogOut,
  Monitor,
  RefreshCcw,
  Save,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import BrandLogo from "../../brand-logo";
import AdminFooter from "./admin-footer";
import styles from "./admin.module.css";
import { DEFAULT_LOGO_SCALE, MAX_LOGO_SCALE, MIN_LOGO_SCALE } from "@/lib/brand-logo-scale";
import { applyLiveBrandPreview, BRAND_PREVIEW_CHANNEL, createBrandPreviewMessage } from "@/lib/live-brand-preview";

type AdminDashboardProps = {
  initialLogoScale: number;
  persistenceConfigured: boolean;
};

type SettingsPayload = {
  logoScale?: unknown;
  settings?: { logoScale?: unknown };
  error?: string;
};

const AUTO_SAVE_DELAY = 700;
const DESKTOP_PREVIEW_RAIL = 258;
const MOBILE_PREVIEW_RAIL = 154;
// This stage has its own generous canvas so it can show the requested size
// literally; navigation and footer rails remain intentionally fixed.
const FULL_PREVIEW_BASE_WIDTH = 160;
const LOGO_SCALE_PRESETS = [0.8, 1.2, 2, 3, 4] as const;

type SaveStatus = "idle" | "previewing" | "saving" | "saved" | "error" | "unavailable";

function clampLogoScale(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_LOGO_SCALE;
  return Math.min(MAX_LOGO_SCALE, Math.max(MIN_LOGO_SCALE, Math.round(value * 100) / 100));
}

function logoScaleFromPayload(payload: SettingsPayload) {
  const value = typeof payload.logoScale === "number" ? payload.logoScale : payload.settings?.logoScale;
  return typeof value === "number" && Number.isFinite(value) ? clampLogoScale(value) : undefined;
}

function previewStyle(requestedWidth: number, railWidth: number): CSSProperties {
  return {
    "--admin-preview-width": `${Math.min(requestedWidth, railWidth)}px`,
  } as CSSProperties;
}

function fullPreviewStyle(width: number): CSSProperties {
  return { "--admin-full-preview-width": `${width}px` } as CSSProperties;
}

export default function AdminDashboard({ initialLogoScale, persistenceConfigured }: AdminDashboardProps) {
  const [logoScale, setLogoScale] = useState(() => clampLogoScale(initialLogoScale));
  const [savedLogoScale, setSavedLogoScale] = useState(() => clampLogoScale(initialLogoScale));
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(persistenceConfigured ? "idle" : "unavailable");
  const [error, setError] = useState("");
  const latestLogoScale = useRef(clampLogoScale(initialLogoScale));
  const savedLogoScaleRef = useRef(clampLogoScale(initialLogoScale));
  const previewChannel = useRef<BroadcastChannel | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSave = useRef<number | null>(null);
  const saveInFlight = useRef(false);
  const isMounted = useRef(true);

  const percentage = Math.round(logoScale * 100);
  const hasChanges = logoScale !== savedLogoScale;
  const desktopWidth = useMemo(() => Math.round(210 * logoScale), [logoScale]);
  const mobileWidth = useMemo(() => Math.round(144 * logoScale), [logoScale]);
  const fullPreviewWidth = useMemo(() => Math.round(FULL_PREVIEW_BASE_WIDTH * logoScale), [logoScale]);

  const clearAutoSaveTimer = useCallback(() => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = null;
    }
  }, []);

  const saveScale = useCallback(async (scaleToSave: number) => {
    if (!persistenceConfigured) return;

    if (saveInFlight.current) {
      pendingSave.current = scaleToSave;
      return;
    }

    const normalizedScale = clampLogoScale(scaleToSave);
    saveInFlight.current = true;
    setIsSaving(true);
    setSaveStatus("saving");
    setError("");

    try {
      const response = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoScale: normalizedScale }),
      });
      const payload = await response.json().catch(() => ({})) as SettingsPayload;

      if (!response.ok) {
        if (isMounted.current) {
          setSaveStatus("error");
          setError(payload.error || "Your preview is still here, but this size could not be saved. Please try again.");
        }
        return;
      }

      const saved = logoScaleFromPayload(payload) ?? normalizedScale;
      if (isMounted.current) {
        setSavedLogoScale(saved);
        const hasNewerPreview = latestLogoScale.current !== saved;
        setSaveStatus(hasNewerPreview ? "previewing" : "saved");
      }
    } catch {
      if (isMounted.current) {
        setSaveStatus("error");
        setError("Your preview is still here, but the change could not be saved. Please try again.");
      }
    } finally {
      saveInFlight.current = false;
      if (isMounted.current) setIsSaving(false);

      const newerScale = pendingSave.current ?? (latestLogoScale.current !== normalizedScale ? latestLogoScale.current : null);
      pendingSave.current = null;
      if (newerScale !== null && newerScale !== normalizedScale) {
        // Keep requests ordered. A new adjustment made while a save was in flight
        // is sent immediately after the earlier response has settled.
        void saveScale(newerScale);
      }
    }
  }, [persistenceConfigured]);

  const scheduleAutoSave = useCallback((scaleToSave: number) => {
    if (!persistenceConfigured) {
      setSaveStatus("unavailable");
      return;
    }

    clearAutoSaveTimer();
    setSaveStatus("previewing");
    autoSaveTimer.current = setTimeout(() => {
      autoSaveTimer.current = null;
      void saveScale(scaleToSave);
    }, AUTO_SAVE_DELAY);
  }, [clearAutoSaveTimer, persistenceConfigured, saveScale]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      clearAutoSaveTimer();
    };
  }, [clearAutoSaveTimer]);

  useEffect(() => {
    savedLogoScaleRef.current = savedLogoScale;
  }, [savedLogoScale]);

  useEffect(() => {
    applyLiveBrandPreview(logoScale);
  }, [logoScale]);

  useEffect(() => {
    if ("BroadcastChannel" in window) previewChannel.current = new BroadcastChannel(BRAND_PREVIEW_CHANNEL);

    return () => {
      // A preview that has not saved must not leak into another route or an
      // open Trussline tab in the same browser session.
      const confirmedScale = savedLogoScaleRef.current;
      applyLiveBrandPreview(confirmedScale);
      const confirmedMessage = createBrandPreviewMessage(confirmedScale);
      if (confirmedMessage) previewChannel.current?.postMessage(confirmedMessage);
      previewChannel.current?.close();
      previewChannel.current = null;
    };
  }, []);

  useEffect(() => {
    if (!persistenceConfigured) return;
    const controller = new AbortController();

    async function loadLatestSetting() {
      try {
        const response = await fetch("/api/admin/site-settings", { signal: controller.signal, cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json() as SettingsPayload;
        const remoteScale = logoScaleFromPayload(payload);
        if (remoteScale === undefined) return;
        latestLogoScale.current = remoteScale;
        setLogoScale(remoteScale);
        setSavedLogoScale(remoteScale);
        setSaveStatus("idle");
      } catch {
        // The server-rendered setting remains usable if this refresh is unavailable.
      }
    }

    void loadLatestSetting();
    return () => controller.abort();
  }, [persistenceConfigured]);

  function updateScale(nextValue: number) {
    const nextScale = clampLogoScale(nextValue);
    // Range inputs emit both input and change events in some browsers. Ignore
    // the second event so one gesture produces one preview and one autosave.
    if (nextScale === latestLogoScale.current) return;
    latestLogoScale.current = nextScale;
    applyLiveBrandPreview(nextScale);
    const previewMessage = createBrandPreviewMessage(nextScale);
    if (previewMessage) previewChannel.current?.postMessage(previewMessage);
    setLogoScale(nextScale);
    setError("");
    scheduleAutoSave(nextScale);
  }

  function saveNow() {
    if (!persistenceConfigured) return;
    clearAutoSaveTimer();
    void saveScale(latestLogoScale.current);
  }

  async function logOut() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      window.location.assign("/admin/kinyae");
    }
  }

  return (
    <main className={styles.dashboardShell}>
      <div className={styles.dashboardFrame}>
        <header className={styles.dashboardHeader}>
          <div className={styles.adminBrand} data-logo-surface="light"><BrandLogo /></div>
          <div className={styles.headerActions}>
            <span className={styles.protectedTag}><ShieldCheck size={14} aria-hidden="true" /> Protected controls</span>
            <button className={styles.logoutButton} type="button" onClick={logOut} disabled={isLoggingOut}>
              <LogOut size={16} aria-hidden="true" />
              {isLoggingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </header>

        <section className={styles.dashboardIntro} aria-labelledby="admin-dashboard-title">
          <div>
            <p className={styles.eyebrow}>Trussline administration</p>
            <h1 id="admin-dashboard-title">Brand visibility, tuned for every learner.</h1>
          </div>
          <p>Manage the shared mark once, then review how it appears across wide screens and the phones most learners use.</p>
        </section>

        <div className={styles.dashboardGrid}>
          <section className={styles.settingsPanel} aria-labelledby="logo-scale-title">
            <div className={styles.panelHeading}>
              <div className={styles.panelIcon}><Gauge size={20} aria-hidden="true" /></div>
              <div>
                <p className={styles.panelKicker}>Identity</p>
                <h2 id="logo-scale-title">Global logo scale</h2>
              </div>
            </div>

            <p className={styles.panelCopy}>Set the brand presence from 80% to 400%. The full mark stays whole, while protected navigation and footer frames keep their shape on every screen.</p>

            <div className={styles.scaleReadout} aria-live="polite">
              <output htmlFor="logo-scale" className={styles.scaleValue}>{percentage}%</output>
              <span>Requested display scale</span>
            </div>

            <figure className={styles.scaleCanvas} aria-labelledby="live-scale-canvas-caption">
              <div className={styles.scaleCanvasHeader}>
                <span>Live logo preview</span>
                <strong>{percentage}%</strong>
              </div>
              <div className={styles.scaleCanvasViewport}>
                <div className={styles.scaleCanvasTrack} style={fullPreviewStyle(fullPreviewWidth)} data-logo-surface="light">
                  <BrandLogo />
                </div>
              </div>
              <figcaption id="live-scale-canvas-caption">This mark grows before anything is saved.</figcaption>
            </figure>

            <fieldset className={styles.scaleFieldset}>
              <legend className="sr-only">Logo scale</legend>
              <label className={styles.rangeLabel} htmlFor="logo-scale">Logo size</label>
              <input
                id="logo-scale"
                className={styles.range}
                type="range"
                min={MIN_LOGO_SCALE}
                max={MAX_LOGO_SCALE}
                step="0.02"
                value={logoScale}
                onInput={(event) => updateScale(Number(event.currentTarget.value))}
                onChange={(event) => updateScale(Number(event.currentTarget.value))}
                aria-valuetext={`${percentage} percent of the base logo size. Navigation and footer frames stay protected.`}
                aria-describedby="logo-scale-status"
                style={{ background: `linear-gradient(90deg, var(--blue) 0 ${((logoScale - MIN_LOGO_SCALE) / (MAX_LOGO_SCALE - MIN_LOGO_SCALE)) * 100}%, var(--blue-soft) ${((logoScale - MIN_LOGO_SCALE) / (MAX_LOGO_SCALE - MIN_LOGO_SCALE)) * 100}% 100%)` }}
              />
              <div className={styles.rangeLegend} aria-hidden="true"><span>Compact · 80%</span><span>Maximum presence · 400%</span></div>
              <div className={styles.scaleQuickActions} role="group" aria-label="Choose an exact logo size">
                {LOGO_SCALE_PRESETS.map((preset) => {
                  const presetPercentage = Math.round(preset * 100);
                  return <button
                    key={preset}
                    type="button"
                    aria-pressed={logoScale === preset}
                    onClick={() => updateScale(preset)}
                  >{presetPercentage}%</button>;
                })}
              </div>
            </fieldset>

            <div id="logo-scale-status" className={styles.autosaveStatus} data-state={saveStatus} role={saveStatus === "error" ? "alert" : "status"} aria-live={saveStatus === "error" ? "assertive" : "polite"}>
              {saveStatus === "unavailable" ? <><CircleAlert size={16} aria-hidden="true" /><span><strong>Preview only.</strong> You can explore a size here, but it cannot be applied to the live experience yet.</span></> : null}
              {saveStatus === "previewing" ? <><Clock3 size={16} aria-hidden="true" /><span>Preview updated. It will save automatically when you finish adjusting.</span></> : null}
              {saveStatus === "saving" ? <><Save className={styles.savingIcon} size={16} aria-hidden="true" /><span>Saving your new logo size…</span></> : null}
              {saveStatus === "saved" ? <><CheckCircle2 size={16} aria-hidden="true" /><span>Saved automatically. The updated size is now ready to use.</span></> : null}
              {saveStatus === "idle" ? <><CheckCircle2 size={16} aria-hidden="true" /><span>Your changes save automatically.</span></> : null}
              {saveStatus === "error" ? <><CircleAlert size={16} aria-hidden="true" /><span>{error || "Your preview is still visible. Try saving again when you are ready."}</span></> : null}
            </div>

            <div className={styles.controlActions}>
              <button className={styles.resetButton} type="button" onClick={() => updateScale(DEFAULT_LOGO_SCALE)} disabled={logoScale === DEFAULT_LOGO_SCALE}>
                <RefreshCcw size={16} aria-hidden="true" /> Reset to 120%
              </button>
              <button className={styles.manualSaveButton} type="button" onClick={saveNow} disabled={!persistenceConfigured || isSaving || !hasChanges}>
                <Save size={16} aria-hidden="true" />
                {saveStatus === "error" ? "Try saving again" : "Save now"}
              </button>
            </div>
          </section>

          <section className={styles.previewPanel} aria-labelledby="logo-preview-title">
            <div className={styles.previewHeading}>
              <div>
                <p className={styles.panelKicker}>Live preview</p>
                <h2 id="logo-preview-title">Clear at every breakpoint.</h2>
              </div>
              <span className={styles.previewStatus} data-state={saveStatus}><span aria-hidden="true" /> {saveStatus === "unavailable" ? "Preview mode" : saveStatus === "saving" || saveStatus === "previewing" ? "Updating" : "Live preview"}</span>
            </div>

            <div className={styles.previewGrid}>
              <article className={styles.desktopPreview} aria-label="Desktop logo preview">
                <div className={styles.previewMeta}><Monitor size={15} aria-hidden="true" /> Desktop navigation</div>
                <div className={styles.desktopBar} data-logo-surface="light">
                  <div className={styles.previewMark} style={previewStyle(desktopWidth, DESKTOP_PREVIEW_RAIL)}><BrandLogo /></div>
                  <div className={styles.previewLines} aria-hidden="true"><i /><i /><i /></div>
                </div>
                <p>Wide-screen header</p>
              </article>

              <article className={styles.mobilePreview} aria-label="Mobile logo preview">
                <div className={styles.previewMeta}><Smartphone size={15} aria-hidden="true" /> Mobile navigation</div>
                <div className={styles.phoneFrame}>
                  <div className={styles.phoneBar} data-logo-surface="light">
                    <div className={styles.previewMark} style={previewStyle(mobileWidth, MOBILE_PREVIEW_RAIL)}><BrandLogo /></div>
                    <span className={styles.menuGlyph} aria-hidden="true"><i /><i /><i /></span>
                  </div>
                  <div className={styles.phoneContent} aria-hidden="true"><span /><span /><span /></div>
                </div>
                <p>Phone header</p>
              </article>
            </div>

            <div className={styles.previewNote}>
              <ArrowUpRight size={17} aria-hidden="true" />
              <p>The logo automatically selects its light or dark SVG version for the surface behind it. At larger settings, fixed display rails preserve the header and footer geometry.</p>
            </div>
          </section>
        </div>

        <AdminFooter compact />
      </div>
    </main>
  );
}
