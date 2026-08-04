"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Bell, CheckCircle2, Ticket, Building2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { markNotificationAsRead } from "@/app/(dashboard)/admin/actions"
import toast from "react-hot-toast"

export function NotificationsClient() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('super_admin_notifications')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setNotifications(data || [])
      } catch (err) {
        console.error("Erreur lors de la récupération des notifications:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()

    const channel = supabase
      .channel('admin_notifications_page')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'super_admin_notifications' },
        () => fetchNotifications()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const toastId = toast.loading("Mise à jour...")
    const res = await markNotificationAsRead(id)
    if (res.success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      toast.success("Marqué comme lu", { id: toastId })
    } else {
      toast.error("Erreur", { id: toastId })
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const toastId = toast.loading("Suppression...")
    const { error } = await supabase.from('super_admin_notifications').delete().eq('id', id)
    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id))
      toast.success("Notification supprimée", { id: toastId })
    } else {
      toast.error("Erreur de suppression", { id: toastId })
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Toutes les Notifications</h1>
          <p className="text-sm text-gray-500 mt-2">
            Historique complet des alertes de la plateforme.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 md:p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
            <p>Chargement des notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucune notification</h3>
            <p className="text-gray-500">L'historique des notifications est vide.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.is_read) handleMarkAsRead(notif.id)
                  router.push(notif.link)
                }}
                className={`flex flex-col md:flex-row gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  notif.is_read 
                    ? 'bg-gray-50/50 dark:bg-gray-800/20 border-transparent hover:border-gray-200 dark:hover:border-gray-700' 
                    : 'bg-white dark:bg-dark-surface border-primary/20 shadow-sm hover:shadow-md'
                }`}
              >
                <div className={`p-3 rounded-xl shrink-0 h-fit ${
                  notif.type === 'NEW_REGISTRATION' 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                }`}>
                  {notif.type === 'NEW_REGISTRATION' ? <Building2 className="w-6 h-6" /> : <Ticket className="w-6 h-6" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className={`font-semibold text-base ${!notif.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {notif.title}
                        {!notif.is_read && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            NOUVEAU
                          </span>
                        )}
                      </h4>
                      <p className={`mt-1 text-sm ${!notif.is_read ? 'text-gray-600 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.created_at).toLocaleString('fr-FR', {
                          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!notif.is_read && (
                        <button
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Marquer comme lu"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(notif.id, e)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
