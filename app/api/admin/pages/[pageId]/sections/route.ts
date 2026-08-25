import { isSameOrigin } from "@/lib/admin-auth";
import { adminJson, isAuthorisedWorkspaceRequest } from "@/lib/admin-api";
import { addPageSection } from "@/lib/admin-workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ pageId: string }> }) {
  if (!isSameOrigin(request)) return adminJson({ error: "This request could not be verified." }, 403);
  if (!(await isAuthorisedWorkspaceRequest("content"))) return adminJson({ error: "Editor access is required." }, 403);
  const { pageId } = await context.params;
  try {
    const body = await request.json() as { sectionType?: unknown; sectionKey?: unknown };
    const result = await addPageSection(pageId, body);
    if (!result.ok) return adminJson({ error: "That section could not be added. Use a short unique name and try again." }, 400);
    return adminJson({ ok: true });
  } catch {
    return adminJson({ error: "That section could not be added. Please try again." }, 400);
  }
}
