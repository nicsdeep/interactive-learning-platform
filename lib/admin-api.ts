import "server-only";

import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { hasAdminWorkspacePermission, type AdminWorkspacePermission } from "@/lib/admin-workspace";

const privateHeaders = {
  "Cache-Control": "no-store, private",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
};

export function adminJson(payload: Record<string, unknown>, status = 200) {
  return NextResponse.json(payload, { status, headers: privateHeaders });
}

export async function isAuthorisedWorkspaceRequest(permission: AdminWorkspacePermission) {
  const session = await getAdminSession();
  if (!session) return false;
  return hasAdminWorkspacePermission(session.actorId, permission);
}

