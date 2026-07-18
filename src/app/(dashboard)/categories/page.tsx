import { createClient } from '@/lib/supabase/server'
import CategoriesClient from './CategoriesClient'

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const userRole = user?.user_metadata?.role || 'Utilisateur'

  // Fetch categories with product count
  // Since we don't have a direct count column, we can either fetch all and count, 
  // or just fetch categories for now and default count to 0 if not easily joined.
  // We can do a join: select('*, products(count)')
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*, products(count)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching categories:', error)
  }

  // Format categories to match expected props
  const formattedCategories = categories?.map((c: any) => ({
    id: c.id,
    name: c.name,
    description: c.description || '',
    productCount: c.products?.[0]?.count || 0
  })) || []

  return (
    <CategoriesClient initialCategories={formattedCategories} userRole={userRole} />
  )
}
