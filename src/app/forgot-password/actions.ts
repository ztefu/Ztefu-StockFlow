'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    redirect('/forgot-password?error=true&message=' + encodeURIComponent('Veuillez entrer votre adresse email.'))
  }

  const supabase = await createClient()

  // Envoyer l'email de réinitialisation avec un code OTP (6 chiffres)
  const { error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) {
    console.error("Erreur de réinitialisation de mot de passe:", error)
    redirect('/forgot-password?error=true&message=' + encodeURIComponent(error.message))
  }

  // Rediriger vers la page de vérification OTP avec le type 'recovery'
  redirect(`/auth/verify?email=${encodeURIComponent(email)}&type=recovery`)
}
