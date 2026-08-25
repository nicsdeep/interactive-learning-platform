import { isSameOrigin } from "@/lib/admin-auth";
import { adminJson, isAuthorisedWorkspaceRequest } from "@/lib/admin-api";
import { createWorkspaceMember, getAdminWorkspace } from "@/lib/admin-workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthorisedWorkspaceRequest("people"))) return adminJson({ error: "Administrator access is required." }, 403);
  const workspace = await getAdminWorkspace();
  return adminJson({ members: workspace.members, ready: workspace.ready });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return adminJson({ error: "This request could not be verified." }, 403);
  if (!(await isAuthorisedWorkspaceRequest("people"))) return adminJson({ error: "Administrator access is required." }, 403);
  try {
    const body = await request.json() as { username?: unknown; displayName?: unknown; email?: unknown; role?: unknown };
    const result = await createWorkspaceMember(body);
    if (!result.ok) return adminJson({ error: "The person could not be added. Check each field and try again." }, 400);
    return adminJson({ ok: true, invitationDelivery: result.invitationDelivery });
  } catch {
    return adminJson({ error: "The person could not be added. Please try again." }, 400);
  }
}
