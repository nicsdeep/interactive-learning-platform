import "server-only";

import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const ADMIN_ASSET_BUCKET = "trussline-admin-assets";
const FALLBACK_AVATAR = "/admin/nicsdavid-portrait.png";
const ADMIN_ROLES = ["owner", "administrator", "editor", "analyst", "viewer"] as const;
const ASSIGNABLE_ROLES = ["administrator", "editor", "analyst", "viewer"] as const;
const MEMBER_STATUSES = ["invited", "active", "inactive", "suspended"] as const;
const PAGE_STATUSES = ["draft", "in_review", "published", "archived"] as const;
const REFERENCE_PROVIDERS = ["pinterest", "behance", "dribbble", "awwwards", "manual", "other"] as const;
const REFERENCE_STATUSES = ["saved", "reviewing", "approved", "archived"] as const;
const SECTION_TYPES = [
  "hero",
  "proof_strip",
  "region_selector",
  "feature_list",
  "editorial_panel",
  "media_story",
  "quote",
  "stat_grid",
  "faq",
  "cta",
  "footer",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];
export type AdminMemberStatus = (typeof MEMBER_STATUSES)[number];
export type SitePageStatus = (typeof PAGE_STATUSES)[number];
export type DesignReferenceProvider = (typeof REFERENCE_PROVIDERS)[number];
export type DesignReferenceStatus = (typeof REFERENCE_STATUSES)[number];
export type SiteSectionType = (typeof SECTION_TYPES)[number];
export type AdminWorkspacePermission = "profile" | "people" | "content" | "publish" | "design" | "recommendations";

export type AdminMember = {
  id: string;
  username: string;
  email: string | null;
  displayName: string;
  avatarUrl: string;
  avatarAlt: string | null;
  role: AdminRole;
  status: AdminMemberStatus;
  isBootstrapOwner: boolean;
  lastSignedInAt: string | null;
  updatedAt: string;
};

export type AdminPage = {
  id: string;
  slug: string;
  title: string;
  navigationLabel: string | null;
  summary: string | null;
  status: SitePageStatus;
  updatedAt: string;
  revisionCount: number;
  sectionCount: number;
};

export type AdminDesignReference = {
  id: string;
  provider: DesignReferenceProvider;
  sourceUrl: string;
  title: string;
  purpose: string | null;
  tags: string[];
  notes: string | null;
  status: DesignReferenceStatus;
  rightsStatus: "link_only" | "owned_upload" | "licensed_upload";
  updatedAt: string;
};

export type AdminRecommendation = {
  id: string;
  scope: "responsive" | "accessibility" | "content" | "design" | "performance" | "security";
  priority: "critical" | "high" | "normal" | "low";
  title: string;
  rationale: string;
  suggestedAction: string | null;
  source: "rules" | "ai";
  status: "open" | "accepted" | "dismissed" | "completed";
  createdAt: string;
  isGenerated?: boolean;
};

export type AdminAuditEvent = {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  occurredAt: string;
};

export type AdminWorkspace = {
  ready: boolean;
  persistenceConfigured: boolean;
  currentAdmin: AdminMember | null;
  members: AdminMember[];
  pages: AdminPage[];
  references: AdminDesignReference[];
  recommendations: AdminRecommendation[];
  activity: AdminAuditEvent[];
};

type AdminMemberRow = {
  id: string;
  username: string;
  email: string | null;
  display_name: string;
  avatar_path: string | null;
  avatar_alt: string | null;
  role: AdminRole;
  status: AdminMemberStatus;
  is_bootstrap_owner: boolean;
  last_signed_in_at: string | null;
  updated_at: string;
};

type PageRow = {
  id: string;
  slug: string;
  title: string;
  navigation_label: string | null;
  summary: string | null;
  status: SitePageStatus;
  updated_at: string;
};

type RevisionRow = { id: string; page_id: string };
type SectionRow = { id: string; revision_id: string };

function publicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return url && publishableKey ? { url, publishableKey } : undefined;
}

function serviceSupabaseConfig() {
  const publicConfig = publicSupabaseConfig();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    || process.env.vercel_admin_settings_live?.trim();
  return publicConfig && serviceKey ? { ...publicConfig, serviceKey } : undefined;
}

export function isAdminWorkspacePersistenceConfigured() {
  return Boolean(serviceSupabaseConfig());
}

/**
 * Named sessions are checked against an active member on every new workspace
 * route. A password-only session is the narrowly-scoped legacy bootstrap path
 * retained until the verified owner completes named-owner enrolment.
 */
export async function hasAdminWorkspacePermission(authUserId: string | undefined, permission: AdminWorkspacePermission) {
  if (!authUserId) return true;
  const client = adminClient();
  if (!client) return false;
  const result = await client.from("admin_members").select("role, status").eq("auth_user_id", authUserId).maybeSingle();
  const member = result.data as { role?: AdminRole; status?: AdminMemberStatus } | null;
  if (result.error || !member || member.status !== "active" || !member.role) return false;
  if (member.role === "owner" || member.role === "administrator") return true;
  if (permission === "profile") return true;
  return member.role === "editor" && (permission === "content" || permission === "design");
}

function adminClient(): SupabaseClient | undefined {
  const config = serviceSupabaseConfig();
  if (!config) return undefined;

  return createClient(config.url, config.serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function asRole(value: unknown): AdminRole | undefined {
  return typeof value === "string" && (ADMIN_ROLES as readonly string[]).includes(value) ? value as AdminRole : undefined;
}

function asAssignableRole(value: unknown): Exclude<AdminRole, "owner"> | undefined {
  return typeof value === "string" && (ASSIGNABLE_ROLES as readonly string[]).includes(value)
    ? value as Exclude<AdminRole, "owner">
    : undefined;
}

function asMemberStatus(value: unknown): AdminMemberStatus | undefined {
  return typeof value === "string" && (MEMBER_STATUSES as readonly string[]).includes(value)
    ? value as AdminMemberStatus
    : undefined;
}

function asPageStatus(value: unknown): SitePageStatus | undefined {
  return typeof value === "string" && (PAGE_STATUSES as readonly string[]).includes(value)
    ? value as SitePageStatus
    : undefined;
}

function asReferenceProvider(value: unknown): DesignReferenceProvider | undefined {
  return typeof value === "string" && (REFERENCE_PROVIDERS as readonly string[]).includes(value)
    ? value as DesignReferenceProvider
    : undefined;
}

function asReferenceStatus(value: unknown): DesignReferenceStatus | undefined {
  return typeof value === "string" && (REFERENCE_STATUSES as readonly string[]).includes(value)
    ? value as DesignReferenceStatus
    : undefined;
}

function asSectionType(value: unknown): SiteSectionType | undefined {
  return typeof value === "string" && (SECTION_TYPES as readonly string[]).includes(value)
    ? value as SiteSectionType
    : undefined;
}

function safeText(value: unknown, maximum: number) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= maximum ? trimmed : undefined;
}

function safeOptionalText(value: unknown, maximum: number) {
  if (value === null || value === "") return null;
  return safeText(value, maximum);
}

function normalizeEmail(value: unknown) {
  const email = safeText(value, 320)?.toLocaleLowerCase("en-US");
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined;
}

function normalizeUsername(value: unknown) {
  const username = safeText(value, 64);
  return username && /^[A-Za-z0-9._-]{3,64}$/.test(username) ? username : undefined;
}

function normalizeSlug(value: unknown) {
  const slug = safeText(value, 160);
  return slug && /^\/[a-z0-9][a-z0-9/_-]*$/.test(slug) ? slug : undefined;
}

function normalizeHttpsUrl(value: unknown) {
  const raw = safeText(value, 2_000);
  if (!raw) return undefined;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "https:" ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}

async function avatarUrl(client: SupabaseClient, path: string | null) {
  if (!path) return FALLBACK_AVATAR;
  const result = await client.storage.from(ADMIN_ASSET_BUCKET).createSignedUrl(path, 60 * 60);
  return result.data?.signedUrl || FALLBACK_AVATAR;
}

async function publicMember(client: SupabaseClient, row: AdminMemberRow): Promise<AdminMember> {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: await avatarUrl(client, row.avatar_path),
    avatarAlt: row.avatar_alt,
    role: row.role,
    status: row.status,
    isBootstrapOwner: row.is_bootstrap_owner,
    lastSignedInAt: row.last_signed_in_at,
    updatedAt: row.updated_at,
  };
}

