"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createStockEntry(formData: FormData) {
  const product_id = formData.get('product_id') as string;
  const quantity = parseInt(formData.get('quantity') as string, 10);
  const date = formData.get('date') as string;
  const fournisseur = formData.get('fournisseur') as string;
  const observation = formData.get('remarque') as string;
  const unit_price_str = formData.get('unit_price') as string;
  const unit_price = unit_price_str ? parseFloat(unit_price_str) : null;

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

  // Vérifier le quota de mouvements pour le plan Gratuit
  const { data: planInfo } = await supabase
    .from('profiles')
    .select('companies(subscription_plan)')
    .eq('id', user.id)
    .single();

  const companyData = Array.isArray(planInfo?.companies) ? planInfo.companies[0] : planInfo?.companies;
  const plan = companyData?.subscription_plan || 'Gratuit';

  if (plan === 'Gratuit') {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    
    const { count } = await supabase
      .from('stock_movements')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', profile.company_id)
      .gte('created_at', startOfMonth.toISOString());
      
    if (count !== null && count >= 200) {
      return { error: 'Limite atteinte. Le plan Gratuit permet 200 mouvements maximum par mois. Passez au plan Pro.' };
    }
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
      company_id: profile.company_id,
      unit_price
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
  const unit_price_str = formData.get('unit_price') as string;
  const unit_price = unit_price_str ? parseFloat(unit_price_str) : null;

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

  // Vérifier le quota de mouvements pour le plan Gratuit
  const { data: planInfo } = await supabase
    .from('profiles')
    .select('companies(subscription_plan)')
    .eq('id', user.id)
    .single();

  const companyData = Array.isArray(planInfo?.companies) ? planInfo.companies[0] : planInfo?.companies;
  const plan = companyData?.subscription_plan || 'Gratuit';

  if (plan === 'Gratuit') {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    
    const { count } = await supabase
      .from('stock_movements')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', profile.company_id)
      .gte('created_at', startOfMonth.toISOString());
      
    if (count !== null && count >= 200) {
      return { error: 'Limite atteinte. Le plan Gratuit permet 200 mouvements maximum par mois. Passez au plan Pro.' };
    }
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
      company_id: profile.company_id,
      unit_price
    }]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/stock/exits');
  revalidatePath('/stock/movements');
  revalidatePath('/products');
  return { success: true };
}
