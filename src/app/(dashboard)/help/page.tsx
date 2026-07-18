import { HelpClient } from "./HelpClient";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HelpPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("company_id", profile?.company_id)
    .order("created_at", { ascending: false });

  return <HelpClient 
    userEmail={user.email || ""} 
    userRole={profile?.role || ""} 
    companyId={profile?.company_id || ""}
    initialTickets={tickets || []}
  />;
}
