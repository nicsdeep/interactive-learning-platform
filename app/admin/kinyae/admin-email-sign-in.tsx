"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, MailCheck, ShieldCheck } from "lucide-react";
import styles from "./admin-email-sign-in.module.css";

type EmailSignInResponse = {
  error?: string;
};

type AdminEmailSignInProps = {
  identityLabel?: string;
  onBack: () => void;
};

export default function AdminEmailSignIn({ identityLabel, onBack }: AdminEmailSignInProps) {
  const [hasRequestedLink, setHasRequestedLink] = useState(false);
  const [code, setCode] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [resendAt, setResendAt] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    if (!resendAt) return;

    const updateCountdown = () => {
      const next = Math.max(0, Math.ceil((resendAt - Date.now()) / 1000));
      setSecondsRemaining(next);
      if (next === 0) setResendAt(0);
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 500);
    return () => window.clearInterval(interval);
  }, [resendAt]);

  async function requestEmailLink() {
    if (isRequesting || secondsRemaining > 0) return;
    setIsRequesting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/otp/request", { method: "POST" });
      const payload = await response.json().catch(() => ({})) as EmailSignInResponse;
      if (!response.ok) {
        const retryAfter = Number(response.headers.get("Retry-After"));
        if (Number.isFinite(retryAfter) && retryAfter > 0) setResendAt(Date.now() + retryAfter * 1_000);
        setError(payload.error || "We could not prepare a secure sign-in link right now. Please use your password or try again shortly.");
        return;
      }

      setHasRequestedLink(true);
      setResendAt(Date.now() + 60_000);
    } catch {
      setError("The secure connection is unavailable. Please try again.");
    } finally {
      setIsRequesting(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isVerifying || code.length < 6) return;
    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch("/api/admin/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const payload = await response.json().catch(() => ({})) as EmailSignInResponse;
      if (!response.ok) {
        setError(payload.error || "We could not verify that code. Check it and try again.");
        return;
      }

      window.location.assign("/admin/kinyae");
    } catch {
      setError("The secure connection is unavailable. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <section className={styles.panel} aria-labelledby="email-sign-in-title">
      <button className={styles.backButton} type="button" onClick={onBack}>
        <ArrowLeft size={16} aria-hidden="true" /> Use password instead
      </button>

      <div className={styles.icon} aria-hidden="true"><MailCheck size={23} /></div>
      <p className={styles.eyebrow}>Secure email sign-in</p>
      <h1 id="email-sign-in-title">Use your verified email.</h1>
      <p className={styles.copy}>We will send a one-time sign-in link to the verified inbox for <strong>{identityLabel || "this administrator account"}</strong>. The email address remains private.</p>

      {!hasRequestedLink ? (
        <button className={styles.primaryButton} type="button" onClick={requestEmailLink} disabled={isRequesting}>
          <MailCheck size={17} aria-hidden="true" />
          {isRequesting ? "Sending secure link…" : "Email me a secure link"}
        </button>
      ) : (
        <>
          <div className={styles.success} role="status">
            <CheckCircle2 size={18} aria-hidden="true" />
            <p>Check your inbox and open the one-time link in this browser to sign in. If your email includes a code instead, enter it below.</p>
          </div>

          <form className={styles.codeForm} onSubmit={verifyCode} noValidate>
            <label htmlFor="administrator-email-code">One-time code</label>
            <input
              id="administrator-email-code"
              name="one-time-code"
              value={code}
              onChange={(event) => {
                setCode(event.target.value.replace(/\s/g, ""));
                setError("");
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              placeholder="Enter your code"
              disabled={isVerifying}
              aria-describedby={error ? "email-sign-in-error" : undefined}
            />
            <button className={styles.verifyButton} type="submit" disabled={isVerifying || code.length < 6}>
              {isVerifying ? "Verifying…" : "Verify code"}
              {!isVerifying ? <ArrowRight size={16} aria-hidden="true" /> : null}
            </button>
          </form>

          <button className={styles.resendButton} type="button" onClick={requestEmailLink} disabled={isRequesting || secondsRemaining > 0}>
            {secondsRemaining > 0 ? `You can request another link in ${secondsRemaining}s` : "Send another secure link"}
          </button>
        </>
      )}

      {error ? <p id="email-sign-in-error" className={styles.error} role="alert"><CircleAlert size={16} aria-hidden="true" /> {error}</p> : null}

      <p className={styles.note}><ShieldCheck size={15} aria-hidden="true" /> This sign-in link can only be used once and expires shortly after it is sent.</p>
    </section>
  );
}
