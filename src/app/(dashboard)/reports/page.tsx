import { ReportsClient } from "./ReportsClient";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all products for inventory report
  const { data: products } = await supabase.from('products').select('*');
  
  // Fetch all movements for charts and reports
  const { data: movements } = await supabase.from('stock_movements').select('*');

  return (
    <ReportsClient 
      products={products || []} 
      movements={movements || []} 
    />
  );
}
