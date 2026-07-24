'use client'

import { useState } from 'react'
import { Building2, Search, Power, PowerOff, Users } from 'lucide-react'
import { toggleCompanyStatus } from '../actions'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export function CompaniesClient({ initialCompanies }: { initialCompanies: any[] }) {
  const [search, setSearch] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const router = useRouter()

  const filteredCompanies = initialCompanies.filter(company => 
    company.name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggleStatus = async (companyId: string, currentStatus: string) => {
    setLoadingId(companyId)
    try {
      const result = await toggleCompanyStatus(companyId, currentStatus)
      if (result.success) {
        toast.success(`Le statut a été modifié avec succès (${result.newStatus})`)
        router.refresh()
      } else {
        toast.error("Erreur lors de la modification du statut")
      }
    } catch (error) {
      toast.error("Une erreur inattendue est survenue")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 md:gap-0">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gestion des Entreprises</h1>
          <p className="text-sm text-gray-500">Vue détaillée sur toutes les entreprises inscrites</p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher une entreprise..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 rounded-xl pl-10 pr-4 py-3 outline-none border border-transparent focus:border-primary transition-colors text-sm dark:text-white"
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="w-full overflow-x-auto hidden md:block">
          <table className="w-full min-w-[800px] text-sm text-left">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4">Nom de l'entreprise</th>
                <th className="px-6 py-4">Abonnement</th>
                <th className="px-6 py-4">Utilisateurs</th>
                <th className="px-6 py-4">Date d'inscription</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => {
                  const isActive = company.subscription_status === 'Actif' || company.subscription_status === 'active'
                  
                  return (
                    <tr key={company.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{company.name}</p>
                            <p className="text-xs text-gray-500">ID: {company.id.substring(0,8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          company.subscription_plan === 'Gratuit' 
                            ? 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                            : company.subscription_plan === 'Pro'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                            : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
                        }`}>
                          {company.subscription_plan || 'Gratuit'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{company.users_count || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {new Date(company.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          isActive 
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {company.subscription_status || 'Inconnu'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(company.id, company.subscription_status)}
                          disabled={loadingId === company.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400'
                              : 'text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 dark:text-green-400'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {loadingId === company.id ? (
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                          ) : isActive ? (
                            <PowerOff className="w-4 h-4" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                          {isActive ? "Suspendre" : "Activer"}
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucune entreprise trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="grid grid-cols-1 gap-4 md:hidden p-4">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => {
              const isActive = company.subscription_status === 'Actif' || company.subscription_status === 'active'
              return (
                <div key={company.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white leading-tight">{company.name}</h4>
                        <p className="text-xs text-gray-500">ID: {company.id.substring(0,8)}...</p>
                      </div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium ${
                      isActive 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {company.subscription_status || 'Inconnu'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-3 mb-4 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-[11px] text-gray-500 mb-0.5">Abonnement</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                        company.subscription_plan === 'Gratuit' 
                          ? 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                          : company.subscription_plan === 'Pro'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                          : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
                      }`}>
                        {company.subscription_plan || 'Gratuit'}
                      </span>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 mb-0.5">Utilisateurs</p>
                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-white">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {company.users_count || 0}
                      </div>
                    </div>
                    <div className="col-span-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-[11px] text-gray-500 mb-0.5">Date d'inscription</p>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {new Date(company.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end border-t border-gray-200 dark:border-gray-700 pt-3">
                    <button
                      onClick={() => handleToggleStatus(company.id, company.subscription_status)}
                      disabled={loadingId === company.id}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400'
                          : 'text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 dark:text-green-400'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loadingId === company.id ? (
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                      ) : isActive ? (
                        <PowerOff className="w-4 h-4" />
                      ) : (
                        <Power className="w-4 h-4" />
                      )}
                      {isActive ? "Suspendre l'entreprise" : "Activer l'entreprise"}
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              Aucune entreprise trouvée.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
