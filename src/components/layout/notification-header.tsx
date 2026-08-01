"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function NotificationBell() {
  const [openTicketsCount, setOpenTicketsCount] = useState(0);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndTickets = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_admin, company_id')
        .eq('id', user.id)
        .single();
        
      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
      const is_admin = profile?.is_super_admin || !!(user.email && adminEmails.includes(user.email.toLowerCase()));
      setIsSuperAdmin(is_admin);

      if (is_admin) {
        const { count } = await supabase
          .from('support_tickets')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'Ouvert');
        
        setOpenTicketsCount(count || 0);
      } else if (profile?.company_id) {
        const { count } = await supabase
          .from('support_tickets')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', profile.company_id)
          .eq('status', 'Résolu');
        
        setOpenTicketsCount(count || 0);
      }
    };

    fetchUserAndTickets();

    const channel = supabase
      .channel(`schema-db-changes-notifications-${Math.random()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets' },
        () => {
          fetchUserAndTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <Link href={isSuperAdmin ? "/admin/tickets" : "/help"} className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
      <Bell className="w-5 h-5" />
      {openTicketsCount > 0 && (
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-gray-900"></span>
      )}
    </Link>
  );
}

export function NotificationHeader() {
  return (
    <header className="hidden lg:flex h-16 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md items-center justify-end px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <NotificationBell />
      </div>
    </header>
  );
}
