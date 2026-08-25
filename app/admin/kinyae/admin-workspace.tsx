"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenText,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ExternalLink,
  FilePlus2,
  Globe2,
  ImageUp,
  Lightbulb,
  Menu,
  PanelTop,
  Plus,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import BrandLogo from "@/app/brand-logo";
import AdminFooter from "./admin-footer";
import type {
  AdminDesignReference,
  AdminMember,
  AdminMemberStatus,
  AdminPage,
  AdminRecommendation,
  AdminRole,
  AdminWorkspace,
  DesignReferenceProvider,
  SitePageStatus,
  SiteSectionType,
} from "@/lib/admin-workspace";
import styles from "./admin-workspace.module.css";

type WorkspaceArea = "overview" | "profile" | "people" | "pages" | "design" | "guidance";

const navigation: Array<{ id: WorkspaceArea; label: string; icon: typeof PanelTop; note: string }> = [
  { id: "overview", label: "Overview", icon: PanelTop, note: "A clear next step" },
  { id: "profile", label: "My profile", icon: ShieldCheck, note: "Identity and photo" },
  { id: "people", label: "People", icon: UsersRound, note: "Roles and access" },
  { id: "pages", label: "Pages & sections", icon: BookOpenText, note: "Structured content" },
  { id: "design", label: "Design library", icon: Sparkles, note: "Approved references" },
  { id: "guidance", label: "Studio guidance", icon: Lightbulb, note: "Responsive, content, design" },
];

const roles: Array<{ value: Exclude<AdminRole, "owner">; label: string }> = [
  { value: "administrator", label: "Administrator" },
  { value: "editor", label: "Editor" },
  { value: "analyst", label: "Analyst" },
  { value: "viewer", label: "Viewer" },
];

