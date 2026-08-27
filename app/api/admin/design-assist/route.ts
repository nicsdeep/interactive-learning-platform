import { isSameOrigin } from "@/lib/admin-auth";
import { adminJson, isAuthorisedWorkspaceRequest } from "@/lib/admin-api";
import { consumeAdminRateLimit } from "@/lib/admin-rate-limit";
import { createDesignStudioProposal } from "@/lib/design-studio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return adminJson({ error: "This request could not be verified." }, 403);
  if (!(await isAuthorisedWorkspaceRequest("design"))) return adminJson({ error: "Editor access is required." }, 403);

  const rateLimit = consumeAdminRateLimit(request, "design-assist");
  if (!rateLimit.allowed) {
    return adminJson({ error: "Please wait a moment before preparing another design brief." }, 429);
  }

  try {
    const body = await request.json() as { provider?: unknown; brief?: unknown; targetSurface?: unknown };
    const result = createDesignStudioProposal(body);
    if (!result.ok) {
      return adminJson({ error: result.error || "Describe the direction you want to explore." }, 400);
    }
    return adminJson({ proposal: result.proposal });
  } catch {
    return adminJson({ error: "The studio assistant could not prepare that brief. Please try again." }, 400);
  }
}
