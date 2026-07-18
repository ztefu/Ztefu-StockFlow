'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

  if (!name || !sku || !category_id) {
    return { error: 'Nom, SKU et catégorie sont requis' }
  }

  const supabase = await createClient()
  let image_url = null

  // Handle image upload if a file was provided
  if (image && image.size > 0) {
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

  if (!name || !sku) {
    return { error: 'Le nom et le SKU sont requis' }
  }

  const supabase = await createClient()

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

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/products')
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/products')
  return { success: true }
}
