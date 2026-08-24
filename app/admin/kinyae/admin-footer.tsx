import { LockKeyhole, ShieldCheck } from "lucide-react";
import BrandLogo from "@/app/brand-logo";
import styles from "./admin-footer.module.css";

type AdminFooterProps = {
  /** Use when the footer follows a compact administrative surface. */
  compact?: boolean;
};

export default function AdminFooter({ compact = false }: AdminFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={`${styles.footer}${compact ? ` ${styles.compact}` : ""}`}
      aria-labelledby="admin-footer-title"
    >
      <div className={styles.surface} data-logo-surface="dark">
        <div className={styles.content}>
          <div className={styles.brandColumn}>
            <div className={styles.logoWrap}>
              <BrandLogo dark />
            </div>
            <p className={styles.summary}>
              A private workspace for the people responsible for how Trussline appears to learners around the world.
            </p>
            <div className={styles.securitySignal}>
              <LockKeyhole size={15} aria-hidden="true" />
              <span>Administrative session protected</span>
            </div>
          </div>

          <div className={styles.contextColumn}>
            <h2 id="admin-footer-title" className={styles.label}>Workspace details</h2>
            <dl className={styles.details}>
              <div>
                <dt>Workspace</dt>
                <dd>Trussline administration</dd>
              </div>
              <div>
                <dt>Access</dt>
                <dd>Signed-in administrators only</dd>
              </div>
              <div>
                <dt>Support</dt>
                <dd>Use your organisation&apos;s approved administrator channel</dd>
              </div>
            </dl>
            <p className={styles.reassurance}>
              <ShieldCheck size={16} aria-hidden="true" />
              Changes here are limited to the Trussline brand experience.
            </p>
          </div>
        </div>

        <div className={styles.bottomRow}>
          <span>© {year} Trussline Interactive Learning</span>
          <span>Built for meaningful progress.</span>
        </div>
      </div>
    </footer>
  );
}
