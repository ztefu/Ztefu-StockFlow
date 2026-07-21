import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { AutoLogout } from "@/components/layout/AutoLogout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <AutoLogout />
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <MobileSidebar />
      <main className="lg:pl-64 flex flex-col min-h-screen pt-16 lg:pt-0">
        <div className="flex-1 p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
