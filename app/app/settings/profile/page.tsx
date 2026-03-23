import { requireWorkspace } from "@/lib/workspace";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const session = await getSession();
  const { workspace } = await requireWorkspace();

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { name: true, email: true, phone: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meu Perfil</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Gerencie seus dados pessoais e preferências
        </p>
      </div>

      <ProfileForm
        user={{
          name: user?.name ?? "",
          email: user?.email ?? "",
          phone: user?.phone ?? "",
        }}
        defaultHourlyRate={workspace.defaultHourlyRate}
      />
    </div>
  );
}
