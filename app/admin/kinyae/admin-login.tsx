"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, KeyRound, LockKeyhole } from "lucide-react";
import BrandLogo from "../../brand-logo";
import AdminFooter from "./admin-footer";
import AdminEmailSignIn from "./admin-email-sign-in";
import AdminLoginSecurityControls, { type AdminRecoveryAction } from "./admin-login-security-controls";
import AdminPasswordResetGuide from "./admin-password-reset-guide";
import styles from "./admin.module.css";

type LoginResponse = {
  error?: string;
};

type LoginMode = "sign-in" | "email-sign-in" | "reset-password";

type AdminLoginProps = {
  emailLinkEnabled: boolean;
  initialUsername?: string;
};

export default function AdminLogin({ emailLinkEnabled, initialUsername = "LazimaIwork.AI" }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(initialUsername);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<LoginMode>("sign-in");
  const searchParams = useSearchParams();
  const emailLinkExpired = searchParams.get("email-link") === "expired";

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
    if (action === "one-time-code" && emailLinkEnabled) {
      setError("");
      setMode("email-sign-in");
      return;
    }

    if (action === "reset-password") {
      setError("");
      setMode("reset-password");
    }
  }

  function continueWithVerifiedIdentity() {
    if (!emailLinkEnabled || !isRecognisedOwner) return;
    setError("");
    setMode("email-sign-in");
  }

  const isRecognisedOwner = username.trim().toLocaleLowerCase("en-US") === initialUsername.trim().toLocaleLowerCase("en-US");

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
            <div className={styles.loginIdentity}>
              <div className={styles.adminPortrait}>
                <img src="/admin/nicsdavid-portrait.png" alt="Administrator portrait" draggable={false} />
              </div>
              <p className={styles.eyebrow}>Administration</p>
              <h1 id="admin-access-title">Welcome back.</h1>
              <p className={styles.loginCopy}>Sign in to manage the Trussline brand experience.</p>
            </div>

            <form className={styles.loginForm} onSubmit={handleSubmit} noValidate>
              {emailLinkEnabled ? <div className={styles.identitySelector}>
                <label htmlFor="administrator-username">Administrator username</label>
                <div className={styles.identityInputRow}>
                  <input
                    id="administrator-username"
                    name="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    maxLength={64}
                    autoComplete="username"
                    spellCheck="false"
                  />
                  <button type="button" onClick={continueWithVerifiedIdentity} disabled={!isRecognisedOwner}>
                    <KeyRound size={15} aria-hidden="true" /> Continue securely
                  </button>
                </div>
                <p>{isRecognisedOwner ? "Use your handle to choose the account, then confirm access with its verified sign-in method. A username alone never opens the control room." : "Use the owner username shown for this private workspace, then continue with verified sign-in."}</p>
              </div> : null}
              <AdminLoginSecurityControls
                password={password}
                onPasswordChange={(value) => {
                  setPassword(value);
                  setError("");
                }}
                disabled={isSubmitting}
                errorId={error ? "admin-login-error" : undefined}
                onRecoveryAction={handleRecoveryAction}
                oneTimeCodeEnabled={emailLinkEnabled}
                passwordResetEnabled
                recoveryMessage={emailLinkEnabled
                  ? "Use a one-time email link whenever you prefer not to enter a password. You can also reset your administrator password securely."
                  : "You can reset your administrator password securely if you need help signing in."}
              />
              {emailLinkExpired ? <p id="admin-email-link-error" className={styles.formError} role="alert">That secure email link has expired or was already used. Request another link to continue.</p> : null}
              {error ? <p id="admin-login-error" className={styles.formError} role="alert">{error}</p> : null}
              <button className={styles.primaryButton} type="submit" disabled={isSubmitting || password.length === 0}>
                {isSubmitting ? "Checking access…" : "Open control room"}
                {!isSubmitting ? <ArrowRight size={17} aria-hidden="true" /> : null}
              </button>
            </form>
          </section>
        ) : mode === "email-sign-in" ? (
          <AdminEmailSignIn identityLabel={username.trim() || "your administrator account"} onBack={() => setMode("sign-in")} />
        ) : (
          <AdminPasswordResetGuide onReturn={() => setMode("sign-in")} />
        )}

        <AdminFooter compact />
      </div>
    </main>
  );
}