const memberStatuses: Array<{ value: AdminMemberStatus; label: string }> = [
  { value: "invited", label: "Invited" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

const pageStatuses: Array<{ value: SitePageStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "in_review", label: "In review" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const sectionTypes: Array<{ value: SiteSectionType; label: string }> = [
  { value: "hero", label: "Hero" },
  { value: "proof_strip", label: "Proof strip" },
  { value: "region_selector", label: "Region selector" },
  { value: "feature_list", label: "Feature list" },
  { value: "editorial_panel", label: "Editorial panel" },
  { value: "media_story", label: "Media story" },
  { value: "quote", label: "Quote" },
  { value: "stat_grid", label: "Stat grid" },
  { value: "faq", label: "FAQ" },
  { value: "cta", label: "Call to action" },
  { value: "footer", label: "Footer" },
];

function formatRelativeDate(value: string) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Recently";
  const hours = Math.max(0, Math.round((Date.now() - timestamp) / 3_600_000));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

async function readResponse(response: Response) {
  const payload = await response.json().catch(() => ({})) as { error?: string; workspace?: AdminWorkspace; invitationDelivery?: "sent" | "queued" };
  if (!response.ok) throw new Error(payload.error || "That change could not be saved. Please try again.");
  return payload;
}

function statusTone(status: string) {
  if (status === "active" || status === "published" || status === "completed") return "positive";
  if (status === "in_review" || status === "invited" || status === "reviewing") return "attention";
  if (status === "suspended" || status === "archived") return "quiet";
  return "neutral";
}

export default function AdminWorkspace({ initialWorkspace }: { initialWorkspace: AdminWorkspace }) {
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [area, setArea] = useState<WorkspaceArea>("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentAdmin = workspace.currentAdmin;
  const pendingGuidance = useMemo(() => workspace.recommendations.filter((item) => item.status === "open"), [workspace.recommendations]);

  useEffect(() => {
    if (!drawerOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [drawerOpen]);

  async function refreshWorkspace() {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/admin/workspace", { cache: "no-store" });
      const payload = await readResponse(response);
      if (payload.workspace) setWorkspace(payload.workspace);
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "The latest workspace details could not be loaded." });
    } finally {
      setIsRefreshing(false);
    }
  }

  function selectArea(nextArea: WorkspaceArea) {
    setArea(nextArea);
    setDrawerOpen(false);
    setNotice(null);
  }

  if (!workspace.ready) {
    return <main className={styles.preparingShell}>
      <section className={styles.preparingCard} aria-labelledby="workspace-preparing-title">
        <div className={styles.preparingBrand} data-logo-surface="light"><BrandLogo /></div>
        <p className={styles.eyebrow}>Administration workspace</p>
        <h1 id="workspace-preparing-title">Your control room is being prepared.</h1>
        <p>Its secure content, people, and design records are being connected. Your existing brand controls remain protected while this workspace comes online.</p>
        <Link className={styles.primaryLink} href="/admin/kinyae/brand">Open brand controls <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </section>
    </main>;
  }

  const activeNavigation = navigation.find((item) => item.id === area) ?? navigation[0];

  return <main className={styles.workspaceShell}>
    <aside className={styles.desktopRail} aria-label="Administration navigation">
      <WorkspaceBrand />
      <WorkspaceNavigation area={area} onSelect={selectArea} />
      <div className={styles.railBottom}>
        <Link href="/admin/kinyae/brand" className={styles.railBrandLink}><Globe2 size={16} aria-hidden="true" /> Brand scale</Link>
        <p>Every published change stays reviewable.</p>
      </div>
    </aside>

    <div className={styles.workspaceCanvas}>
      <header className={styles.workspaceHeader}>
        <button className={styles.mobileMenuButton} type="button" aria-label="Open administration navigation" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)}>
          <Menu size={23} aria-hidden="true" />
        </button>
        <div className={styles.headerContext}>
          <p className={styles.headerKicker}>Trussline control room</p>
          <div className={styles.headerTitle}><span>{activeNavigation.label}</span><ChevronRight size={15} aria-hidden="true" /><small>{activeNavigation.note}</small></div>
        </div>
        <div className={styles.adminChip}>
          <img src={currentAdmin?.avatarUrl || "/admin/nicsdavid-portrait.png"} alt="" draggable={false} />
          <span><strong>{currentAdmin?.displayName || "Trussline owner"}</strong><small>{currentAdmin?.role || "Owner"}</small></span>
        </div>
      </header>

      {notice ? <div className={styles.workspaceNotice} data-tone={notice.tone} role={notice.tone === "error" ? "alert" : "status"}>
        {notice.tone === "success" ? <CheckCircle2 size={17} aria-hidden="true" /> : <CircleAlert size={17} aria-hidden="true" />}
        <span>{notice.text}</span>
      </div> : null}

      <section className={styles.workspaceContent} aria-live="polite">
        {area === "overview" ? <Overview workspace={workspace} pendingGuidance={pendingGuidance} onNavigate={selectArea} /> : null}
        {area === "profile" ? <ProfileWorkspace workspace={workspace} onRefresh={refreshWorkspace} onNotice={setNotice} /> : null}
        {area === "people" ? <PeopleWorkspace workspace={workspace} onRefresh={refreshWorkspace} onNotice={setNotice} /> : null}
        {area === "pages" ? <PagesWorkspace workspace={workspace} onRefresh={refreshWorkspace} onNotice={setNotice} /> : null}
        {area === "design" ? <DesignWorkspace workspace={workspace} onRefresh={refreshWorkspace} onNotice={setNotice} /> : null}
        {area === "guidance" ? <GuidanceWorkspace recommendations={workspace.recommendations} onNavigate={selectArea} /> : null}
      </section>

      <div className={styles.workspaceFooterWrap}><AdminFooter compact /></div>
    </div>

    {drawerOpen ? <div className={styles.mobileDrawerLayer} role="presentation" onMouseDown={() => setDrawerOpen(false)}>
      <aside className={styles.mobileDrawer} aria-label="Administration navigation" onMouseDown={(event) => event.stopPropagation()}>
        <div className={styles.drawerHeader}><WorkspaceBrand /><button type="button" aria-label="Close administration navigation" onClick={() => setDrawerOpen(false)}><X size={22} aria-hidden="true" /></button></div>
        <WorkspaceNavigation area={area} onSelect={selectArea} />
        <Link href="/admin/kinyae/brand" className={styles.drawerBrandLink} onClick={() => setDrawerOpen(false)}><Globe2 size={16} aria-hidden="true" /> Brand scale</Link>
      </aside>
    </div> : null}
  </main>;
}

function WorkspaceBrand() {
  return <div className={styles.workspaceBrand} data-logo-surface="light"><BrandLogo /></div>;
}

function WorkspaceNavigation({ area, onSelect }: { area: WorkspaceArea; onSelect: (area: WorkspaceArea) => void }) {
  return <nav className={styles.workspaceNavigation} aria-label="Control room sections">
    {navigation.map((item) => {
      const Icon = item.icon;
      return <button key={item.id} type="button" data-active={area === item.id} onClick={() => onSelect(item.id)}>
        <Icon size={18} aria-hidden="true" />
        <span>{item.label}</span>
      </button>;
    })}
  </nav>;
}

function Overview({ workspace, pendingGuidance, onNavigate }: { workspace: AdminWorkspace; pendingGuidance: AdminRecommendation[]; onNavigate: (area: WorkspaceArea) => void }) {
  return <>
    <section className={styles.overviewHero} aria-labelledby="overview-title">
      <div>
        <p className={styles.eyebrow}>Your publishing desk</p>
        <h1 id="overview-title">Build the experience with intent.</h1>
        <p>Bring people, content, approved references, and responsive checks into one focused workspace. Nothing publishes by accident.</p>
      </div>
      <div className={styles.heroActions}>
        <button type="button" className={styles.primaryButton} onClick={() => onNavigate("pages")}><FilePlus2 size={17} aria-hidden="true" /> Create a page</button>
        <Link href="/admin/kinyae/brand" className={styles.textAction}>Adjust brand scale <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </div>
    </section>

    <section className={styles.metrics} aria-label="Workspace summary">
      <Metric label="Active people" value={workspace.members.filter((member) => member.status === "active").length} detail="Roles stay explicit" accent="teal" />
      <Metric label="Editable pages" value={workspace.pages.length} detail="Drafts are reviewable" accent="blue" />
      <Metric label="Design references" value={workspace.references.length} detail="Links keep provenance" accent="coral" />
      <Metric label="Open guidance" value={pendingGuidance.length} detail="Useful next checks" accent="amber" />
    </section>

    <section className={styles.overviewGrid}>
      <article className={styles.featurePanel}>
        <div className={styles.sectionHeading}><div><p className={styles.panelKicker}>Next step</p><h2>Make the first page editable.</h2></div><BookOpenText size={21} aria-hidden="true" /></div>
        <p>Sections are typed blocks, not free-form code. That keeps the design adaptable as Trussline grows across regions and devices.</p>
        <button type="button" className={styles.outlineButton} onClick={() => onNavigate("pages")}>Open pages &amp; sections <ChevronRight size={16} aria-hidden="true" /></button>
      </article>
      <article className={styles.guidancePanel}>
        <div className={styles.sectionHeading}><div><p className={styles.panelKicker}>Studio guidance</p><h2>What deserves attention.</h2></div><Lightbulb size={21} aria-hidden="true" /></div>
        <div className={styles.miniGuidanceList}>
          {pendingGuidance.slice(0, 3).map((item) => <div key={item.id}><span data-priority={item.priority} aria-hidden="true" /><p><strong>{item.title}</strong><small>{item.scope} check</small></p></div>)}
        </div>
        <button type="button" className={styles.textButton} onClick={() => onNavigate("guidance")}>View all guidance <ArrowUpRight size={15} aria-hidden="true" /></button>
      </article>
    </section>

    <section className={styles.activityPanel} aria-labelledby="recent-activity-title">
      <div className={styles.sectionHeading}><div><p className={styles.panelKicker}>Accountability</p><h2 id="recent-activity-title">Recent workspace activity</h2></div><ShieldCheck size={20} aria-hidden="true" /></div>
      {workspace.activity.length ? <ol className={styles.activityList}>{workspace.activity.map((item) => <li key={item.id}><span className={styles.activityDot} aria-hidden="true" /><p><strong>{item.action.replaceAll(".", " · ")}</strong><small>{item.targetType.replaceAll("_", " ")} · {formatRelativeDate(item.occurredAt)}</small></p></li>)}</ol> : <p className={styles.emptyCopy}>The first meaningful change you make here will appear in the private activity record.</p>}
    </section>
  </>;
}

function Metric({ label, value, detail, accent }: { label: string; value: number; detail: string; accent: string }) {
  return <article className={styles.metric} data-accent={accent}><p>{label}</p><strong>{value}</strong><small>{detail}</small></article>;
}

function ProfileWorkspace({ workspace, onRefresh, onNotice }: { workspace: AdminWorkspace; onRefresh: () => Promise<void>; onNotice: (notice: { tone: "success" | "error"; text: string } | null) => void }) {
  const admin = workspace.currentAdmin;
  const [displayName, setDisplayName] = useState(admin?.displayName ?? "");
  const [username, setUsername] = useState(admin?.username ?? "LazimaIwork.AI");
  const [avatarPreview, setAvatarPreview] = useState(admin?.avatarUrl ?? "/admin/nicsdavid-portrait.png");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayName(admin?.displayName ?? "");
    setUsername(admin?.username ?? "LazimaIwork.AI");
    setAvatarPreview(admin?.avatarUrl ?? "/admin/nicsdavid-portrait.png");
  }, [admin]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    onNotice(null);
    try {
      await readResponse(await fetch("/api/admin/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName, username }) }));
      await onRefresh();
      onNotice({ tone: "success", text: "Your profile details are saved." });
    } catch (error) {
      onNotice({ tone: "error", text: error instanceof Error ? error.message : "Your profile could not be saved." });
    } finally {
      setSaving(false);
    }
  }

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setSaving(true);
    onNotice(null);
    try {
      const data = new FormData();
      data.set("avatar", file);
      await readResponse(await fetch("/api/admin/profile/avatar", { method: "POST", body: data }));
      await onRefresh();
      onNotice({ tone: "success", text: "Your profile photo is updated and stored privately." });
    } catch (error) {
      setAvatarPreview(admin?.avatarUrl ?? "/admin/nicsdavid-portrait.png");
      onNotice({ tone: "error", text: error instanceof Error ? error.message : "Your profile photo could not be saved." });
    } finally {
      URL.revokeObjectURL(objectUrl);
      setSaving(false);
      event.currentTarget.value = "";
    }
  }

  return <section className={styles.detailArea} aria-labelledby="profile-title">
    <div className={styles.pageHeading}><div><p className={styles.eyebrow}>Account identity</p><h1 id="profile-title">A profile that stays recognisable.</h1><p>Update how the owner appears across the private workspace. Your handle is an identity cue; verified sign-in still protects access.</p></div></div>
    <div className={styles.profileLayout}>
      <article className={styles.profileCard}>
        <div className={styles.profilePhotoWrap}><img src={avatarPreview} alt="Current profile" draggable={false} /><label className={styles.photoUpload}><ImageUp size={16} aria-hidden="true" /> Change photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadAvatar} disabled={saving} /></label></div>
        <p className={styles.fieldHint}>JPEG, PNG, or WebP · up to 5 MB. Your photo is stored in a private admin area.</p>
      </article>
      <form className={styles.editorCard} onSubmit={saveProfile}>
        <div className={styles.formHeader}><div><p className={styles.panelKicker}>Profile details</p><h2>How you appear</h2></div><span className={styles.statusPill} data-tone="positive">Owner</span></div>
        <label>Display name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={120} required /></label>
        <label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} maxLength={64} pattern="[A-Za-z0-9._-]{3,64}" required /></label>
        <p className={styles.fieldHint}>For example: LazimaIwork.AI. A username is never enough to sign in—it only identifies the account before verified authentication.</p>
        <button className={styles.primaryButton} type="submit" disabled={saving}>{saving ? "Saving…" : "Save profile"}<ChevronRight size={16} aria-hidden="true" /></button>
      </form>
    </div>
    <section className={styles.securityCard}><ShieldCheck size={20} aria-hidden="true" /><div><h2>Protected by verified sign-in</h2><p>Passwordless sign-in is available only through the verified administrator method. Passwords, email addresses, tokens, and deployment settings are never displayed here.</p></div></section>
  </section>;
}

