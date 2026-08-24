"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import styles from "./admin-password-reset-guide.module.css";

type AdminPasswordResetGuideProps = {
  onReturn: () => void;
};

const characterSets = [
  "ABCDEFGHJKLMNPQRSTUVWXYZ",
  "abcdefghijkmnopqrstuvwxyz",
  "23456789",
  "!@#$%*-_+=",
];

function secureIndex(upperBound: number) {
  const maximum = 0x1_0000_0000;
  const limit = maximum - (maximum % upperBound);
  const values = new Uint32Array(1);

  do {
    crypto.getRandomValues(values);
  } while (values[0] >= limit);

  return values[0] % upperBound;
}

function generatedPassword() {
  const characters = characterSets.map((set) => set[secureIndex(set.length)]);
  const alphabet = characterSets.join("");

  while (characters.length < 22) characters.push(alphabet[secureIndex(alphabet.length)]);

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = secureIndex(index + 1);
    [characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]];
  }

  return characters.join("");
}

export default function AdminPasswordResetGuide({ onReturn }: AdminPasswordResetGuideProps) {
  const [password, setPassword] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");

  function createPassword() {
    setPassword(generatedPassword());
    setCopyState("idle");
  }

  async function copyPassword() {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopyState("copied");
    } catch {
      setCopyState("manual");
    }
  }

  return (
    <section className={styles.guide} aria-labelledby="reset-password-title">
      <button className={styles.backButton} type="button" onClick={onReturn}>
        <ArrowLeft size={16} aria-hidden="true" /> Back to sign in
      </button>

      <div className={styles.icon} aria-hidden="true"><KeyRound size={22} /></div>
      <p className={styles.eyebrow}>Account security</p>
      <h1 id="reset-password-title">Reset your administrator password.</h1>
      <p className={styles.intro}>Your account is protected by an organisation-managed credential. These recovery steps help the account owner update it safely.</p>

      <div className={styles.generator}>
        <div>
          <p className={styles.generatorTitle}>Create a strong replacement</p>
          <p>Generate a unique 22-character password locally on this device. It never leaves this device.</p>
        </div>
        <button className={styles.generateButton} type="button" onClick={createPassword}>
          <RefreshCw size={16} aria-hidden="true" /> {password ? "Generate another" : "Generate password"}
        </button>
        {password ? (
          <div className={styles.generatedPassword}>
            <output aria-label="Generated strong password">{password}</output>
            <button type="button" onClick={copyPassword} aria-label="Copy generated password">
              {copyState === "copied" ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
              {copyState === "copied" ? "Copied" : "Copy"}
            </button>
          </div>
        ) : null}
        {copyState === "manual" ? <p className={styles.copyNotice} role="status">Copying is blocked by this browser. Select the password above and copy it manually.</p> : null}
      </div>

      <ol className={styles.steps}>
        <li><span>1</span><p>Keep the new password in an approved password manager.</p></li>
        <li><span>2</span><p>Use your organisation&apos;s protected administrator credential service to replace the current password.</p></li>
        <li><span>3</span><p>When the security update is confirmed, return here and sign in with the new password.</p></li>
      </ol>

      <aside className={styles.otpNotice} aria-labelledby="one-time-code-title">
        <ShieldCheck size={19} aria-hidden="true" />
        <div>
          <h2 id="one-time-code-title">One-time email sign-in</h2>
          <p>Use the secure one-time link sent to your verified administrator email whenever you prefer not to use a password.</p>
        </div>
      </aside>

      <p className={styles.sessionNote}><LockKeyhole size={14} aria-hidden="true" /> After an account password is updated, existing administrator sessions end when the security update is live.</p>
    </section>
  );
}
