"use server";

import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";

export async function getMaterialById(id: string) {
  const { workspace } = await requireWorkspace();

  const material = await prisma.material.findFirst({
    where: { id, workspaceId: workspace.id },
  });

  return material;
}
