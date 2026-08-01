import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CatalogClient } from "./CatalogClient";

export default async function AdminCatalogPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Vérifier si l'utilisateur est super admin
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
  const { data: profile } = await supabase.from('profiles').select('is_super_admin').eq('id', user.id).single();
  const isSuperAdmin = profile?.is_super_admin || (user.email && adminEmails.includes(user.email.toLowerCase()));

  if (!isSuperAdmin) {
    redirect("/dashboard");
  }

  // Récupérer les catégories et produits globaux (company_id IS NULL)
  const { data: globalCategories } = await supabase
    .from("categories")
    .select("*")
    .is("company_id", null)
    .order("name");

  const { data: globalProducts } = await supabase
    .from("products")
    .select("*, category:categories(name)")
    .is("company_id", null)
    .order("name");

  return <CatalogClient initialCategories={globalCategories || []} initialProducts={globalProducts || []} />;
}
