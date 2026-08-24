"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import BrandLogo from "../../brand-logo";
import AdminFooter from "./admin-footer";
import AdminLoginSecurityControls, { type AdminRecoveryAction } from "./admin-login-security-controls";
import AdminPasswordResetGuide from "./admin-password-reset-guide";
import styles from "./admin.module.css";

type LoginResponse = {
  error?: string;
};

type LoginMode = "sign-in" | "reset-password";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<LoginMode>("sign-in");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || password.length === 0) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({})) as LoginResponse;
        setError(payload.error || "We could not verify your access. Please try again.");
        return;
      }

      window.location.assign("/admin/kinyae");
    } catch {
      setError("The secure connection is unavailable. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRecoveryAction(action: AdminRecoveryAction) {
    if (action === "reset-password") {
      setError("");
      setMode("reset-password");
    }
  }

  return (
    <main className={styles.loginShell}>
      <div className={styles.loginCanvas}>
        <header className={styles.loginHeader}>
          <div className={styles.loginBrand} data-logo-surface="light">
            <BrandLogo />
          </div>
          <div className={styles.secureFlag}>
            <LockKeyhole size={14} aria-hidden="true" />
            Secure area
          </div>
        </header>

        {mode === "sign-in" ? (
          <section className={styles.loginPanel} aria-labelledby="admin-access-title">
            <div className={styles.loginIcon} aria-hidden="true"><ShieldCheck size={23} /></div>
            <p className={styles.eyebrow}>Administration</p>
            <h1 id="admin-access-title">Welcome back.</h1>
            <p className={styles.loginCopy}>Enter the administrator password to manage the Trussline brand experience.</p>

            <form className={styles.loginForm} onSubmit={handleSubmit} noValidate>
              <AdminLoginSecurityControls
                password={password}
                onPasswordChange={(value) => {
                  setPassword(value);
                  setError("");
                }}
                disabled={isSubmitting}
                errorId={error ? "admin-login-error" : undefined}
                onRecoveryAction={handleRecoveryAction}
                passwordResetEnabled
                recoveryMessage="One-time codes will be enabled only after a verified named administrator and multi-factor protection are configured. You can safely reset the deployment password now."
              />
              {error ? <p id="admin-login-error" className={styles.formError} role="alert">{error}</p> : null}
              <button className={styles.primaryButton} type="submit" disabled={isSubmitting || password.length === 0}>
                {isSubmitting ? "Checking access…" : "Open control room"}
                {!isSubmitting ? <ArrowRight size={17} aria-hidden="true" /> : null}
              </button>
            </form>
          </section>
        ) : (
          <AdminPasswordResetGuide onReturn={() => setMode("sign-in")} />
        )}

        <AdminFooter compact />
      </div>
    </main>
  );
}