function generatedRecommendations(pages: AdminPage[], references: AdminDesignReference[]): AdminRecommendation[] {
  const now = new Date().toISOString();
  const suggestions: AdminRecommendation[] = [];

  if (!pages.length) {
    suggestions.push({
      id: "rule:first-page",
      scope: "content",
      priority: "high",
      title: "Create the first editable page",
      rationale: "A page becomes safer to evolve when its sections are structured rather than embedded as one-off markup.",
      suggestedAction: "Start with a Home draft and add only the sections you need.",
      source: "rules",
      status: "open",
      createdAt: now,
      isGenerated: true,
    });
  }

  if (pages.some((page) => page.status === "draft" || page.status === "in_review")) {
    suggestions.push({
      id: "rule:publish-review",
      scope: "responsive",
      priority: "normal",
      title: "Review drafts at phone width before publishing",
      rationale: "A mobile-first review catches crowded headings, clipped actions, and controls that are difficult to tap.",
      suggestedAction: "Use the responsive preview for each draft before it is published.",
      source: "rules",
      status: "open",
      createdAt: now,
      isGenerated: true,
    });
  }

  if (!references.length) {
    suggestions.push({
      id: "rule:design-library",
      scope: "design",
      priority: "normal",
      title: "Save a design direction with provenance",
      rationale: "Reference links keep visual decisions clear without copying third-party layouts or images.",
      suggestedAction: "Add a Pinterest, Behance, Dribbble, or approved external reference and record what to learn from it.",
      source: "rules",
      status: "open",
      createdAt: now,
      isGenerated: true,
    });
  }

  return suggestions;
}

