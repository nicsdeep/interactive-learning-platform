"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
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

type AdminDashboardProps = {
  initialLogoScale: number;
  persistenceConfigured: boolean;
};

type SettingsPayload = {
  logoScale?: unknown;
  settings?: { logoScale?: unknown };
  error?: string;
};

const MIN_LOGO_SCALE = 0.8;
const MAX_LOGO_SCALE = 1.4;
const DEFAULT_LOGO_SCALE = 1.2;

function clampLogoScale(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_LOGO_SCALE;
  return Math.min(MAX_LOGO_SCALE, Math.max(MIN_LOGO_SCALE, Math.round(value * 100) / 100));
}

function logoScaleFromPayload(payload: SettingsPayload) {
  const value = typeof payload.logoScale === "number" ? payload.logoScale : payload.settings?.logoScale;
  return typeof value === "number" && Number.isFinite(value) ? clampLogoScale(value) : undefined;
}

function previewStyle(width: number): CSSProperties {
  return { "--admin-preview-width": `${width}px` } as CSSProperties;
}

export default function AdminDashboard({ initialLogoScale, persistenceConfigured }: AdminDashboardProps) {
  const [logoScale, setLogoScale] = useState(() => clampLogoScale(initialLogoScale));
  const [savedLogoScale, setSavedLogoScale] = useState(() => clampLogoScale(initialLogoScale));
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const percentage = Math.round(logoScale * 100);
  const hasChanges = logoScale !== savedLogoScale;
  const desktopWidth = useMemo(() => Math.round(210 * logoScale), [logoScale]);
  const mobileWidth = useMemo(() => Math.round(144 * logoScale), [logoScale]);

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
        setLogoScale(remoteScale);
        setSavedLogoScale(remoteScale);
      } catch {
        // The server-rendered setting remains usable if this refresh is unavailable.
      }
    }

    void loadLatestSetting();
    return () => controller.abort();
  }, [persistenceConfigured]);

  function updateScale(nextValue: number) {
    setLogoScale(clampLogoScale(nextValue));
    setMessage("");
    setError("");
  }

  async function saveChanges() {
    if (!persistenceConfigured || isSaving) return;
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoScale }),
      });
      const payload = await response.json().catch(() => ({})) as SettingsPayload;

      if (!response.ok) {
        setError(payload.error || "The change could not be saved. Please try again.");
        return;
      }

      const saved = logoScaleFromPayload(payload) ?? logoScale;
      setLogoScale(saved);
      setSavedLogoScale(saved);
      setMessage("Saved. The updated logo scale is now used across the public experience.");
    } catch {
      setError("The secure connection is unavailable. Please try again.");
    } finally {
      setIsSaving(false);
    }
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

            <p className={styles.panelCopy}>Increase or reduce the Trussline logo without distorting the artwork or interrupting responsive layouts.</p>

            <div className={styles.scaleReadout} aria-live="polite">
              <output htmlFor="logo-scale" className={styles.scaleValue}>{percentage}%</output>
              <span>Current display scale</span>
            </div>

            <fieldset className={styles.scaleFieldset} disabled={!persistenceConfigured || isSaving}>
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
                onChange={(event) => updateScale(Number(event.target.value))}
                aria-valuetext={`${percentage} percent of the base logo size`}
                style={{ background: `linear-gradient(90deg, var(--blue) 0 ${((logoScale - MIN_LOGO_SCALE) / (MAX_LOGO_SCALE - MIN_LOGO_SCALE)) * 100}%, var(--blue-soft) ${((logoScale - MIN_LOGO_SCALE) / (MAX_LOGO_SCALE - MIN_LOGO_SCALE)) * 100}% 100%)` }}
              />
              <div className={styles.rangeLegend} aria-hidden="true"><span>Compact</span><span>More prominent</span></div>
            </fieldset>

            {!persistenceConfigured ? (
              <div className={styles.setupNotice} role="status">
                <CircleAlert size={18} aria-hidden="true" />
                <p><strong>Saving is being prepared.</strong> Your current logo remains unchanged. Contact the Trussline platform owner to enable publishing.</p>
              </div>
            ) : null}

            <div className={styles.controlActions}>
              <button className={styles.resetButton} type="button" onClick={() => updateScale(DEFAULT_LOGO_SCALE)} disabled={!persistenceConfigured || isSaving || logoScale === DEFAULT_LOGO_SCALE}>
                <RefreshCcw size={16} aria-hidden="true" /> Reset to 120%
              </button>
              <button className={styles.primaryButton} type="button" onClick={saveChanges} disabled={!persistenceConfigured || isSaving || !hasChanges}>
                <Save size={16} aria-hidden="true" />
                {isSaving ? "Saving…" : "Save changes"}
              </button>
            </div>
            <div className={styles.feedback} aria-live="polite">
              {message ? <p className={styles.successMessage}><CheckCircle2 size={16} aria-hidden="true" /> {message}</p> : null}
              {error ? <p className={styles.errorMessage} role="alert"><CircleAlert size={16} aria-hidden="true" /> {error}</p> : null}
            </div>
          </section>

          <section className={styles.previewPanel} aria-labelledby="logo-preview-title">
            <div className={styles.previewHeading}>
              <div>
                <p className={styles.panelKicker}>Live preview</p>
                <h2 id="logo-preview-title">Clear at every breakpoint.</h2>
              </div>
              <span className={styles.previewStatus}><span aria-hidden="true" /> Synchronized</span>
            </div>

            <div className={styles.previewGrid}>
              <article className={styles.desktopPreview} aria-label="Desktop logo preview">
                <div className={styles.previewMeta}><Monitor size={15} aria-hidden="true" /> Desktop navigation</div>
                <div className={styles.desktopBar} data-logo-surface="light">
                  <div className={styles.previewMark} style={previewStyle(desktopWidth)}><BrandLogo /></div>
                  <div className={styles.previewLines} aria-hidden="true"><i /><i /><i /></div>
                </div>
                <p>Wide-screen header</p>
              </article>

              <article className={styles.mobilePreview} aria-label="Mobile logo preview">
                <div className={styles.previewMeta}><Smartphone size={15} aria-hidden="true" /> Mobile navigation</div>
                <div className={styles.phoneFrame}>
                  <div className={styles.phoneBar} data-logo-surface="light">
                    <div className={styles.previewMark} style={previewStyle(mobileWidth)}><BrandLogo /></div>
                    <span className={styles.menuGlyph} aria-hidden="true"><i /><i /><i /></span>
                  </div>
                  <div className={styles.phoneContent} aria-hidden="true"><span /><span /><span /></div>
                </div>
                <p>Phone header</p>
              </article>
            </div>

            <div className={styles.previewNote}>
              <ArrowUpRight size={17} aria-hidden="true" />
              <p>The logo automatically selects its light or dark SVG version for the surface behind it.</p>
            </div>
          </section>
        </div>

        <AdminFooter compact />
      </div>
    </main>
  );
}
