'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper pour obtenir le client admin Supabase (bypasse RLS)
async function getSupabaseAdmin() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData?.user) throw new Error("Non autorisé")

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', userData.user.id)
    .single()

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
  const isSuperAdminEmail = userData.user.email ? adminEmails.includes(userData.user.email.toLowerCase()) : false;

  if (!profile?.is_super_admin && !isSuperAdminEmail) {
    throw new Error("Accès refusé. Réservé aux super administrateurs.")
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("Configuration serveur manquante (SUPABASE_SERVICE_ROLE_KEY).");
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  );
}

export async function getDashboardMetrics() {
  try {
    const admin = await getSupabaseAdmin()

    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
    let saQuery = admin.from('profiles').select('company_id')
    if (adminEmails.length > 0) {
      saQuery = saQuery.or(`is_super_admin.eq.true,email.in.(${adminEmails.join(',')})`)
    } else {
      saQuery = saQuery.eq('is_super_admin', true)
    }
    const { data: superAdminProfiles } = await saQuery;
    const superAdminCompanyIds = Array.from(new Set(superAdminProfiles?.map(p => p.company_id).filter(Boolean)));

    // 1. Récupérer toutes les entreprises clientes
    let companiesQuery = admin.from('companies').select('id, subscription_plan, subscription_status, created_at')
    if (superAdminCompanyIds.length > 0) {
      companiesQuery = companiesQuery.not('id', 'in', `(${superAdminCompanyIds.join(',')})`)
    }
    const { data: companies, error: companiesError } = await companiesQuery
    if (companiesError) throw companiesError

    // 2. Récupérer tous les profils (utilisateurs clients)
    let usersQuery = admin.from('profiles').select('id, created_at')
    if (superAdminCompanyIds.length > 0) {
      usersQuery = usersQuery.not('company_id', 'in', `(${superAdminCompanyIds.join(',')})`)
    }
    const { data: users, error: usersError } = await usersQuery
    if (usersError) throw usersError

    // 3. Calcul du MRR
    let mrr = 0
    let activeCompanies = 0

    companies?.forEach(company => {
      if (company.subscription_status === 'Actif' || company.subscription_status === 'active') {
        activeCompanies++
        if (company.subscription_plan === 'Pro') mrr += 5000
        if (company.subscription_plan === 'Business') mrr += 15000
      }
    })

    return {
      totalCompanies: companies?.length || 0,
      activeCompanies,
      totalUsers: users?.length || 0,
      mrr,
      companiesData: companies || [],
      usersData: users || []
    }
  } catch (error: any) {
    console.error("Erreur lors de la récupération des métriques admin:", error)
    throw new Error(error.message)
  }
}

export async function getCompanies() {
  try {
    const admin = await getSupabaseAdmin()

    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
    let saQuery = admin.from('profiles').select('company_id')
    if (adminEmails.length > 0) {
      saQuery = saQuery.or(`is_super_admin.eq.true,email.in.(${adminEmails.join(',')})`)
    } else {
      saQuery = saQuery.eq('is_super_admin', true)
    }
    const { data: superAdminProfiles } = await saQuery;
    const superAdminCompanyIds = Array.from(new Set(superAdminProfiles?.map(p => p.company_id).filter(Boolean)));

    let companiesQuery = admin.from('companies').select('*').order('created_at', { ascending: false })
    if (superAdminCompanyIds.length > 0) {
      companiesQuery = companiesQuery.not('id', 'in', `(${superAdminCompanyIds.join(',')})`)
    }

    const { data: companies, error } = await companiesQuery
    if (error) throw error
    
    // Récupérer le nombre d'utilisateurs par entreprise (clients uniquement)
    let profilesQuery = admin.from('profiles').select('company_id')
    if (superAdminCompanyIds.length > 0) {
      profilesQuery = profilesQuery.not('company_id', 'in', `(${superAdminCompanyIds.join(',')})`)
    }
    const { data: profiles, error: profilesError } = await profilesQuery
      
    if (profilesError) throw profilesError

    const companiesWithStats = companies.map(company => {
      const usersCount = profiles.filter(p => p.company_id === company.id).length
      return {
        ...company,
        users_count: usersCount
      }
    })

    return companiesWithStats
  } catch (error: any) {
    console.error("Erreur lors de la récupération des entreprises:", error)
    throw new Error(error.message)
  }
}

export async function toggleCompanyStatus(companyId: string, currentStatus: string) {
  try {
    const admin = await getSupabaseAdmin()
    
    const newStatus = (currentStatus === 'Actif' || currentStatus === 'active') ? 'Suspendu' : 'Actif'

    const { error } = await admin
      .from('companies')
      .update({ subscription_status: newStatus })
      .eq('id', companyId)

    if (error) throw error

    revalidatePath('/admin/companies')
    revalidatePath('/admin/dashboard')
    
    return { success: true, newStatus }
  } catch (error: any) {
    console.error("Erreur lors du changement de statut:", error)
    return { success: false, error: error.message }
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    const admin = await getSupabaseAdmin()
    
    const { error } = await admin
      .from('super_admin_notifications')
      .update({ is_read: true })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/', 'layout')
    
    return { success: true }
  } catch (error: any) {
    console.error("Erreur lors du marquage de la notification:", error)
    return { success: false, error: error.message }
  }
}
