import { SettingsClient } from "./SettingsClient";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, companies(subscription_plan, subscription_status)')
    .eq('id', userData.user.id)
    .single();

  const companyId = profile?.company_id;
  if (!companyId) {
    return (
      <div className="p-8">
        <h1 className="text-red-500 font-bold text-2xl">Erreur de Profil</h1>
        <p>Impossible de charger votre profil ou l'entreprise associée.</p>
        <pre className="bg-gray-100 p-4 mt-4 rounded overflow-auto">
          {JSON.stringify({
            userId: userData?.user?.id,
            profileData: profile,
            // (Note: we can't easily capture the error from the above await without a try/catch, 
            // but if profile is null, it means no row was returned)
          }, null, 2)}
        </pre>
      </div>
    );
  }

  const companyInfo = Array.isArray(profile.companies) ? profile.companies[0] : profile.companies;

  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .eq('company_id', companyId)
    .maybeSingle();

  // Fetch current usage stats
  const { count: usersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'Actif');

  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  const enrichedSettings = {
    ...(settings || {}),
    subscription_plan: companyInfo?.subscription_plan || 'Gratuit',
    subscription_status: companyInfo?.subscription_status || 'Actif',
    usage: {
      users: usersCount || 0,
      products: productsCount || 0
    }
  };

  return <SettingsClient initialSettings={enrichedSettings} />;
}
