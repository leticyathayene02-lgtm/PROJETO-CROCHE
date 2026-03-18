import { requireWorkspace } from "@/lib/workspace";
import { checkAccess } from "@/lib/access";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { TrialBanner } from "@/components/trial-banner";
import { PaywallScreen } from "@/components/paywall-screen";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, workspace, subscription } = await requireWorkspace();

  const access = await checkAccess(workspace.id);

  // If access is blocked, render paywall instead of the dashboard
  if (!access.allowed) {
    return (
      <PaywallScreen
        status={access.status}
        userEmail={user.email}
      />
    );
  }

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
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Trial banner — shown only during trial period */}
      {access.status === "TRIAL" && (
        <TrialBanner daysLeft={access.daysLeft} hoursLeft={access.hoursLeft} />
      )}

      <div className="flex flex-1 overflow-hidden">
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
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
}
