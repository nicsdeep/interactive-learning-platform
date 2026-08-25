"use client";

import { KeyboardEvent, useId, useMemo, useState } from "react";
import { CircleHelp, Eye, EyeOff, KeyRound } from "lucide-react";
import styles from "./admin-login-security-controls.module.css";

type AdminLoginSecurityControlsProps = {
  /** The password value remains owned by the surrounding login form. */
  password: string;
  onPasswordChange: (value: string) => void;
  disabled?: boolean;
  inputId?: string;
  label?: string;
  /** Lets the parent form attach its server-side error message to this field. */
  errorId?: string;
};

export default function AdminLoginSecurityControls({
  password,
  onPasswordChange,
  disabled = false,
  inputId = "admin-password",
  label = "Administrator password",
  errorId,
}: AdminLoginSecurityControlsProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const helpId = useId();
  const capsLockId = useId();

  const describedBy = useMemo(
    () => [helpId, capsLockOn ? capsLockId : undefined, errorId].filter(Boolean).join(" ") || undefined,
    [capsLockOn, capsLockId, errorId, helpId],
  );

  function updateCapsLock(event: KeyboardEvent<HTMLInputElement>) {
    setCapsLockOn(event.getModifierState("CapsLock"));
  }

  return (
    <section className={styles.securityControls} aria-label="Password security options">
      <label className={styles.label} htmlFor={inputId}>{label}</label>
      <div className={styles.passwordControl} data-password-visible={passwordVisible || undefined}>
        <KeyRound size={18} aria-hidden="true" />
        <input
          id={inputId}
          name="password"
          type={passwordVisible ? "text" : "password"}
          autoComplete="current-password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          onKeyDown={updateCapsLock}
          onKeyUp={updateCapsLock}
          onBlur={() => setCapsLockOn(false)}
          required
          maxLength={512}
          disabled={disabled}
          aria-describedby={describedBy}
          placeholder="Enter password"
        />
        <button
          className={styles.visibilityButton}
          type="button"
          onClick={() => setPasswordVisible((visible) => !visible)}
          disabled={disabled}
          aria-label={passwordVisible ? "Hide password" : "Show password"}
          aria-pressed={passwordVisible}
        >
          {passwordVisible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          <span>{passwordVisible ? "Hide" : "Show"}</span>
        </button>
      </div>

      <div className={styles.fieldSupport}>
        <p id={helpId} className={styles.helperText}>Your password stays private on this device.</p>
        {capsLockOn ? (
          <p id={capsLockId} className={styles.capsLock} aria-live="polite">
            <span aria-hidden="true" />Caps Lock is on
          </p>
        ) : null}
      </div>

      <details className={styles.guidance}>
        <summary>
          <CircleHelp size={16} aria-hidden="true" />
          Password guidance
        </summary>
        <div className={styles.guidanceContent}>
          <p>For the administrator account, choose a unique passphrase of 14 or more characters and keep it in a trusted password manager.</p>
          <ul>
            <li>Use a mix of memorable words, numbers, and symbols.</li>
            <li>Do not reuse a school, email, or personal password.</li>
            <li>This sign-in checks your existing password; it does not score or change it.</li>
          </ul>
        </div>
      </details>

    </section>
  );
}
