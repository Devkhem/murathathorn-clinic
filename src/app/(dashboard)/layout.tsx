import { redirect } from "next/navigation";

import { MainNav } from "@/components/main-nav";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { UnauthorizedError, requireActiveStaff } from "@/lib/permissions";

export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  let staffName = "";

  try {
    const profile = await requireActiveStaff();
    staffName = profile.full_name;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/login");
    }
    throw error;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <MainNav />

      <div className="flex flex-1 flex-col pb-20 md:pb-0 md:pl-24">
        <header className="flex items-center justify-between border-b bg-card px-6 py-4">
          <h1 className="text-2xl font-bold">คลินิกแม่</h1>
          <div className="flex items-center gap-3">
            {staffName && <span className="hidden text-muted-foreground sm:inline">{staffName}</span>}
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
