/**
 * Root layout for /admin — intentionally minimal (no auth check).
 * Auth is enforced in app/admin/(protected)/layout.tsx.
 * The /admin/login page lives outside the (protected) group and must be accessible without session.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
