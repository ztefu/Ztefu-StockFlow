'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name) {
    return { error: 'Le nom de la catégorie est requis' }
  }

  const supabase = await createClient()

  // Verify auth and get company_id
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return { error: "Non authentifié" }

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', userData.user.id)
    .single()

  if (!profile?.company_id) {
    return { error: "Aucune entreprise associée à ce profil" }
  }

  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, description, company_id: profile.company_id }])
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/categories')
  return { success: true, data }
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name) {
    return { error: 'Le nom de la catégorie est requis' }
  }

  const supabase = await createClient()

  // Verify auth and get company_id
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return { error: "Non authentifié" }

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', userData.user.id)
    .single()

  if (!profile?.company_id) {
    return { error: "Aucune entreprise associée à ce profil" }
  }

  const { error } = await supabase
    .from('categories')
    .update({ name, description })
    .eq('id', id)
    .eq('company_id', profile.company_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/categories')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()

  // Verify auth and get company_id
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return { error: "Non authentifié" }

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', userData.user.id)
    .single()

  if (!profile?.company_id) {
    return { error: "Aucune entreprise associée à ce profil" }
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('company_id', profile.company_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/categories')
  return { success: true }
}
