import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { LogoutButton } from "@/components/LogoutButton";
import { getSiteSettings } from "@/lib/site-settings";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const settings = await getSiteSettings();

  return (
    <div className="flex flex-col bg-slate-50 md:min-h-screen md:flex-row">
      <AdminSidebar
        adminName={session.user.name ?? "Admin"}
        siteName={settings.siteName}
        logoutButton={
          <LogoutButton className="text-xs font-medium text-slate-500 hover:text-slate-800" />
        }
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
