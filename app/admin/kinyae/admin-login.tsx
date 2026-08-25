"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, KeyRound, LockKeyhole, UserRound } from "lucide-react";
import BrandLogo from "../../brand-logo";
import AdminFooter from "./admin-footer";
import AdminLoginSecurityControls from "./admin-login-security-controls";
import styles from "./admin.module.css";

type LoginResponse = {
  error?: string;
};

type LoginMethod = "username" | "password";

type AdminLoginProps = {
  initialUsername?: string;
};

export default function AdminLogin({ initialUsername = "LazimaIwork.AI" }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [method, setMethod] = useState<LoginMethod>("username");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const accountHandle = initialUsername.trim() || "LazimaIwork.AI";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const isPassword = method === "password";
    if (isSubmitting || (isPassword ? password.length === 0 : username.trim().length === 0)) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(isPassword ? "/api/admin/login" : "/api/admin/username-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isPassword ? { password } : { username }),
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

  function chooseMethod(nextMethod: LoginMethod) {
    setMethod(nextMethod);
    setError("");
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
          <div className={styles.loginIdentity}>
            <div className={styles.adminPortrait}>
              <img src="/admin/nicsdavid-portrait.png" alt="Administrator portrait" draggable={false} />
            </div>
            <p className={styles.eyebrow}>Administration</p>
            <h1 id="admin-access-title">Welcome back.</h1>
            <p className={styles.loginCopy}>Open your Trussline control room.</p>
          </div>

          <form className={styles.loginForm} onSubmit={handleSubmit} noValidate>
            <fieldset className={styles.loginMethodPicker}>
              <legend>Choose how to sign in</legend>
              <div className={styles.loginMethodChoices}>
                <label className={styles.loginMethodChoice} data-selected={method === "username" || undefined}>
                  <input
                    type="radio"
                    name="admin-login-method"
                    value="username"
                    checked={method === "username"}
                    onChange={() => chooseMethod("username")}
                  />
                  <UserRound size={16} aria-hidden="true" />
                  <span>Username</span>
                </label>
                <label className={styles.loginMethodChoice} data-selected={method === "password" || undefined}>
                  <input
                    type="radio"
                    name="admin-login-method"
                    value="password"
                    checked={method === "password"}
                    onChange={() => chooseMethod("password")}
                  />
                  <KeyRound size={16} aria-hidden="true" />
                  <span>Password</span>
                </label>
              </div>
            </fieldset>

            {method === "username" ? (
              <section className={styles.usernameMethod} aria-labelledby="username-login-title">
                <div>
                  <p className={styles.methodKicker}>Fast entry</p>
                  <h2 id="username-login-title">Use your username</h2>
                </div>
                <label htmlFor="administrator-username">Administrator username</label>
                <div className={styles.usernameInput}>
                  <UserRound size={18} aria-hidden="true" />
                  <input
                    id="administrator-username"
                    name="username"
                    value={username}
                    onChange={(event) => {
                      setUsername(event.target.value);
                      setError("");
                    }}
                    maxLength={64}
                    placeholder={accountHandle}
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck="false"
                    required
                  />
                </div>
                <p>Use this on a personal browser you have already set up with your administrator password.</p>
              </section>
            ) : (
              <section className={styles.passwordMethod} aria-labelledby="password-login-title">
                <div>
                  <p className={styles.methodKicker}>Full sign-in</p>
                  <h2 id="password-login-title">Use your password</h2>
                </div>
                <AdminLoginSecurityControls
                  password={password}
                  onPasswordChange={(value) => {
                    setPassword(value);
                    setError("");
                  }}
                  disabled={isSubmitting}
                  errorId={error ? "admin-login-error" : undefined}
                />
                <p className={styles.trustedDeviceNote}>
                  <KeyRound size={15} aria-hidden="true" />
                  After this sign-in, this personal browser can use your username for the next 30 days.
                </p>
              </section>
            )}

            {error ? <p id="admin-login-error" className={styles.formError} role="alert">{error}</p> : null}
            <button
              className={styles.primaryButton}
              type="submit"
              disabled={isSubmitting || (method === "password" ? password.length === 0 : username.trim().length === 0)}
            >
              {isSubmitting ? "Opening control room…" : "Open control room"}
              {!isSubmitting ? <ArrowRight size={17} aria-hidden="true" /> : null}
            </button>
          </form>
        </section>

        <AdminFooter compact />
      </div>
    </main>
  );
}
