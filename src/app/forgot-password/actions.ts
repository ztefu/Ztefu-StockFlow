'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

import { cookies } from 'next/headers'

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    redirect('/forgot-password?error=true&message=' + encodeURIComponent('Veuillez entrer votre adresse email.'))
  }

  // Rate limiting simple via cookies (blocage après 3 échecs pour décourager les abus)
  const cookieStore = await cookies();
  const attemptsStr = cookieStore.get('forgot_pwd_attempts')?.value;
  let attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;

  if (attempts >= 3) {
    redirect('/forgot-password?error=true&message=' + encodeURIComponent("Trop de tentatives infructueuses. Veuillez réessayer dans 15 minutes."));
  }

  const supabase = await createClient()

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    redirect('/forgot-password?error=true&message=' + encodeURIComponent("Configuration serveur manquante."));
  }

  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  );

  // Vérifier si l'utilisateur existe dans la base de données
  const { data: userExists } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (!userExists) {
    // Incrémenter le compteur d'échecs et définir un blocage de 15 minutes (900 secondes)
    attempts += 1;
    cookieStore.set('forgot_pwd_attempts', attempts.toString(), { maxAge: 900 });
    
    // On bloque l'envoi d'email pour éviter les abus de quota
    redirect('/forgot-password?error=true&message=' + encodeURIComponent("Aucun compte n'est associé à cette adresse email."));
  }

  // L'utilisateur existe, on réinitialise les tentatives
  if (attempts > 0) {
    cookieStore.delete('forgot_pwd_attempts');
  }

  // Envoyer l'email de réinitialisation avec un code OTP (6 chiffres)
  const { error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) {
    console.error("Erreur de réinitialisation de mot de passe:", error)
    redirect('/forgot-password?error=true&message=' + encodeURIComponent(error.message))
  }

  // Rediriger vers la page de vérification OTP avec le type 'recovery'
  redirect(`/auth/verify?email=${encodeURIComponent(email)}&type=recovery`)
}
