import { isSameOrigin } from "@/lib/admin-auth";
import { adminJson, isAuthorisedWorkspaceRequest } from "@/lib/admin-api";
import { updateWorkspaceMember } from "@/lib/admin-workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ memberId: string }> }) {
  if (!isSameOrigin(request)) return adminJson({ error: "This request could not be verified." }, 403);
  if (!(await isAuthorisedWorkspaceRequest("people"))) return adminJson({ error: "Administrator access is required." }, 403);
  const { memberId } = await context.params;
  try {
    const body = await request.json() as { displayName?: unknown; role?: unknown; status?: unknown };
    const result = await updateWorkspaceMember(memberId, body);
    if (!result.ok) {
      const error = result.reason === "protected_owner"
        ? "The founding owner stays protected here. Use the Profile area to update their identity."
        : "That person could not be updated. Check the changes and try again.";
      return adminJson({ error }, 400);
    }
    return adminJson({ ok: true });
  } catch {
    return adminJson({ error: "That person could not be updated. Please try again." }, 400);
  }
}
