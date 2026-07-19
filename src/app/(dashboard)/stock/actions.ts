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

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) {
    return { error: 'Aucune entreprise associée à ce profil.' };
  }

  // Vérifier que le produit appartient bien à la même entreprise
  const { data: productCheck } = await supabase
    .from('products')
    .select('id')
    .eq('id', product_id)
    .eq('company_id', profile.company_id)
    .single();

  if (!productCheck) {
    return { error: 'Produit non trouvé ou accès refusé.' };
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
      status: 'completed',
      company_id: profile.company_id
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) {
    return { error: 'Aucune entreprise associée à ce profil.' };
  }

  // Vérifier le stock actuel pour ne pas faire de sortie en dessous de 0, et vérifier l'entreprise
  const { data: product } = await supabase
    .from('products')
    .select('stock_actuel')
    .eq('id', product_id)
    .eq('company_id', profile.company_id)
    .single();

  if (!product) {
    return { error: 'Produit non trouvé ou accès refusé.' };
  }

  if (product.stock_actuel < quantity) {
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
      status: 'completed',
      company_id: profile.company_id
    }]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/stock/exits');
  revalidatePath('/stock/movements');
  revalidatePath('/products');
  return { success: true };
}
