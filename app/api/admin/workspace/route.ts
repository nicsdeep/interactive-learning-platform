import { adminJson, isAuthorisedWorkspaceRequest } from "@/lib/admin-api";
import { getAdminWorkspace } from "@/lib/admin-workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthorisedWorkspaceRequest("profile"))) return adminJson({ error: "Sign in required." }, 401);
  return adminJson({ workspace: await getAdminWorkspace() });
}