function PeopleWorkspace({ workspace, onRefresh, onNotice }: { workspace: AdminWorkspace; onRefresh: () => Promise<void>; onNotice: (notice: { tone: "success" | "error"; text: string } | null) => void }) {
  const [form, setForm] = useState({ displayName: "", username: "", email: "", role: "editor" as Exclude<AdminRole, "owner"> });
  const [saving, setSaving] = useState(false);

  async function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    onNotice(null);
    try {
      const payload = await readResponse(await fetch("/api/admin/members", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }));
      await onRefresh();
      setForm({ displayName: "", username: "", email: "", role: "editor" });
      onNotice({ tone: "success", text: payload.invitationDelivery === "sent" ? "The invitation was sent and is recorded in People." : "The person was added as a pending invitation. Email delivery can be finished when the secure mail provider is ready." });
    } catch (error) {
      onNotice({ tone: "error", text: error instanceof Error ? error.message : "The person could not be added." });
    } finally {
      setSaving(false);
    }
  }

  return <section className={styles.detailArea} aria-labelledby="people-title">
    <div className={styles.pageHeading}><div><p className={styles.eyebrow}>People and permissions</p><h1 id="people-title">Invite with purpose. Keep authority clear.</h1><p>People get only the access they need. The founding owner is protected from accidental role or access changes.</p></div></div>
    <div className={styles.peopleLayout}>
      <form className={styles.inviteCard} onSubmit={addMember}>
        <div className={styles.formHeader}><div><p className={styles.panelKicker}>Invite a person</p><h2>Start with a role.</h2></div><Plus size={20} aria-hidden="true" /></div>
        <label>Full name<input value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} maxLength={120} required /></label>
        <label>Username<input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="e.g. anika.m" maxLength={64} required /></label>
        <label>Verified email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@example.com" maxLength={320} required /></label>
        <label>Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as Exclude<AdminRole, "owner"> })}>{roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
        <p className={styles.fieldHint}>An invitation is recorded first. The recipient must still prove ownership of their verified email before any future named session can be active.</p>
        <button className={styles.primaryButton} type="submit" disabled={saving}>{saving ? "Adding…" : "Add person"}<ChevronRight size={16} aria-hidden="true" /></button>
      </form>
      <div className={styles.memberList}>
        {workspace.members.map((member) => <MemberCard key={member.id} member={member} onRefresh={onRefresh} onNotice={onNotice} />)}
      </div>
    </div>
  </section>;
}

