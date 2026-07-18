"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createStockEntry(formData: FormData) {
  const product_id = formData.get('product_id') as string;
  const quantity = parseInt(formData.get('quantity') as string, 10);
  const date = formData.get('date') as string;
  const fournisseur = formData.get('fournisseur') as string;
  const observation = formData.get('remarque') as string;

  if (!product_id || isNaN(quantity) || quantity <= 0 || !date) {
    return { error: 'Veuillez remplir les champs obligatoires correctement.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Vous devez être connecté.' };
  }

  const { error } = await supabase
    .from('stock_movements')
    .insert([{
      product_id,
      user_id: user.id,
      type: 'in',
      quantity,
      date,
      fournisseur: fournisseur || null,
      observation: observation || null,
      status: 'completed'
    }]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/stock/entries');
  revalidatePath('/stock/movements');
  revalidatePath('/products');
  return { success: true };
}

export async function createStockExit(formData: FormData) {
  const product_id = formData.get('product_id') as string;
  const quantity = parseInt(formData.get('quantity') as string, 10);
  const date = formData.get('date') as string;
  const motif = formData.get('motif') as string;
  const observation = formData.get('remarque') as string;

  if (!product_id || isNaN(quantity) || quantity <= 0 || !date) {
    return { error: 'Veuillez remplir les champs obligatoires correctement.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Vous devez être connecté.' };
  }

  // Vérifier le stock actuel pour ne pas faire de sortie en dessous de 0
  const { data: product } = await supabase
    .from('products')
    .select('stock_actuel')
    .eq('id', product_id)
    .single();

  if (!product || product.stock_actuel < quantity) {
    return { error: 'Stock insuffisant pour cette sortie.' };
  }

  const { error } = await supabase
    .from('stock_movements')
    .insert([{
      product_id,
      user_id: user.id,
      type: 'out',
      quantity,
      date,
      motif: motif || null,
      observation: observation || null,
      status: 'completed'
    }]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/stock/exits');
  revalidatePath('/stock/movements');
  revalidatePath('/products');
  return { success: true };
}
