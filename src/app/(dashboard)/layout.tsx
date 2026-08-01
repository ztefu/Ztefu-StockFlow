import { Sidebar } from "@/components/layout/sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { AutoLogout } from "@/components/layout/AutoLogout";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionProvider } from "@/providers/SubscriptionProvider";
import { NotificationHeader } from "@/components/layout/notification-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, is_super_admin')
    .eq('id', user.id)
    .single();

  let companyPlan = 'Gratuit';

  if (profile?.company_id && !profile.is_super_admin) {
    const { data: company } = await supabase
      .from('companies')
      .select('subscription_status, subscription_plan')
      .eq('id', profile.company_id)
      .single();

    if (company?.subscription_status === 'Suspendu') {
      redirect('/suspended');
    }
    
    if (company?.subscription_plan) {
      companyPlan = company.subscription_plan;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <RoleGuard />
      <AutoLogout />
      <SubscriptionProvider plan={companyPlan as any}>
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <MobileSidebar />
        <main className="lg:pl-64 flex flex-col min-h-screen pt-16 lg:pt-0">
          <NotificationHeader />
          <div className="flex-1 p-4 lg:p-8">
            {children}
          </div>
        </main>
      </SubscriptionProvider>
    </div>
  );
}
