import { DashboardClient } from "./DashboardClient";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null; // Or redirect

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  const companyId = profile?.company_id;

  // 1. Fetch all products
  const { data: productsData } = await supabase
    .from('products')
    .select('*')
    .eq('company_id', companyId);

  const products = productsData || [];
  
  const totalProducts = products.length;
  const totalStockValue = products.reduce((acc: number, p: any) => acc + (p.stock_actuel * (p.purchase_price || 0)), 0);
  
  const outOfStockItems = products.filter((p: any) => p.stock_actuel === 0).length;
  const lowStockItems = products.filter((p: any) => p.stock_actuel > 0 && p.stock_actuel <= p.stock_min).length;

  const lowStockProductsRaw = products
    .filter((p: any) => p.stock_actuel <= p.stock_min)
    .sort((a: any, b: any) => a.stock_actuel - b.stock_actuel)
    .slice(0, 5); // Take top 5

  const lowStockProducts = lowStockProductsRaw.map((p: any) => ({
    id: p.id,
    name: p.name,
    stock: p.stock_actuel,
    minStock: p.stock_min,
    unit: 'Pièce', // Todo: add unit to DB
    status: p.stock_actuel === 0 ? "out_of_stock" : "low_stock"
  }));

  // 2. Fetch movements for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayMovementsData } = await supabase
    .from('stock_movements')
    .select('*')
    .eq('company_id', companyId)
    .gte('date', today.toISOString());

  const todayMovements = todayMovementsData || [];
  
  const entriesToday = todayMovements
    .filter((m: any) => m.type === 'in')
    .reduce((acc: number, m: any) => acc + m.quantity, 0);
    
  const exitsToday = todayMovements
    .filter((m: any) => m.type === 'out')
    .reduce((acc: number, m: any) => acc + m.quantity, 0);

  // 3. Fetch recent movements
  const { data: recentMovementsData } = await supabase
    .from('stock_movements')
    .select(`
      *,
      products (name),
      profiles (full_name)
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(5);

  const recentMovements = (recentMovementsData || []).map((m: any) => ({
    id: m.id,
    product: m.products?.name || "Produit inconnu",
    type: m.type,
    quantity: m.quantity,
    unit: 'Pièce',
    date: m.date,
    user: m.profiles?.full_name || "Système"
  }));

  // 4. Generate Chart Data (Last 6 months)
  const { data: allMovements } = await supabase
    .from('stock_movements')
    .select('type, quantity, date')
    .eq('company_id', companyId);

  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
  const chartData = [];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthIndex = d.getMonth();
    const year = d.getFullYear();
    
    // Filter movements for this month
    const monthMovements = (allMovements || []).filter((m: any) => {
      const mDate = new Date(m.date);
      return mDate.getMonth() === monthIndex && mDate.getFullYear() === year;
    });

    const entries = monthMovements.filter((m: any) => m.type === 'in').reduce((acc: number, m: any) => acc + m.quantity, 0);
    const exits = monthMovements.filter((m: any) => m.type === 'out').reduce((acc: number, m: any) => acc + m.quantity, 0);

    chartData.push({
      name: monthNames[monthIndex],
      entries,
      exits
    });
  }

  const stats = {
    totalStockValue,
    totalProducts,
    lowStockItems,
    outOfStockItems,
    entriesToday,
    exitsToday
  };

  return (
    <DashboardClient 
      stats={stats}
      chartData={chartData}
      recentMovements={recentMovements}
      lowStockProducts={lowStockProducts}
    />
  );
}
