import { createClient } from '@/lib/supabase/server'
import NewProductClient from './NewProductClient'

export default async function NewProductPage() {
  const supabase = await createClient()

  // Fetch categories for the select dropdown
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
  }

  const formattedCategories = categories || []

  return (
    <NewProductClient categories={formattedCategories} />
  )
}
