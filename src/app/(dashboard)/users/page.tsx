import { UsersClient } from "./UsersClient";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const supabase = await createClient();

  // Vérifier l'authentification
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Récupérer la liste des profils
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching profiles:", error);
  }

  return <UsersClient initialUsers={profiles || []} />;
}
