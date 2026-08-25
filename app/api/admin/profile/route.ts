import { isSameOrigin } from "@/lib/admin-auth";
import { adminJson, isAuthorisedWorkspaceRequest } from "@/lib/admin-api";
import { updateBootstrapOwnerProfile } from "@/lib/admin-workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) return adminJson({ error: "This request could not be verified." }, 403);
  if (!(await isAuthorisedWorkspaceRequest("profile"))) return adminJson({ error: "Sign in required." }, 401);
  try {
    const body = await request.json() as { username?: unknown; displayName?: unknown };
    const result = await updateBootstrapOwnerProfile(body);
    if (!result.ok) return adminJson({ error: "Those profile details could not be saved. Check the name and username, then try again." }, 400);
    return adminJson({ ok: true });
  } catch {
    return adminJson({ error: "Those profile details could not be saved. Please try again." }, 400);
  }
}
