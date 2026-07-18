'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function translateError(errorMsg: string) {
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
    redirect('/login?error=true&message=' + encodeURIComponent(translateError(error.message)))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
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
  
  // 1. Créer la compagnie en mode Admin pour récupérer l'ID (contourne RLS)
  const { data: company, error: companyError } = await supabaseAdmin
    .from('companies')
    .insert([{ name: companyName }])
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

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: fullName,
        company_id: company.id,
        role: 'Administrateur'
      }
    }
  }

  const { data: signUpData, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/register?error=true&message=' + encodeURIComponent(translateError(error.message)))
  }

  // 3. Insérer le profil (si pas de trigger en place)
  if (signUpData?.user) {
    await supabaseAdmin.from('profiles').upsert({
      id: signUpData.user.id,
      email: data.email,
      full_name: fullName,
      role: 'Administrateur',
      company_id: company.id,
      status: 'Actif'
    });
  }

  revalidatePath('/', 'layout')
  
  // Si Supabase demande une confirmation par email, la session n'est pas créée tout de suite
  if (!signUpData.session) {
    redirect('/login?error=false&message=' + encodeURIComponent("Compte créé avec succès ! Veuillez vérifier votre boîte mail pour valider votre compte avant de vous connecter."));
  } else {
    redirect('/dashboard')
  }
}