export async function getAdminWorkspace(): Promise<AdminWorkspace> {
  const client = adminClient();
  if (!client) {
    return {
      ready: false,
      persistenceConfigured: false,
      currentAdmin: null,
      members: [],
      pages: [],
      references: [],
      recommendations: [],
      activity: [],
    };
  }

  try {
    const [membersResult, pagesResult, revisionsResult, sectionsResult, referencesResult, recommendationsResult, activityResult] = await Promise.all([
      client.from("admin_members").select("id, username, email, display_name, avatar_path, avatar_alt, role, status, is_bootstrap_owner, last_signed_in_at, updated_at").order("is_bootstrap_owner", { ascending: false }).order("display_name"),
      client.from("site_pages").select("id, slug, title, navigation_label, summary, status, updated_at").order("updated_at", { ascending: false }),
      client.from("site_page_revisions").select("id, page_id"),
      client.from("site_page_sections").select("id, revision_id"),
      client.from("design_references").select("id, provider, source_url, title, purpose, tags, notes, status, rights_status, updated_at").order("updated_at", { ascending: false }).limit(24),
      client.from("admin_recommendations").select("id, scope, priority, title, rationale, suggested_action, source, status, created_at").in("status", ["open", "accepted"]).order("created_at", { ascending: false }).limit(12),
      client.from("admin_audit_events").select("id, action, target_type, target_id, occurred_at").order("occurred_at", { ascending: false }).limit(12),
    ]);

    if (membersResult.error || pagesResult.error || revisionsResult.error || sectionsResult.error || referencesResult.error || recommendationsResult.error || activityResult.error) {
      return {
        ready: false,
        persistenceConfigured: true,
        currentAdmin: null,
        members: [],
        pages: [],
        references: [],
        recommendations: [],
        activity: [],
      };
    }

    const members = await Promise.all(((membersResult.data ?? []) as AdminMemberRow[]).map((row) => publicMember(client, row)));
    const revisionCounts = new Map<string, number>();
    for (const revision of (revisionsResult.data ?? []) as RevisionRow[]) {
      revisionCounts.set(revision.page_id, (revisionCounts.get(revision.page_id) ?? 0) + 1);
    }
    const revisionToPage = new Map(((revisionsResult.data ?? []) as RevisionRow[]).map((revision) => [revision.id, revision.page_id]));
    const sectionCounts = new Map<string, number>();
    for (const section of (sectionsResult.data ?? []) as SectionRow[]) {
      const pageId = revisionToPage.get(section.revision_id);
      if (pageId) sectionCounts.set(pageId, (sectionCounts.get(pageId) ?? 0) + 1);
    }

    const pages: AdminPage[] = ((pagesResult.data ?? []) as PageRow[]).map((page) => ({
      id: page.id,
      slug: page.slug,
      title: page.title,
      navigationLabel: page.navigation_label,
      summary: page.summary,
      status: page.status,
      updatedAt: page.updated_at,
      revisionCount: revisionCounts.get(page.id) ?? 0,
      sectionCount: sectionCounts.get(page.id) ?? 0,
    }));

    const references: AdminDesignReference[] = (referencesResult.data ?? []).map((row) => ({
      id: row.id as string,
      provider: row.provider as DesignReferenceProvider,
      sourceUrl: row.source_url as string,
      title: row.title as string,
      purpose: row.purpose as string | null,
      tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string") : [],
      notes: row.notes as string | null,
      status: row.status as DesignReferenceStatus,
      rightsStatus: row.rights_status as AdminDesignReference["rightsStatus"],
      updatedAt: row.updated_at as string,
    }));

    const persistedRecommendations: AdminRecommendation[] = (recommendationsResult.data ?? []).map((row) => ({
      id: row.id as string,
      scope: row.scope as AdminRecommendation["scope"],
      priority: row.priority as AdminRecommendation["priority"],
      title: row.title as string,
      rationale: row.rationale as string,
      suggestedAction: row.suggested_action as string | null,
      source: row.source as AdminRecommendation["source"],
      status: row.status as AdminRecommendation["status"],
      createdAt: row.created_at as string,
    }));

    return {
      ready: true,
      persistenceConfigured: true,
      currentAdmin: members.find((member) => member.isBootstrapOwner) ?? null,
      members,
      pages,
      references,
      recommendations: [...persistedRecommendations, ...generatedRecommendations(pages, references)],
      activity: (activityResult.data ?? []).map((row) => ({
        id: row.id as string,
        action: row.action as string,
        targetType: row.target_type as string,
        targetId: row.target_id as string | null,
        occurredAt: row.occurred_at as string,
      })),
    };
  } catch {
    return {
      ready: false,
      persistenceConfigured: true,
      currentAdmin: null,
      members: [],
      pages: [],
      references: [],
      recommendations: [],
      activity: [],
    };
  }
}

async function writeAudit(client: SupabaseClient, actorId: string | null, action: string, targetType: string, targetId: string | null, metadata: Record<string, unknown> = {}) {
  await client.from("admin_audit_events").insert({
    actor_member_id: actorId,
    action,
    target_type: targetType,
    target_id: targetId,
    metadata,
  });
}

async function bootstrapOwner(client: SupabaseClient) {
  const { data, error } = await client
    .from("admin_members")
    .select("id, username, email, display_name, avatar_path, avatar_alt, role, status, is_bootstrap_owner, last_signed_in_at, updated_at")
    .eq("is_bootstrap_owner", true)
    .maybeSingle();
  return error ? undefined : data as AdminMemberRow | null;
}

