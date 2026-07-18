import { AlertsClient } from "./AlertsClient";
import { createClient } from "@/lib/supabase/server";

export default async function AlertsPage() {
  const supabase = await createClient();

  const { data: productsData } = await supabase
    .from('products')
    .select('*')
    .order('stock_actuel', { ascending: true });

  const products = productsData || [];

  const allAlerts = products
    .filter((p: any) => p.stock_actuel <= p.stock_min)
    .map((p: any) => ({
      id: p.id,
      name: p.name,
      sku: p.reference || "",
      stock: p.stock_actuel,
      minStock: p.stock_min,
      unit: "Pièce", // Placeholder
      status: p.stock_actuel === 0 ? "out_of_stock" : "low_stock",
      order_pending: p.order_pending
    }));

  const outOfStockCount = allAlerts.filter((p: any) => p.status === "out_of_stock").length;
  const lowStockCount = allAlerts.filter((p: any) => p.status === "low_stock").length;

  return (
    <AlertsClient 
      allAlerts={allAlerts}
      outOfStockCount={outOfStockCount}
      lowStockCount={lowStockCount}
    />
  );
}
