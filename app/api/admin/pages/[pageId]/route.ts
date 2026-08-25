import { isSameOrigin } from "@/lib/admin-auth";
import { adminJson, isAuthorisedWorkspaceRequest } from "@/lib/admin-api";
import { updateSitePage } from "@/lib/admin-workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ pageId: string }> }) {
  if (!isSameOrigin(request)) return adminJson({ error: "This request could not be verified." }, 403);
  const { pageId } = await context.params;
  try {
    const body = await request.json() as { title?: unknown; navigationLabel?: unknown; summary?: unknown; status?: unknown };
    const requiresPublishPermission = body.status === "published";
    if (!(await isAuthorisedWorkspaceRequest(requiresPublishPermission ? "publish" : "content"))) {
      return adminJson({ error: requiresPublishPermission ? "Only an owner or administrator can publish a page." : "Editor access is required." }, 403);
    }
    const result = await updateSitePage(pageId, body);
    if (!result.ok) return adminJson({ error: "That page could not be updated. Check the change and try again." }, 400);
    return adminJson({ ok: true });
  } catch {
    return adminJson({ error: "That page could not be updated. Please try again." }, 400);
  }
}
