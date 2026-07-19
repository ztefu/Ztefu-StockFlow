import { createClient } from "@/lib/supabase/server";
import StockEntriesClient from "./StockEntriesClient";
import { redirect } from "next/navigation";

export default async function StockEntriesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch products and movements in parallel
  const [
    { data: productsData },
    { data: movementsData }
  ] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, stock_actuel'),
    supabase
      .from('stock_movements')
      .select(`
        *,
        products (name),
        profiles (full_name)
      `)
      .eq('type', 'in')
      .order('created_at', { ascending: false })
  ]);

  const formattedProducts = productsData?.map(p => ({
    id: p.id,
    name: p.name,
    stock: p.stock_actuel,
    unit: 'Pièce' // Default unit for now
  })) || [];

  const formattedEntries = movementsData?.map((m: any) => ({
    id: m.id,
    date: m.date || m.created_at,
    type: m.type,
    product_name: m.products?.name || 'Produit inconnu',
    quantity: m.quantity,
    unit: 'Pièce',
    user_name: m.profiles?.full_name,
    fournisseur: m.fournisseur,
    observation: m.observation,
    status: m.status
  })) || [];

  return (
    <StockEntriesClient 
      products={formattedProducts} 
      initialEntries={formattedEntries} 
    />
  );
}
