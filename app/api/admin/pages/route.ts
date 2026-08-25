import { isSameOrigin } from "@/lib/admin-auth";
import { adminJson, isAuthorisedWorkspaceRequest } from "@/lib/admin-api";
import { createSitePage, getAdminWorkspace } from "@/lib/admin-workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthorisedWorkspaceRequest("content"))) return adminJson({ error: "Editor access is required." }, 403);
  const workspace = await getAdminWorkspace();
  return adminJson({ pages: workspace.pages, ready: workspace.ready });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return adminJson({ error: "This request could not be verified." }, 403);
  if (!(await isAuthorisedWorkspaceRequest("content"))) return adminJson({ error: "Editor access is required." }, 403);
  try {
    const body = await request.json() as { slug?: unknown; title?: unknown; navigationLabel?: unknown; summary?: unknown };
    const result = await createSitePage(body);
    if (!result.ok) return adminJson({ error: "That page could not be created. Use a slash-led URL such as /about, then try again." }, 400);
    return adminJson({ ok: true, pageId: result.pageId });
  } catch {
    return adminJson({ error: "That page could not be created. Please try again." }, 400);
  }
}
