import type { Metadata } from "next";
import BrandLogo from "@/app/brand-logo";
import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";
import { getSiteBrandSettings, isSiteBrandPersistenceConfigured } from "@/lib/site-brand-settings";
import AdminDashboard from "./admin-dashboard";
import AdminLogin from "./admin-login";
import setupStyles from "./admin-setup.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Administration | Trussline Interactive Learning",
  robots: { index: false, follow: false, nocache: true },
};

export default async function KinyaeAdminPage() {
  const configured = isAdminConfigured();
  const authenticated = configured && await isAdminAuthenticated();

  if (!configured) {
    return <main className={setupStyles.setupPage}>
      <section className={setupStyles.setupCard} aria-labelledby="admin-setup-title">
        <BrandLogo />
        <p className={setupStyles.eyebrow}>TRUSSLINE ADMINISTRATION</p>
        <h1 id="admin-setup-title">This private workspace is not configured yet.</h1>
        <p>Add a fresh <code>TRUSSLINE_ADMIN_PASSWORD</code> in Vercel&apos;s encrypted project settings, then return here. It is never stored in the source code or browser.</p>
      </section>
    </main>;
  }

  if (!authenticated) {
    return <AdminLogin />;
  }

  const settings = await getSiteBrandSettings();
  return <AdminDashboard
    initialLogoScale={settings.logoScale}
    persistenceConfigured={isSiteBrandPersistenceConfigured()}
  />;
}
