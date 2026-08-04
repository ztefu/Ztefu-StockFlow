import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NotificationsClient } from './NotificationsClient'

export const metadata = {
  title: 'Notifications | StockFlow AF',
}

export default async function NotificationsPage() {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', userData.user.id)
    .single()

  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
  const isSuperAdmin = profile?.is_super_admin || !!(userData.user.email && adminEmails.includes(userData.user.email.toLowerCase()));

  if (!isSuperAdmin) {
    redirect('/dashboard')
  }

  return <NotificationsClient />
}
