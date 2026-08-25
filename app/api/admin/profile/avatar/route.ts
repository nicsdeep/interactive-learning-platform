import { isSameOrigin } from "@/lib/admin-auth";
import { adminJson, isAuthorisedWorkspaceRequest } from "@/lib/admin-api";
import { uploadBootstrapOwnerAvatar } from "@/lib/admin-workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return adminJson({ error: "This request could not be verified." }, 403);
  if (!(await isAuthorisedWorkspaceRequest("profile"))) return adminJson({ error: "Sign in required." }, 401);
  try {
    const formData = await request.formData();
    const value = formData.get("avatar");
    if (!(value instanceof File)) return adminJson({ error: "Choose a JPEG, PNG, or WebP image under 5 MB." }, 400);
    const result = await uploadBootstrapOwnerAvatar(value);
    if (!result.ok) {
      const error = result.reason === "invalid_file"
        ? "Choose a JPEG, PNG, or WebP image under 5 MB."
        : "Your profile photo could not be saved. Please try again.";
      return adminJson({ error }, 400);
    }
    return adminJson({ ok: true });
  } catch {
    return adminJson({ error: "Your profile photo could not be saved. Please try again." }, 400);
  }
}
