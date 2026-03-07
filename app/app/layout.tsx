import { requireWorkspace } from "@/lib/workspace";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, workspace, subscription } = await requireWorkspace();

  const plan =
    subscription?.plan === "PREMIUM" &&
    (subscription.status === "ACTIVE" || subscription.status === "TRIALING")
      ? "PREMIUM"
      : "FREE";

  async function handleSignOut() {
    "use server";
    const { deleteSession } = await import("@/lib/session");
    const { cookies } = await import("next/headers");
    await deleteSession();
    const cookieStore = await cookies();
    cookieStore.set("session", "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <div className="h-full">
          <Sidebar
            workspaceName={workspace.name}
            plan={plan}
            userName={user.name}
            userImage={user.image}
            onSignOut={handleSignOut}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-auto">
        <div className="flex-1 p-4 pb-20 md:p-6 md:pb-6">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
}
