import { getAdminSession, isSameOrigin } from "@/lib/admin-auth";
import { adminJson, isAuthorisedWorkspaceRequest } from "@/lib/admin-api";
import { createDesignReference, getAdminWorkspace } from "@/lib/admin-workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthorisedWorkspaceRequest("design"))) return adminJson({ error: "Editor access is required." }, 403);
  const workspace = await getAdminWorkspace();
  return adminJson({ references: workspace.references, ready: workspace.ready });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return adminJson({ error: "This request could not be verified." }, 403);
  if (!(await isAuthorisedWorkspaceRequest("design"))) return adminJson({ error: "Editor access is required." }, 403);
  try {
    const body = await request.json() as {
      provider?: unknown;
      sourceUrl?: unknown;
      title?: unknown;
      purpose?: unknown;
      notes?: unknown;
      tags?: unknown;
      searchQuery?: unknown;
      designBrief?: unknown;
      targetSurface?: unknown;
      selectionMethod?: unknown;
      assistantMetadata?: unknown;
    };
    const session = await getAdminSession();
    const result = await createDesignReference(body, session?.actorId);
    if (!result.ok) return adminJson({ error: "That reference could not be saved. Use the original HTTPS link for the source you selected and a clear title." }, 400);
    return adminJson({ ok: true });
  } catch {
    return adminJson({ error: "That reference could not be saved. Please try again." }, 400);
  }
}
