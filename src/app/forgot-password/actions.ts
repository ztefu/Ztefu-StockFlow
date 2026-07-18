'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    redirect('/forgot-password?error=true&message=' + encodeURIComponent('Veuillez entrer votre adresse email.'))
  }

  const supabase = await createClient()

  // Envoyer l'email de réinitialisation
  // Rediriger vers /auth/callback qui gérera l'échange de token et redirigera vers /update-password
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/update-password`
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })

  if (error) {
    console.error("Erreur de réinitialisation de mot de passe:", error)
    redirect('/forgot-password?error=true&message=' + encodeURIComponent(error.message))
  }

  // Rediriger avec un message de succès
  redirect('/forgot-password?message=' + encodeURIComponent('Un lien de réinitialisation a été envoyé à votre adresse email.'))
}
