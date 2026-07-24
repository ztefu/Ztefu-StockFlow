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
    .select(`
      company_id,
      companies (
        subscription_plan
      )
    `)
    .eq('id', userData.user.id)
    .single()

  if (!profile?.company_id) {
    return { error: "Aucune entreprise associée à ce profil" }
  }

  // Vérification des quotas
  const companyInfo = Array.isArray(profile.companies) ? profile.companies[0] : profile.companies;
  const plan = companyInfo?.subscription_plan || 'Gratuit';

  if (plan === 'Gratuit') {
    const limit = 5;
    const { count } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', profile.company_id);
      
    if (count !== null && count >= limit) {
      return { error: `Limite atteinte. Le plan ${plan} vous permet de créer jusqu'à ${limit} catégories. Veuillez mettre à niveau votre abonnement.` }
    }
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
