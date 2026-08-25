import type { Metadata } from "next";
import BrandLogo from "@/app/brand-logo";
import { getAdminSession, isAdminConfigured } from "@/lib/admin-auth";
import { getAdminWorkspace, getBootstrapOwnerIdentity, hasAdminWorkspacePermission } from "@/lib/admin-workspace";
import AdminWorkspace from "./admin-workspace";
import AdminLogin from "./admin-login";
import setupStyles from "./admin-setup.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Administration | Trussline Interactive Learning",
  robots: { index: false, follow: false, nocache: true },
};

export default async function KinyaeAdminPage() {
  const configured = isAdminConfigured();
  const session = configured ? await getAdminSession() : undefined;
  const authenticated = Boolean(session && await hasAdminWorkspacePermission(session.actorId, "profile"));

  if (!configured) {
    return <main className={setupStyles.setupPage}>
      <section className={setupStyles.setupCard} aria-labelledby="admin-setup-title">
        <BrandLogo />
        <p className={setupStyles.eyebrow}>TRUSSLINE ADMINISTRATION</p>
        <h1 id="admin-setup-title">This private workspace is not configured yet.</h1>
        <p>Contact the Trussline platform owner to finish preparing this private workspace, then return here.</p>
      </section>
    </main>;
  }

  if (!authenticated) {
    const identity = await getBootstrapOwnerIdentity();
    return <AdminLogin initialUsername={identity.username} />;
  }

  return <AdminWorkspace initialWorkspace={await getAdminWorkspace()} />;
}
