import { createClient } from "@/lib/supabase/server";
import StockMovementsClient from "./StockMovementsClient";
import { redirect } from "next/navigation";

export default async function StockMovementsPage() {
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

  // Fetch all movements
  const { data: movementsData } = await supabase
    .from('stock_movements')
    .select(`
      *,
      products (name),
      profiles (full_name)
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  const formattedMovements = movementsData?.map((m: any) => ({
    id: m.id,
    date: m.date || m.created_at,
    type: m.type,
    product_name: m.products?.name || 'Produit inconnu',
    quantity: m.quantity,
    unit: 'Pièce',
    user_name: m.profiles?.full_name,
    fournisseur: m.fournisseur,
    motif: m.motif,
    observation: m.observation,
    status: m.status
  })) || [];

  return (
    <StockMovementsClient initialMovements={formattedMovements} />
  );
}