export async function syncVerifiedBootstrapOwner(authUserId: string, email: string | null | undefined) {
  const client = adminClient();
  if (!client || !authUserId) return undefined;
  const owner = await bootstrapOwner(client);
  if (!owner) return undefined;

  const result = await client.from("admin_members").update({
    auth_user_id: authUserId,
    email: email?.trim().toLocaleLowerCase("en-US") || owner.email,
    status: "active",
    last_signed_in_at: new Date().toISOString(),
  }).eq("id", owner.id).select("id").maybeSingle();
  if (result.error || !result.data) return undefined;
  await writeAudit(client, owner.id, "admin.owner.verified", "admin_member", owner.id, { method: "verified_email" });
  return owner.id;
}

export async function updateBootstrapOwnerProfile(input: { username?: unknown; displayName?: unknown }) {
  const client = adminClient();
  if (!client) return { ok: false as const, reason: "not_configured" as const };
  const owner = await bootstrapOwner(client);
  if (!owner) return { ok: false as const, reason: "not_ready" as const };

  const username = input.username === undefined ? owner.username : normalizeUsername(input.username);
  const displayName = input.displayName === undefined ? owner.display_name : safeText(input.displayName, 120);
  if (!username || !displayName) return { ok: false as const, reason: "invalid" as const };

  const { data, error } = await client.from("admin_members").update({
    username,
    display_name: displayName,
  }).eq("id", owner.id).select("id").maybeSingle();
  if (error || !data) return { ok: false as const, reason: "write_failed" as const };
  await writeAudit(client, owner.id, "admin.profile.updated", "admin_member", owner.id, { username, displayName });
  return { ok: true as const };
}

export async function createWorkspaceMember(input: { username?: unknown; displayName?: unknown; email?: unknown; role?: unknown }) {
  const client = adminClient();
  if (!client) return { ok: false as const, reason: "not_configured" as const };
  const actor = await bootstrapOwner(client);
  if (!actor) return { ok: false as const, reason: "not_ready" as const };

  const username = normalizeUsername(input.username);
  const displayName = safeText(input.displayName, 120);
  const email = normalizeEmail(input.email);
  const role = asAssignableRole(input.role);
  if (!username || !displayName || !email || !role) return { ok: false as const, reason: "invalid" as const };

  const memberResult = await client.from("admin_members").insert({
    username,
    display_name: displayName,
    email,
    role,
    status: "invited",
  }).select("id").single();
  if (memberResult.error || !memberResult.data) return { ok: false as const, reason: "write_failed" as const };

  const memberId = memberResult.data.id as string;
  const invitationResult = await client.from("admin_invitations").insert({
    member_id: memberId,
    recipient_email: email,
    requested_role: role,
  });
  if (invitationResult.error) {
    await client.from("admin_members").delete().eq("id", memberId);
    return { ok: false as const, reason: "write_failed" as const };
  }

  // Sending an invitation is intentionally best-effort. The membership record
  // remains a reviewable invitation if the project email provider is not yet
  // configured; the dashboard never pretends that delivery succeeded.
  let invitationDelivery: "sent" | "queued" = "queued";
  const callbackOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://nick-interactive-learning.vercel.app";
  try {
    const response = await client.auth.admin.inviteUserByEmail(email, {
      data: { trussline_admin_member_id: memberId, trussline_admin_role: role },
      redirectTo: `${callbackOrigin.replace(/\/$/, "")}/admin/kinyae/auth/callback`,
    });
    if (!response.error && response.data.user?.id) {
      invitationDelivery = "sent";
      await client.from("admin_members").update({ auth_user_id: response.data.user.id }).eq("id", memberId);
    }
  } catch {
    // Supabase email delivery is a deployment concern. Do not turn a saved
    // administrator record into a false success claim when it is unavailable.
  }

  await writeAudit(client, actor.id, "admin.member.invited", "admin_member", memberId, { role, invitationDelivery });
  return { ok: true as const, invitationDelivery };
}

