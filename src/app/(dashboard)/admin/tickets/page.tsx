import { TicketsClient } from "./client";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminTicketsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is Super Admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
  const isSuperAdminEmail = adminEmails.includes(user.email?.toLowerCase() || '');

  if (!profile?.is_super_admin && !isSuperAdminEmail) {
    redirect("/dashboard");
  }

  // Fetch tickets
  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*, companies(name)')
    .order('created_at', { ascending: false });

  return <TicketsClient tickets={tickets || []} />;
}
