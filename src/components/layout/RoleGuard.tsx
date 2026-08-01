'use client'

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function RoleGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('is_super_admin, role, company_id').eq('id', user.id).single();
        const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
        const isSuperAdmin = profile?.is_super_admin || (user.email && adminEmails.includes(user.email.toLowerCase()));
        
        if (isSuperAdmin) {
          // Si le super admin essaie d'accéder aux pages clients (hors settings, profile, users, etc.)
          if (!pathname.startsWith('/admin') && !pathname.startsWith('/settings') && !pathname.startsWith('/profile') && !pathname.startsWith('/users') && pathname !== '/suspended' && pathname !== '/') {
             router.replace('/admin/dashboard');
          }
        } else {
          // Si un client essaie d'accéder aux pages d'administration
          if (pathname.startsWith('/admin')) {
             router.replace('/dashboard');
          }

          // Vérification du statut d'expiration pour les clients
          if (profile?.company_id) {
            const { data: company } = await supabase.from('companies').select('subscription_status').eq('id', profile.company_id).single();
            if (company?.subscription_status === 'Expiré') {
              if (profile.role === 'Administrateur') {
                if (!pathname.startsWith('/settings')) {
                  router.replace('/settings');
                }
              } else {
                if (pathname !== '/suspended') {
                  router.replace('/suspended?reason=expired');
                }
              }
            }
          }
        }
      }
    };
    
    checkRole();
  }, [pathname, router]);

  return null;
}
