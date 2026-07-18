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

  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, description }])
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

  const { error } = await supabase
    .from('categories')
    .update({ name, description })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/categories')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/categories')
  return { success: true }
}