function MemberCard({ member, onRefresh, onNotice }: { member: AdminMember; onRefresh: () => Promise<void>; onNotice: (notice: { tone: "success" | "error"; text: string } | null) => void }) {
  const [role, setRole] = useState(member.role);
  const [status, setStatus] = useState(member.status);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setRole(member.role); setStatus(member.status); }, [member.role, member.status]);

  async function saveMember() {
    if (member.isBootstrapOwner) return;
    setSaving(true);
    onNotice(null);
    try {
      await readResponse(await fetch(`/api/admin/members/${member.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role, status }) }));
      await onRefresh();
      onNotice({ tone: "success", text: `${member.displayName}'s access is updated.` });
    } catch (error) {
      onNotice({ tone: "error", text: error instanceof Error ? error.message : "That access change could not be saved." });
    } finally {
      setSaving(false);
    }
  }

  return <article className={styles.memberCard}>
    <div className={styles.memberIdentity}><img src={member.avatarUrl} alt="" draggable={false} /><div><strong>{member.displayName}</strong><span>@{member.username}</span></div><span className={styles.statusPill} data-tone={statusTone(member.status)}>{member.status}</span></div>
    <div className={styles.memberMeta}><span>{member.email || "Verified email pending"}</span>{member.lastSignedInAt ? <small>Last signed in {formatRelativeDate(member.lastSignedInAt)}</small> : <small>Awaiting verified sign-in</small>}</div>
    {member.isBootstrapOwner ? <p className={styles.protectedMember}><ShieldCheck size={15} aria-hidden="true" /> Founding owner · update identity in My profile</p> : <div className={styles.memberControls}><label>Role<select value={role} onChange={(event) => setRole(event.target.value as AdminRole)}>{roles.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label>Status<select value={status} onChange={(event) => setStatus(event.target.value as AdminMemberStatus)}>{memberStatuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><button type="button" className={styles.smallSaveButton} disabled={saving || (role === member.role && status === member.status)} onClick={saveMember}>{saving ? "Saving…" : "Save"}</button></div>}
  </article>;
}

function PagesWorkspace({ workspace, onRefresh, onNotice }: { workspace: AdminWorkspace; onRefresh: () => Promise<void>; onNotice: (notice: { tone: "success" | "error"; text: string } | null) => void }) {
  const [newPage, setNewPage] = useState({ title: "", slug: "", navigationLabel: "", summary: "" });
  const [creating, setCreating] = useState(false);

  async function createPage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    onNotice(null);
    try {
      await readResponse(await fetch("/api/admin/pages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newPage) }));
      await onRefresh();
      setNewPage({ title: "", slug: "", navigationLabel: "", summary: "" });
      onNotice({ tone: "success", text: "The draft page is ready. Add purposeful sections before publishing it." });
    } catch (error) {
      onNotice({ tone: "error", text: error instanceof Error ? error.message : "The page could not be created." });
    } finally {
      setCreating(false);
    }
  }

  return <section className={styles.detailArea} aria-labelledby="pages-title">
    <div className={styles.pageHeading}><div><p className={styles.eyebrow}>Content system</p><h1 id="pages-title">Pages made of reliable sections.</h1><p>Start with the content, then build the layout from a small family of responsive section types. Drafts never reach learners until an owner or administrator publishes them.</p></div></div>
    <div className={styles.pagesLayout}>
      <form className={styles.newPageCard} onSubmit={createPage}>
        <div className={styles.formHeader}><div><p className={styles.panelKicker}>New draft</p><h2>Create a page</h2></div><FilePlus2 size={20} aria-hidden="true" /></div>
        <label>Page title<input value={newPage.title} onChange={(event) => setNewPage({ ...newPage, title: event.target.value })} maxLength={160} required /></label>
        <label>Page address<input value={newPage.slug} onChange={(event) => setNewPage({ ...newPage, slug: event.target.value.toLowerCase() })} placeholder="/about" pattern="/[a-z0-9/_-]+" required /></label>
        <label>Navigation label<input value={newPage.navigationLabel} onChange={(event) => setNewPage({ ...newPage, navigationLabel: event.target.value })} maxLength={80} /></label>
        <label>Short purpose<textarea value={newPage.summary} onChange={(event) => setNewPage({ ...newPage, summary: event.target.value })} maxLength={500} rows={3} /></label>
        <button className={styles.primaryButton} type="submit" disabled={creating}>{creating ? "Creating…" : "Create draft"}<ChevronRight size={16} aria-hidden="true" /></button>
      </form>
      <div className={styles.pageList}>{workspace.pages.map((page) => <PageCard key={page.id} page={page} onRefresh={onRefresh} onNotice={onNotice} />)}{!workspace.pages.length ? <p className={styles.emptyCopy}>Your first page will appear here, with its draft, sections, and review state.</p> : null}</div>
    </div>
  </section>;
}

function PageCard({ page, onRefresh, onNotice }: { page: AdminPage; onRefresh: () => Promise<void>; onNotice: (notice: { tone: "success" | "error"; text: string } | null) => void }) {
  const [status, setStatus] = useState(page.status);
  const [sectionType, setSectionType] = useState<SiteSectionType>("feature_list");
  const [sectionKey, setSectionKey] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => setStatus(page.status), [page.status]);

  async function updateStatus() {
    setSaving(true);
    onNotice(null);
    try {
      await readResponse(await fetch(`/api/admin/pages/${page.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }));
      await onRefresh();
      onNotice({ tone: "success", text: status === "published" ? "The page has been published." : "The page status is updated." });
    } catch (error) {
      onNotice({ tone: "error", text: error instanceof Error ? error.message : "The page could not be updated." });
      setStatus(page.status);
    } finally { setSaving(false); }
  }

  async function addSection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    onNotice(null);
    try {
      await readResponse(await fetch(`/api/admin/pages/${page.id}/sections`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sectionType, sectionKey }) }));
      await onRefresh();
      setSectionKey("");
      onNotice({ tone: "success", text: "The section was added to the latest editable revision." });
    } catch (error) {
      onNotice({ tone: "error", text: error instanceof Error ? error.message : "The section could not be added." });
    } finally { setSaving(false); }
  }

  return <article className={styles.pageCard}>
    <div className={styles.pageCardTop}><div><span className={styles.pagePath}>{page.slug}</span><h2>{page.title}</h2><p>{page.summary || "No summary yet."}</p></div><span className={styles.statusPill} data-tone={statusTone(page.status)}>{page.status.replace("_", " ")}</span></div>
    <div className={styles.pageFacts}><span>{page.revisionCount} {page.revisionCount === 1 ? "revision" : "revisions"}</span><span>{page.sectionCount} {page.sectionCount === 1 ? "section" : "sections"}</span><span>Edited {formatRelativeDate(page.updatedAt)}</span></div>
    <div className={styles.pageActionRow}><label>Publishing state<select value={status} onChange={(event) => setStatus(event.target.value as SitePageStatus)}>{pageStatuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><button type="button" className={styles.smallSaveButton} disabled={saving || status === page.status} onClick={updateStatus}>{saving ? "Saving…" : "Save state"}</button></div>
    <form className={styles.addSectionForm} onSubmit={addSection}><label>Section type<select value={sectionType} onChange={(event) => setSectionType(event.target.value as SiteSectionType)}>{sectionTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label>Short section name<input value={sectionKey} onChange={(event) => setSectionKey(event.target.value)} placeholder="e.g. global-proof" maxLength={80} required /></label><button type="submit" className={styles.textButton} disabled={saving}><Plus size={16} aria-hidden="true" /> Add section</button></form>
  </article>;
}

function DesignWorkspace({ workspace, onRefresh, onNotice }: { workspace: AdminWorkspace; onRefresh: () => Promise<void>; onNotice: (notice: { tone: "success" | "error"; text: string } | null) => void }) {
  const [form, setForm] = useState({ provider: "pinterest" as DesignReferenceProvider, sourceUrl: "", title: "", purpose: "", notes: "", tags: "" });
  const [saving, setSaving] = useState(false);

  async function addReference(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    onNotice(null);
    try {
      await readResponse(await fetch("/api/admin/design-references", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) }) }));
      await onRefresh();
      setForm({ provider: "pinterest", sourceUrl: "", title: "", purpose: "", notes: "", tags: "" });
      onNotice({ tone: "success", text: "The reference was saved with its source link and purpose." });
    } catch (error) {
      onNotice({ tone: "error", text: error instanceof Error ? error.message : "The reference could not be saved." });
    } finally { setSaving(false); }
  }

  return <section className={styles.detailArea} aria-labelledby="design-title">
    <div className={styles.pageHeading}><div><p className={styles.eyebrow}>Design library</p><h1 id="design-title">Learn from references without copying them.</h1><p>Save the original link, describe the principle worth carrying forward, and keep the result uniquely Trussline.</p></div></div>
    <section className={styles.sourceEthics}><Globe2 size={20} aria-hidden="true" /><div><h2>Reference links, not a scraper</h2><p>Pinterest, Behance, Dribbble, and other sources stay on their original platforms. Future connected imports will require each provider&apos;s official consent flow.</p></div></section>
    <div className={styles.designLayout}>
      <form className={styles.referenceForm} onSubmit={addReference}>
        <div className={styles.formHeader}><div><p className={styles.panelKicker}>New reference</p><h2>Save a design direction</h2></div><Sparkles size={20} aria-hidden="true" /></div>
        <label>Source<select value={form.provider} onChange={(event) => setForm({ ...form, provider: event.target.value as DesignReferenceProvider })}><option value="pinterest">Pinterest</option><option value="behance">Behance</option><option value="dribbble">Dribbble</option><option value="awwwards">Awwwards</option><option value="manual">Manual reference</option><option value="other">Other source</option></select></label>
        <label>Original HTTPS link<input type="url" value={form.sourceUrl} onChange={(event) => setForm({ ...form, sourceUrl: event.target.value })} placeholder="https://…" required /></label>
        <label>Reference title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={180} required /></label>
        <label>What is useful here?<input value={form.purpose} onChange={(event) => setForm({ ...form, purpose: event.target.value })} maxLength={240} placeholder="e.g. calm mobile hierarchy" /></label>
        <label>Tags<textarea value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} rows={2} placeholder="mobile, navigation, editorial" /></label>
        <label>Private notes<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} maxLength={2000} /></label>
        <button className={styles.primaryButton} type="submit" disabled={saving}>{saving ? "Saving…" : "Save reference"}<ChevronRight size={16} aria-hidden="true" /></button>
      </form>
      <div className={styles.referenceList}>{workspace.references.map((reference) => <ReferenceCard key={reference.id} reference={reference} />)}{!workspace.references.length ? <p className={styles.emptyCopy}>Save the references that sharpen the product, then record the principle—not a copied layout.</p> : null}</div>
    </div>
  </section>;
}

function ReferenceCard({ reference }: { reference: AdminDesignReference }) {
  return <article className={styles.referenceCard}>
    <div className={styles.referenceMeta}><span>{reference.provider}</span><span className={styles.statusPill} data-tone={statusTone(reference.status)}>{reference.status}</span></div>
    <h2>{reference.title}</h2><p>{reference.purpose || "No design principle recorded yet."}</p>
    {reference.tags.length ? <div className={styles.tags}>{reference.tags.map((tag) => <span key={tag}>{tag}</span>)}</div> : null}
    {reference.notes ? <p className={styles.referenceNotes}>{reference.notes}</p> : null}
    <a href={reference.sourceUrl} target="_blank" rel="noreferrer" className={styles.sourceLink}>Open original <ExternalLink size={15} aria-hidden="true" /></a>
  </article>;
}

function GuidanceWorkspace({ recommendations, onNavigate }: { recommendations: AdminRecommendation[]; onNavigate: (area: WorkspaceArea) => void }) {
  return <section className={styles.detailArea} aria-labelledby="guidance-title">
    <div className={styles.pageHeading}><div><p className={styles.eyebrow}>Studio guidance</p><h1 id="guidance-title">Helpful advice, never hidden automation.</h1><p>These checks make responsive, editorial, and content risks visible. They do not publish or overwrite work for you.</p></div></div>
    <section className={styles.aiBoundary}><Sparkles size={21} aria-hidden="true" /><div><h2>AI-ready, human-reviewed</h2><p>Today&apos;s guidance is based on clear product rules. An approved AI service can later add structured suggestions, but it will only ever propose a change for review—not touch learner data or publish on its own.</p></div></section>
    <div className={styles.recommendationList}>{recommendations.map((recommendation) => <article className={styles.recommendationCard} key={recommendation.id} data-priority={recommendation.priority}><div className={styles.recommendationTop}><span className={styles.statusPill} data-tone={recommendation.source === "ai" ? "attention" : "neutral"}>{recommendation.source === "ai" ? "AI proposal" : "Studio rule"}</span><span className={styles.recommendationScope}>{recommendation.scope}</span></div><h2>{recommendation.title}</h2><p>{recommendation.rationale}</p>{recommendation.suggestedAction ? <div className={styles.suggestedAction}><strong>Suggested next step</strong><span>{recommendation.suggestedAction}</span></div> : null}</article>)}</div>
    <button type="button" className={styles.outlineButton} onClick={() => onNavigate("pages")}>Review page structure <ChevronRight size={16} aria-hidden="true" /></button>
  </section>;
}
