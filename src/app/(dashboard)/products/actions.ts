'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import { ProductSchema, ProductUpdateSchema } from '@/lib/validations'

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string
  const price = parseFloat(formData.get('price') as string)
  const purchase_price = parseFloat(formData.get('cost_price') as string)
  const stock_actuel = parseInt(formData.get('stock_actuel') as string, 10)
  const stock_min = parseInt(formData.get('stock_min') as string, 10)
  const sku = formData.get('sku') as string
  const image = formData.get('image') as File | null

  const validationResult = ProductSchema.safeParse({
    name,
    category_id,
    price: isNaN(price) ? 0 : price,
    purchase_price: isNaN(purchase_price) ? 0 : purchase_price,
    stock_actuel: isNaN(stock_actuel) ? 0 : stock_actuel,
    stock_min: isNaN(stock_min) ? 0 : stock_min,
    sku
  });

  if (!validationResult.success) {
    return { error: validationResult.error.issues[0].message }
  }

  const supabase = await createClient()

  // Get current user and their company_id
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

  if (plan === 'Gratuit' || plan === 'Pro') {
    const limit = plan === 'Gratuit' ? 50 : 2000;
    
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', profile.company_id);
      
    if (count !== null && count >= limit) {
      return { error: `Limite atteinte. Le plan ${plan} vous permet de gérer jusqu'à ${limit} produits. Veuillez mettre à niveau votre abonnement.` }
    }
  }

  let image_url = null

  // Handle image upload if a file was provided
  if (image && image.size > 0) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(image.type)) {
      return { error: "Type de fichier invalide. Seuls JPEG, PNG et WEBP sont autorisés." };
    }

    const fileExt = image.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, image)

    if (uploadError) {
      console.error("Erreur d'upload:", uploadError)
      return { error: "Erreur lors du téléchargement de l'image." }
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)
      
    image_url = data.publicUrl
  }

  const { error } = await supabase
    .from('products')
    .insert([{ 
      name, 
      category_id, 
      company_id: profile.company_id,
      price: isNaN(price) ? 0 : price, 
      purchase_price: isNaN(purchase_price) ? 0 : purchase_price,
      stock_actuel: isNaN(stock_actuel) ? 0 : stock_actuel, 
      stock_min: isNaN(stock_min) ? 0 : stock_min, 
      sku,
      image_url
    }])

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/products')
  return { success: true }
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const category_id = formData.get('category_id') as string
  const price = parseFloat(formData.get('price') as string)
  const purchase_price = parseFloat(formData.get('cost_price') as string)
  const sku = formData.get('sku') as string

  const validationResult = ProductUpdateSchema.safeParse({
    name,
    category_id,
    price: isNaN(price) ? undefined : price,
    purchase_price: isNaN(purchase_price) ? undefined : purchase_price,
    sku
  });

  if (!validationResult.success) {
    return { error: validationResult.error.issues[0].message }
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

  const updateData: any = { 
    name, 
    sku 
  }
  
  if (category_id) updateData.category_id = category_id
  if (!isNaN(price)) updateData.price = price
  if (!isNaN(purchase_price)) updateData.purchase_price = purchase_price

  const { error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .eq('company_id', profile.company_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/products')
  return { success: true }
}

export async function deleteProduct(id: string) {
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
    .from('products')
    .delete()
    .eq('id', id)
    .eq('company_id', profile.company_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/products')
  return { success: true }
}
