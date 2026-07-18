import { createClient } from '@/lib/supabase/server'
import ProductsClient from './ProductsClient'

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const userRole = user?.user_metadata?.role || 'Utilisateur'

  // Fetch categories for the filter dropdown
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  // Fetch products with their category names
  const { data: productsData, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
  }

  // Format products to match the expected interface in ProductsClient
  const formattedProducts = productsData?.map((p: any) => ({
    id: p.id,
    name: p.name,
    category: p.categories?.name || 'Non classé',
    price: p.purchase_price || 0,
    sellPrice: p.price,
    unit: 'Pièce', // default unit
    stock: p.stock_actuel,
    minStock: p.stock_min,
    status: p.stock_actuel <= 0 ? "Rupture" : p.stock_actuel <= p.stock_min ? "Faible" : "En stock",
    sku: p.sku,
    image_url: p.image_url
  })) || []

  const formattedCategories = categoriesData?.map((c: any) => ({
    id: c.id,
    name: c.name
  })) || []

  return (
    <ProductsClient 
      initialProducts={formattedProducts} 
      categoriesList={formattedCategories}
      userRole={userRole}
    />
  )
}
