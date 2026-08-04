"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Ticket, Building2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { markNotificationAsRead } from "@/app/(dashboard)/admin/actions";

export function NotificationBell() {
  const [openTicketsCount, setOpenTicketsCount] = useState(0);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        // Fetch super admin notifications
        const { data: notifs } = await supabase
          .from('super_admin_notifications')
          .select('*')
          .eq('is_read', false)
          .order('created_at', { ascending: false });
        
        setNotifications(notifs || []);
        setOpenTicketsCount(notifs?.length || 0);
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

    const channel1 = supabase
      .channel(`schema-db-changes-notifications-${Math.random()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets' },
        () => fetchUserAndTickets()
      )
      .subscribe();
      
    const channel2 = supabase
      .channel(`schema-db-changes-admin-notifs-${Math.random()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'super_admin_notifications' },
        () => fetchUserAndTickets()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
    };
  }, [supabase]);

  const handleNotificationClick = async (notif: any) => {
    await markNotificationAsRead(notif.id);
    setShowDropdown(false);
    // Optimistic UI update
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
    setOpenTicketsCount(prev => Math.max(0, prev - 1));
    router.push(notif.link);
  };

  if (!isSuperAdmin) {
    return (
      <Link href="/help" className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
        <Bell className="w-5 h-5" />
        {openTicketsCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center border-2 border-white dark:border-gray-900">
            {openTicketsCount}
          </span>
        )}
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Bell className="w-5 h-5" />
        {openTicketsCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center border-2 border-white dark:border-gray-900">
            {openTicketsCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
              {openTicketsCount} non lu{openTicketsCount > 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0 text-left w-full"
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${notif.type === 'NEW_REGISTRATION' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'}`}>
                      {notif.type === 'NEW_REGISTRATION' ? <Building2 className="w-5 h-5" /> : <Ticket className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {notif.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.created_at).toLocaleString('fr-FR', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Tout est à jour</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Vous n'avez aucune notification non lue.</p>
              </div>
            )}
          </div>
          
          <Link 
            href="/admin/notifications"
            onClick={() => setShowDropdown(false)}
            className="block w-full p-3 text-center text-sm font-medium text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-t border-gray-100 dark:border-gray-800"
          >
            Voir toutes les notifications
          </Link>
        </div>
      )}
    </div>
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