export async function updateWorkspaceMember(memberId: string, input: { displayName?: unknown; role?: unknown; status?: unknown }) {
  const client = adminClient();
  if (!client) return { ok: false as const, reason: "not_configured" as const };
  const actor = await bootstrapOwner(client);
  if (!actor) return { ok: false as const, reason: "not_ready" as const };

  const targetResult = await client.from("admin_members").select("id, is_bootstrap_owner, auth_user_id, display_name, role, status").eq("id", memberId).maybeSingle();
  const target = targetResult.data;
  if (targetResult.error || !target) return { ok: false as const, reason: "not_found" as const };
  if (target.is_bootstrap_owner && (input.role !== undefined || input.status !== undefined)) return { ok: false as const, reason: "protected_owner" as const };

  const patch: Record<string, unknown> = {};
  if (input.displayName !== undefined) {
    const displayName = safeText(input.displayName, 120);
    if (!displayName) return { ok: false as const, reason: "invalid" as const };
    patch.display_name = displayName;
  }
  if (input.role !== undefined) {
    const role = asAssignableRole(input.role);
    if (!role) return { ok: false as const, reason: "invalid" as const };
    patch.role = role;
  }
  if (input.status !== undefined) {
    const status = asMemberStatus(input.status);
    if (!status) return { ok: false as const, reason: "invalid" as const };
    patch.status = status;
  }
  if (!Object.keys(patch).length) return { ok: false as const, reason: "invalid" as const };

  const updateResult = await client.from("admin_members").update(patch).eq("id", memberId).select("id, auth_user_id").maybeSingle();
  if (updateResult.error || !updateResult.data) return { ok: false as const, reason: "write_failed" as const };
  if ((patch.status === "inactive" || patch.status === "suspended") && target.auth_user_id) {
    await client.auth.admin.signOut(target.auth_user_id, "global");
  }
  await writeAudit(client, actor.id, "admin.member.updated", "admin_member", memberId, { fields: Object.keys(patch) });
  return { ok: true as const };
}

export async function createSitePage(input: { slug?: unknown; title?: unknown; navigationLabel?: unknown; summary?: unknown }) {
  const client = adminClient();
  if (!client) return { ok: false as const, reason: "not_configured" as const };
  const actor = await bootstrapOwner(client);
  if (!actor) return { ok: false as const, reason: "not_ready" as const };
  const slug = normalizeSlug(input.slug);
  const title = safeText(input.title, 160);
  const navigationLabel = safeOptionalText(input.navigationLabel, 80);
  const summary = safeOptionalText(input.summary, 500);
  if (!slug || !title || navigationLabel === undefined || summary === undefined) return { ok: false as const, reason: "invalid" as const };

  const pageResult = await client.from("site_pages").insert({
    slug,
    title,
    navigation_label: navigationLabel,
    summary,
    status: "draft",
    created_by: actor.id,
    updated_by: actor.id,
  }).select("id").single();
  if (pageResult.error || !pageResult.data) return { ok: false as const, reason: "write_failed" as const };

  const pageId = pageResult.data.id as string;
  const revisionResult = await client.from("site_page_revisions").insert({
    page_id: pageId,
    revision_number: 1,
    status: "draft",
    change_summary: "Initial editable draft",
    created_by: actor.id,
  }).select("id").single();
  if (revisionResult.error || !revisionResult.data) return { ok: false as const, reason: "write_failed" as const };

  const revisionId = revisionResult.data.id as string;
  await client.from("site_page_sections").insert({
    revision_id: revisionId,
    section_type: "hero",
    section_key: "hero",
    position: 0,
    content: { heading: title, body: summary || "Write a clear introduction for this page." },
    settings: { tone: "light", alignment: "left" },
  });
  await writeAudit(client, actor.id, "admin.page.created", "site_page", pageId, { slug });
  return { ok: true as const, pageId };
}

