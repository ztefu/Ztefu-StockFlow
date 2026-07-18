'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    redirect('/update-password?error=true&message=' + encodeURIComponent('Veuillez remplir tous les champs.'))
  }

  if (password !== confirmPassword) {
    redirect('/update-password?error=true&message=' + encodeURIComponent('Les mots de passe ne correspondent pas.'))
  }

  if (password.length < 6) {
    redirect('/update-password?error=true&message=' + encodeURIComponent('Le mot de passe doit contenir au moins 6 caractères.'))
  }

  const supabase = await createClient()

  // Update the user's password
  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    console.error("Update password error:", error)
    redirect('/update-password?error=true&message=' + encodeURIComponent(error.message))
  }

  // Redirect to dashboard after successful password update
  redirect('/dashboard')
}
