import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardSidebar, DASHBOARD_NAV_ITEMS } from "@/components/DashboardSidebar";
import { LogoutButton } from "@/components/LogoutButton";

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  DEALER: "Dealer",
  ADMIN: "Admin",
};

const LISTER_ONLY_HREFS = new Set([
  "/dashboard/properties/new",
  "/dashboard/enquiries",
  "/dashboard/billing",
]);

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const isLister = session.user.role === "OWNER" || session.user.role === "DEALER";
  const navItems = isLister
    ? DASHBOARD_NAV_ITEMS
    : DASHBOARD_NAV_ITEMS.filter((item) => !LISTER_ONLY_HREFS.has(item.href));

  return (
    <div className="flex flex-col bg-slate-50 md:min-h-screen md:flex-row">
      <DashboardSidebar
        userName={session.user.name ?? "Account"}
        roleLabel={ROLE_LABELS[session.user.role] ?? session.user.role}
        logoutButton={<LogoutButton className="text-xs font-medium text-slate-500 hover:text-slate-800" />}
        navItems={navItems}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