export async function updateSitePage(pageId: string, input: { title?: unknown; navigationLabel?: unknown; summary?: unknown; status?: unknown }) {
  const client = adminClient();
  if (!client) return { ok: false as const, reason: "not_configured" as const };
  const actor = await bootstrapOwner(client);
  if (!actor) return { ok: false as const, reason: "not_ready" as const };

  const patch: Record<string, unknown> = { updated_by: actor.id };
  if (input.title !== undefined) {
    const title = safeText(input.title, 160);
    if (!title) return { ok: false as const, reason: "invalid" as const };
    patch.title = title;
  }
  if (input.navigationLabel !== undefined) {
    const label = safeOptionalText(input.navigationLabel, 80);
    if (label === undefined) return { ok: false as const, reason: "invalid" as const };
    patch.navigation_label = label;
  }
  if (input.summary !== undefined) {
    const summary = safeOptionalText(input.summary, 500);
    if (summary === undefined) return { ok: false as const, reason: "invalid" as const };
    patch.summary = summary;
  }
  let revisionToPublish: string | undefined;
  if (input.status !== undefined) {
    const status = asPageStatus(input.status);
    if (!status) return { ok: false as const, reason: "invalid" as const };
    patch.status = status;
    if (status === "published") {
      const revisionResult = await client.from("site_page_revisions").select("id").eq("page_id", pageId).order("revision_number", { ascending: false }).limit(1).maybeSingle();
      if (revisionResult.error || !revisionResult.data?.id) return { ok: false as const, reason: "not_found" as const };
      revisionToPublish = revisionResult.data.id as string;
      patch.current_published_revision_id = revisionToPublish;
    }
  }
  if (Object.keys(patch).length === 1) return { ok: false as const, reason: "invalid" as const };

  const result = await client.from("site_pages").update(patch).eq("id", pageId).select("id").maybeSingle();
  if (result.error || !result.data) return { ok: false as const, reason: "write_failed" as const };
  if (revisionToPublish) {
    const revisionResult = await client.from("site_page_revisions").update({
      status: "published",
      published_by: actor.id,
      published_at: new Date().toISOString(),
    }).eq("id", revisionToPublish);
    if (revisionResult.error) return { ok: false as const, reason: "write_failed" as const };
  }
  await writeAudit(client, actor.id, "admin.page.updated", "site_page", pageId, { fields: Object.keys(patch).filter((field) => field !== "updated_by") });
  return { ok: true as const };
}

export async function addPageSection(pageId: string, input: { sectionType?: unknown; sectionKey?: unknown }) {
  const client = adminClient();
  if (!client) return { ok: false as const, reason: "not_configured" as const };
  const actor = await bootstrapOwner(client);
  if (!actor) return { ok: false as const, reason: "not_ready" as const };
  const sectionType = asSectionType(input.sectionType);
  const sectionKey = safeText(input.sectionKey, 80)?.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  if (!sectionType || !sectionKey || !/^[a-z0-9][a-z0-9_-]*$/.test(sectionKey)) return { ok: false as const, reason: "invalid" as const };

  const revisionResult = await client.from("site_page_revisions").select("id").eq("page_id", pageId).order("revision_number", { ascending: false }).limit(1).maybeSingle();
  if (revisionResult.error || !revisionResult.data) return { ok: false as const, reason: "not_found" as const };
  const revisionId = revisionResult.data.id as string;
  const positionResult = await client.from("site_page_sections").select("position").eq("revision_id", revisionId).order("position", { ascending: false }).limit(1).maybeSingle();
  const position = typeof positionResult.data?.position === "number" ? positionResult.data.position + 1 : 0;
  const result = await client.from("site_page_sections").insert({
    revision_id: revisionId,
    section_type: sectionType,
    section_key: sectionKey,
    position,
    content: { heading: "New section", body: "Add purposeful content here." },
    settings: { tone: "light" },
  }).select("id").maybeSingle();
  if (result.error || !result.data) return { ok: false as const, reason: "write_failed" as const };
  await writeAudit(client, actor.id, "admin.section.created", "site_page_section", result.data.id as string, { pageId, sectionType });
  return { ok: true as const };
}

