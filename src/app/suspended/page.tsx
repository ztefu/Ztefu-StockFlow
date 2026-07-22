import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import Link from "next/link";

export default async function SuspendedPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (profile?.company_id) {
    const { data: company } = await supabase
      .from('companies')
      .select('subscription_status')
      .eq('id', profile.company_id)
      .single();

    // S'ils ne sont pas suspendus ou expirés, on les renvoie vers le dashboard
    if (company?.subscription_status !== 'Suspendu' && company?.subscription_status !== 'Expiré') {
      redirect('/dashboard');
    }
  }

  const isExpired = searchParams?.reason === 'expired';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-md w-full bg-white dark:bg-dark-surface p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v-2m0 2h.01M12 9a2 2 0 100 4 2 2 0 000-4zm-8.2 8.2a10 10 0 1114.14 0 10 10 0 01-14.14 0z"></path>
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {isExpired ? 'Abonnement Expiré' : 'Compte Suspendu'}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {isExpired 
            ? "L'abonnement de votre entreprise est arrivé à expiration. Veuillez patienter pendant que votre administrateur procède au renouvellement."
            : "L'accès à votre espace a été temporairement suspendu. Veuillez contacter l'administrateur de la plateforme pour régulariser votre situation ou réactiver votre compte."}
        </p>

        <form action={async () => {
          'use server'
          const s = await createClient()
          await s.auth.signOut()
          redirect('/login')
        }}>
          <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium">
            <LogOut size={18} />
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  );
}
