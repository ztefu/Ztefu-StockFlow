import { createClient } from "@/lib/supabase/server";
import StockExitsClient from "./StockExitsClient";
import { redirect } from "next/navigation";

export default async function StockExitsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  const companyId = profile?.company_id;

  // Fetch products and movements in parallel
  const [
    { data: productsData },
    { data: movementsData }
  ] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, stock_actuel, stock_min')
      .eq('company_id', companyId),
    supabase
      .from('stock_movements')
      .select(`
        *,
        products (name),
        profiles (full_name)
      `)
      .eq('type', 'out')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
  ]);

  const formattedProducts = productsData?.map(p => ({
    id: p.id,
    name: p.name,
    stock: p.stock_actuel,
    minStock: p.stock_min,
    unit: 'Pièce' // Default unit for now
  })) || [];

  const formattedExits = movementsData?.map((m: any) => ({
    id: m.id,
    date: m.date || m.created_at,
    type: m.type,
    product_name: m.products?.name || 'Produit inconnu',
    quantity: m.quantity,
    unit: 'Pièce',
    user_name: m.profiles?.full_name,
    motif: m.motif,
    observation: m.observation,
    status: m.status
  })) || [];

  return (
    <StockExitsClient 
      products={formattedProducts} 
      initialExits={formattedExits} 
    />
  );
}