export async function createDesignReference(input: { provider?: unknown; sourceUrl?: unknown; title?: unknown; purpose?: unknown; notes?: unknown; tags?: unknown }) {
  const client = adminClient();
  if (!client) return { ok: false as const, reason: "not_configured" as const };
  const actor = await bootstrapOwner(client);
  if (!actor) return { ok: false as const, reason: "not_ready" as const };
  const provider = asReferenceProvider(input.provider);
  const sourceUrl = normalizeHttpsUrl(input.sourceUrl);
  const title = safeText(input.title, 180);
  const purpose = safeOptionalText(input.purpose, 240);
  const notes = safeOptionalText(input.notes, 2_000);
  const tags = Array.isArray(input.tags)
    ? input.tags.map((tag) => safeText(tag, 32)).filter((tag): tag is string => Boolean(tag)).slice(0, 12)
    : [];
  if (!provider || !sourceUrl || !title || purpose === undefined || notes === undefined) return { ok: false as const, reason: "invalid" as const };

  const result = await client.from("design_references").insert({
    provider,
    source_url: sourceUrl,
    title,
    purpose,
    notes,
    tags,
    rights_status: "link_only",
    status: "saved",
    created_by: actor.id,
  }).select("id").maybeSingle();
  if (result.error || !result.data) return { ok: false as const, reason: "write_failed" as const };
  await writeAudit(client, actor.id, "admin.design_reference.created", "design_reference", result.data.id as string, { provider });
  return { ok: true as const };
}

function imageKind(bytes: Uint8Array) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { mime: "image/jpeg", extension: "jpg" };
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return { mime: "image/png", extension: "png" };
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return { mime: "image/webp", extension: "webp" };
  return undefined;
}

export async function uploadBootstrapOwnerAvatar(file: File) {
  const client = adminClient();
  if (!client) return { ok: false as const, reason: "not_configured" as const };
  const actor = await bootstrapOwner(client);
  if (!actor) return { ok: false as const, reason: "not_ready" as const };
  if (file.size <= 0 || file.size > 5 * 1024 * 1024) return { ok: false as const, reason: "invalid_file" as const };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = imageKind(bytes);
  if (!kind || (file.type && file.type !== kind.mime)) return { ok: false as const, reason: "invalid_file" as const };

  const path = `avatars/${actor.id}/${randomUUID()}.${kind.extension}`;
  const upload = await client.storage.from(ADMIN_ASSET_BUCKET).upload(path, bytes, {
    contentType: kind.mime,
    cacheControl: "3600",
    upsert: false,
  });
  if (upload.error) return { ok: false as const, reason: "write_failed" as const };

  const assetResult = await client.from("admin_media_assets").insert({
    bucket_id: ADMIN_ASSET_BUCKET,
    storage_path: path,
    mime_type: kind.mime,
    byte_size: file.size,
    alt_text: `${actor.display_name} profile photo`,
    created_by: actor.id,
  });
  if (assetResult.error) return { ok: false as const, reason: "write_failed" as const };

  const profileResult = await client.from("admin_members").update({
    avatar_path: path,
    avatar_alt: `${actor.display_name} profile photo`,
  }).eq("id", actor.id);
  if (profileResult.error) return { ok: false as const, reason: "write_failed" as const };
  await writeAudit(client, actor.id, "admin.profile.avatar_updated", "admin_member", actor.id, { mimeType: kind.mime, bytes: file.size });
  return { ok: true as const };
}
