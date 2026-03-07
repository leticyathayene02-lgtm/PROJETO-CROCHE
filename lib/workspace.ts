import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

/**
 * Get the current user's active workspace.
 * Redirects to /login if not authenticated.
 */
export async function requireWorkspace() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: {
      workspace: {
        include: {
          subscription: true,
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  if (!member) {
    // No workspace found — route /app/setup does not exist, so fall back to login
    redirect("/login");
  }

  return {
    user: session.user,
    workspace: member.workspace,
    subscription: member.workspace.subscription,
    role: member.role,
  };
}

/**
 * Verify user is a member of the given workspace.
 * Throws if not authorized.
 */
export async function verifyWorkspaceMembership(
  userId: string,
  workspaceId: string
) {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId },
    },
  });

  if (!member) {
    throw new Error("Unauthorized: not a member of this workspace");
  }

  return member;
}

/**
 * Get workspaces for the current user (for workspace switcher).
 */
export async function getUserWorkspaces(userId: string) {
  return prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        include: { subscription: true },
      },
    },
    orderBy: { joinedAt: "asc" },
  });
}
