"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import BrandLogo from "../../brand-logo";
import styles from "./admin.module.css";

type LoginResponse = {
  error?: string;
};

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

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
        setError(payload.error || "We could not verify those details. Please try again.");
        return;
      }

      window.location.assign("/admin/kinyae");
    } catch {
      setError("The secure connection is unavailable. Please try again.");
    } finally {
      setIsSubmitting(false);
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

        <section className={styles.loginPanel} aria-labelledby="admin-access-title">
          <div className={styles.loginIcon} aria-hidden="true"><ShieldCheck size={23} /></div>
          <p className={styles.eyebrow}>Administration</p>
          <h1 id="admin-access-title">Welcome back.</h1>
          <p className={styles.loginCopy}>Enter the administrator password to manage the Trussline brand experience.</p>

          <form className={styles.loginForm} onSubmit={handleSubmit} noValidate>
            <label className={styles.fieldLabel} htmlFor="admin-password">Administrator password</label>
            <div className={styles.passwordField}>
              <KeyRound size={18} aria-hidden="true" />
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={isSubmitting}
                aria-describedby={error ? "admin-login-error" : undefined}
                placeholder="Enter password"
              />
            </div>
            {error ? <p id="admin-login-error" className={styles.formError} role="alert">{error}</p> : null}
            <button className={styles.primaryButton} type="submit" disabled={isSubmitting || password.length === 0}>
              {isSubmitting ? "Checking access…" : "Open control room"}
              {!isSubmitting ? <ArrowRight size={17} aria-hidden="true" /> : null}
            </button>
          </form>
        </section>

        <p className={styles.loginFootnote}>Protected controls for Trussline Interactive Learning.</p>
      </div>
    </main>
  );
}
