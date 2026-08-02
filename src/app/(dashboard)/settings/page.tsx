import { SettingsClient } from "./SettingsClient";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) redirect('/login');

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('company_id, is_super_admin, companies(subscription_plan, subscription_status, subscription_end_date, billing_cycle, industry)')
    .eq('id', userData.user.id)
    .single();

  if (profile?.is_super_admin) {
    redirect('/admin/dashboard');
  }

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
            error: error
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

  const { count: categoriesCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: movementsCount } = await supabase
    .from('stock_movements')
    .select('*, products!inner(company_id)', { count: 'exact', head: true })
    .eq('products.company_id', companyId)
    .gte('created_at', startOfMonth.toISOString());

  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
  const isSuperAdmin = profile?.is_super_admin || (userData.user.email && adminEmails.includes(userData.user.email.toLowerCase()));

  const { data: companiesData } = await supabase.from('companies').select('industry').not('industry', 'is', null)
  
  const PREDEFINED_INDUSTRIES = [
    'Électronique & Informatique',
    'Prêt-à-porter & Mode',
    'Alimentaire & Supermarché',
    'Santé & Beauté',
    'Maison & Décoration',
    'Bricolage & Matériaux',
    'Quincaillerie',
    'Automobile & Moto',
    'Électroménager',
    'Restauration / HORECA',
    'Agriculture & Élevage',
    'Fournitures de Bureau & Papeterie',
    'Bébés & Enfants',
    'Sport & Loisirs'
  ];
  const customIndustries = (companiesData || []).map(c => c.industry)
  const allIndustries = Array.from(new Set([...PREDEFINED_INDUSTRIES, ...customIndustries]))

  const enrichedSettings = {
    ...(settings || {}),
    subscription_plan: companyInfo?.subscription_plan || 'Gratuit',
    subscription_status: companyInfo?.subscription_status || 'Actif',
    subscription_end_date: companyInfo?.subscription_end_date || null,
    billing_cycle: companyInfo?.billing_cycle || null,
    is_super_admin: isSuperAdmin,
    industry: companyInfo?.industry || '',
    usage: {
      users: usersCount || 0,
      products: productsCount || 0,
      categories: categoriesCount || 0,
      movements: movementsCount || 0
    }
  };

  return <SettingsClient initialSettings={enrichedSettings} allIndustries={allIndustries} />;
}
