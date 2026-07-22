'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

function translateError(errorMsg: string) {
  if (typeof errorMsg !== 'string') return 'Erreur inconnue de la part du serveur.';
  if (errorMsg.includes('Invalid login credentials')) return 'Identifiants invalides ou incorrects.';
  if (errorMsg.includes('User already registered')) return 'Un compte existe déjà avec cette adresse email.';
  if (errorMsg.includes('Password should be at least')) return 'Le mot de passe doit contenir au moins 6 caractères.';
  if (errorMsg.includes('Email not confirmed')) return 'Veuillez confirmer votre adresse email.';
  return errorMsg;
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    if (error.message.includes('Email not confirmed')) {
      redirect(`/auth/verify?email=${encodeURIComponent(data.email)}`)
    }
    redirect('/login?error=true&message=' + encodeURIComponent(translateError(error.message)))
  }

  const { data: profile } = await supabase.from('profiles').select('is_super_admin').eq('id', (await supabase.auth.getUser()).data.user?.id).single();

  revalidatePath('/', 'layout')
  if (profile?.is_super_admin) {
    redirect('/admin/dashboard')
  } else {
    redirect('/dashboard')
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    redirect('/login?error=true&message=' + encodeURIComponent("Configuration serveur manquante."));
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  );

  const companyName = formData.get('company_name') as string;
  const fullName = formData.get('full_name') as string;
  const email = formData.get('email') as string;
  
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
  const isSuperAdmin = adminEmails.includes(email.toLowerCase());
  
  // 1. Créer la compagnie en mode Admin pour récupérer l'ID (contourne RLS)
  const { data: company, error: companyError } = await supabaseAdmin
    .from('companies')
    .insert([{ 
      name: companyName,
      subscription_plan: isSuperAdmin ? 'Business' : 'Gratuit',
      subscription_status: 'Actif'
    }])
    .select('id')
    .single();

  if (companyError) {
    console.error("Erreur création entreprise:", companyError);
    redirect('/login?error=true&message=' + encodeURIComponent("Erreur lors de la création de l'entreprise."));
  }

  // Créer les paramètres par défaut pour cette entreprise
  await supabaseAdmin.from('settings').insert([{
    company_id: company.id,
    company_name: companyName,
    currency: 'XAF',
    language: 'fr',
    timezone: 'Africa/Douala',
    address: 'Douala, Cameroun'
  }]);

  const headersList = await headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const origin = `${protocol}://${host}`;

  const data = {
    email,
    password: formData.get('password') as string,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
        company_id: company.id,
        role: 'Administrateur'
      }
    }
  }

  const { data: signUpData, error } = await supabase.auth.signUp(data)

  if (error) {
    const errorDump = {
      name: (error as any).name,
      message: (error as any).message,
      status: (error as any).status,
      stringified: String(error)
    };
    console.error("Erreur détaillée lors du signUp:", errorDump);
    const msg = error.message || String(error);
    redirect('/register?error=true&message=' + encodeURIComponent(typeof msg === 'string' ? translateError(msg) : msg))
  }

  // 3. Insérer le profil (si pas de trigger en place)
  if (signUpData?.user) {
    await supabaseAdmin.from('profiles').upsert({
      id: signUpData.user.id,
      email: data.email,
      full_name: fullName,
      role: 'Administrateur',
      company_id: company.id,
      status: 'Actif',
      is_super_admin: isSuperAdmin
    });
  }

  revalidatePath('/', 'layout')
  
  // Si Supabase demande une confirmation par email, on redirige vers la page de vérification OTP
  const plan = formData.get('plan') as string || 'Gratuit';
  const cycle = formData.get('cycle') as string || 'monthly';
  if (!signUpData.session) {
    redirect(`/auth/verify?email=${encodeURIComponent(data.email)}&plan=${encodeURIComponent(plan)}&cycle=${encodeURIComponent(cycle)}`)
  } else {
    if (plan === 'Pro' || plan === 'Business') {
      redirect(`/settings?plan=${plan}&cycle=${cycle}#billing`)
    } else {
      redirect('/dashboard')
    }
  }
}

import { EmailOtpType } from '@supabase/supabase-js'

export async function verifyOTP(email: string, token: string, type: EmailOtpType = 'signup') {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type })
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true }
}
