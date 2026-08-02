import { createClient } from '@/lib/supabase/server'
import NewProductClient from './NewProductClient'

export default async function NewProductPage() {
  const supabase = await createClient()

  // Fetch categories for the select dropdown
  const { data: userData } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, companies(industry)')
    .eq('id', userData.user?.id)
    .single()

  const companyInfo = Array.isArray(profile?.companies) ? profile?.companies[0] : profile?.companies
  const companyIndustry = companyInfo?.industry || null

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name')
    .eq('company_id', profile?.company_id)
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
  }

  const formattedCategories = categories || []

  return (
    <NewProductClient categories={formattedCategories} companyIndustry={companyIndustry} />
  )
}
