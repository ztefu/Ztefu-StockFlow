'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createGlobalCategory(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const color = formData.get('color') as string || '#3B82F6';

  const { error } = await supabase.from('categories').insert([{
    name,
    description,
    color,
    company_id: null // Spécifique au catalogue global
  }]);

  if (error) return { error: error.message };
  revalidatePath('/admin/catalog');
  return { success: true };
}

export async function createGlobalProduct(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name') as string;
  const category_id = formData.get('category_id') as string;
  const image = formData.get('image') as File | null;
  const sku = formData.get('sku') as string;

  let image_url = null;
  if (image && image.size > 0) {
    const fileExt = image.name.split('.').pop();
    const fileName = `global_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, image);

    if (!uploadError) {
      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      image_url = data.publicUrl;
    }
  }

  const { error } = await supabase.from('products').insert([{
    name,
    category_id,
    sku,
    image_url,
    price: 0,
    purchase_price: 0,
    stock_actuel: 0,
    stock_min: 0,
    company_id: null
  }]);

  if (error) return { error: error.message };
  revalidatePath('/admin/catalog');
  return { success: true };
}

export async function deleteGlobalElement(id: string, type: 'product' | 'category') {
  const supabase = await createClient();
  const table = type === 'product' ? 'products' : 'categories';

  const { error } = await supabase.from(table).delete().eq('id', id).is('company_id', null);

  if (error) return { error: error.message };
  revalidatePath('/admin/catalog');
  return { success: true };
}
