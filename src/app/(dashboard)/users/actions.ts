'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function inviteUser(data: { full_name: string, email: string, phone: string, role: string }) {
  const supabaseServer = await createServerClient()
  
  // Generate a random temporary password
  const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-2).toUpperCase() + "!";

  
  // Verify Admin authorization and get their company_id
  const { data: userData } = await supabaseServer.auth.getUser()
  if (!userData?.user) throw new Error("Non autorisé")
  
  const { data: profile } = await supabaseServer.from('profiles').select('company_id, role').eq('id', userData.user.id).single()
  
  if (!profile?.company_id || profile.role !== 'Administrateur') {
    throw new Error("Seul un administrateur peut inviter des utilisateurs.")
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error("La clé SUPABASE_SERVICE_ROLE_KEY n'est pas configurée dans .env.local.")
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  )

  // 1. Create the user directly
  const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { 
      full_name: data.full_name, 
      role: data.role, 
      company_id: profile.company_id 
    }
  })

  if (inviteError) throw inviteError

  if (inviteData.user) {
    // 2. Insert the profile
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: inviteData.user.id,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || null,
      role: data.role,
      company_id: profile.company_id,
      status: 'Actif'
    })

    if (profileError) {
      console.error("Erreur insertion profil:", profileError)
      // Even if it fails, the user is created. We can ignore or throw.
    }
  }

  revalidatePath('/users')
  return { success: true, tempPassword }
}

export async function updateUser(id: string, data: { full_name: string, email: string, phone: string | null, role: string }) {
  const supabaseServer = await createServerClient()
  
  // Verify Admin authorization
  const { data: userData } = await supabaseServer.auth.getUser()
  if (!userData?.user) throw new Error("Non autorisé")
  
  const { data: profile } = await supabaseServer.from('profiles').select('company_id, role').eq('id', userData.user.id).single()
  
  if (!profile?.company_id || profile.role !== 'Administrateur') {
    throw new Error("Seul un administrateur peut modifier des utilisateurs.")
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error("La clé SUPABASE_SERVICE_ROLE_KEY n'est pas configurée dans .env.local.")
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  )

  // 1. Update auth user metadata
  const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(id, {
    email: data.email,
    user_metadata: { 
      full_name: data.full_name, 
      role: data.role, 
    }
  })

  if (updateAuthError) throw updateAuthError

  // 2. Update the profile
  const { data: updatedProfile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || null,
      role: data.role,
    })
    .eq('id', id)
    .select()
    .single()

  if (profileError) {
    throw profileError
  }

  revalidatePath('/users')
  return { success: true, profile: updatedProfile }
}

