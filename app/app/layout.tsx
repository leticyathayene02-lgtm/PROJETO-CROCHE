import { requireWorkspace } from "@/lib/workspace";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { signOut } from "@/lib/auth";

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

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <div className="h-full">
          <Sidebar
            workspaceName={workspace.name}
            plan={plan}
            userName={user.name}
            userImage={user.image}
            onSignOut={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
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
