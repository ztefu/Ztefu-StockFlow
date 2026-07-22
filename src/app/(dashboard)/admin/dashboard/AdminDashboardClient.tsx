'use client'

import { useState, useMemo } from 'react'
import { BarChart3, Users, Building2, CreditCard, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DatePicker } from '@/components/ui/date-picker'

export function AdminDashboardClient({ initialMetrics }: { initialMetrics: any }) {
  const [period, setPeriod] = useState('all') // 'all', 'today', 'week', 'month', 'year', 'custom'
  const [customDate, setCustomDate] = useState<string>('')

  // Filtrer les entreprises selon la période
  const filteredCompanies = useMemo(() => {
    if (!initialMetrics.companiesData) return []
    
    const now = new Date()
    return initialMetrics.companiesData.filter((company: any) => {
      const companyDate = new Date(company.created_at)
      
      switch(period) {
        case 'today':
          return companyDate.toDateString() === now.toDateString()
        case 'week': {
          const startOfWeek = new Date(now)
          startOfWeek.setDate(now.getDate() - now.getDay()) // Starts on Sunday (or Monday depending on locale, but simple logic here)
          startOfWeek.setHours(0,0,0,0)
          return companyDate >= startOfWeek
        }
        case 'month':
          return companyDate.getMonth() === now.getMonth() && companyDate.getFullYear() === now.getFullYear()
        case 'year':
          return companyDate.getFullYear() === now.getFullYear()
        case 'custom':
          if (!customDate) return true;
          return companyDate.toDateString() === new Date(customDate).toDateString()
        default:
          return true
      }
    })
  }, [initialMetrics.companiesData, period, customDate])

  // Filtrer les utilisateurs selon la période
  const filteredUsers = useMemo(() => {
    if (!initialMetrics.usersData) return []
    
    const now = new Date()
    return initialMetrics.usersData.filter((user: any) => {
      const userDate = new Date(user.created_at)
      
      switch(period) {
        case 'today':
          return userDate.toDateString() === now.toDateString()
        case 'week': {
          const startOfWeek = new Date(now)
          startOfWeek.setDate(now.getDate() - now.getDay()) 
          startOfWeek.setHours(0,0,0,0)
          return userDate >= startOfWeek
        }
        case 'month':
          return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear()
        case 'year':
          return userDate.getFullYear() === now.getFullYear()
        case 'custom':
          if (!customDate) return true;
          return userDate.toDateString() === new Date(customDate).toDateString()
        default:
          return true
      }
    })
  }, [initialMetrics.usersData, period, customDate])

  // Recalculer les KPIs pour la période sélectionnée
  const periodMetrics = useMemo(() => {
    let mrr = 0
    let active = 0
    
    filteredCompanies.forEach((company: any) => {
      if (company.subscription_status === 'Actif' || company.subscription_status === 'active') {
        active++
        if (company.subscription_plan === 'Pro') mrr += 5000
        if (company.subscription_plan === 'Business') mrr += 15000
      }
    })

    return {
      newCompanies: filteredCompanies.length,
      activeCompanies: active,
      newMrr: mrr,
      newUsers: filteredUsers.length
    }
  }, [filteredCompanies, filteredUsers])

  // Générer les données pour le graphique des inscriptions
  const chartData = useMemo(() => {
    if (!initialMetrics.companiesData) return []
    
    const dataMap = new Map()
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

    filteredCompanies.forEach((company: any) => {
      const date = new Date(company.created_at)
      let key = ''
      
      if (period === 'month' || period === 'today' || period === 'week' || period === 'custom') {
        key = `${date.getDate()} ${months[date.getMonth()]}`
      } else {
        key = months[date.getMonth()]
      }

      const existing = dataMap.get(key) || { name: key, gratuit: 0, pro: 0, business: 0 }
      
      if (company.subscription_plan === 'Pro') existing.pro += 1
      else if (company.subscription_plan === 'Business') existing.business += 1
      else existing.gratuit += 1

      dataMap.set(key, existing)
    })

    return Array.from(dataMap.values())
  }, [filteredCompanies, period])

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 md:gap-0">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">SaaS Dashboard</h1>
          <p className="text-sm text-gray-500">Performances globales (hors comptes Super Admin)</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {period === 'custom' && (
            <div className="w-48">
              <DatePicker 
                value={customDate} 
                onChange={setCustomDate} 
                align="right"
              />
            </div>
          )}
          <div className="flex items-center gap-3 bg-white dark:bg-dark-surface p-2 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <Calendar className="w-4 h-4 text-gray-400 ml-2" />
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent text-sm font-medium outline-none text-gray-700 dark:text-gray-200 pr-4 cursor-pointer"
            >
              <option value="all">Tous les temps</option>
              <option value="year">Cette année</option>
              <option value="month">Ce mois-ci</option>
              <option value="week">Cette semaine</option>
              <option value="today">Aujourd'hui</option>
              <option value="custom">Date spécifique</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">{period === 'all' ? 'MRR Total' : 'Nouveau MRR'}</h3>
            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
              <CreditCard size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {periodMetrics.newMrr.toLocaleString('fr-FR')} FCFA
          </p>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">{period === 'all' ? 'Entreprises Totales' : 'Nouvelles Entreprises'}</h3>
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Building2 size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {periodMetrics.newCompanies}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Dont {periodMetrics.activeCompanies} actives
          </p>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">{period === 'all' ? 'Utilisateurs Totaux' : 'Nouveaux Utilisateurs'}</h3>
            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Users size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {period === 'all' ? initialMetrics.totalUsers : periodMetrics.newUsers}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            (Global à la plateforme)
          </p>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Moy. Utilisateurs / Entreprise</h3>
            <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <BarChart3 size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {initialMetrics.totalCompanies > 0 ? Math.round((initialMetrics.totalUsers / initialMetrics.totalCompanies) * 10) / 10 : 0}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Évolution des Inscriptions</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip 
                cursor={{ fill: '#F3F4F6', opacity: 0.4 }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="gratuit" name="Gratuit" stackId="a" fill="#9CA3AF" radius={[0, 0, 4, 4]} />
              <Bar dataKey="pro" name="Pro" stackId="a" fill="#3B82F6" />
              <Bar dataKey="business" name="Business" stackId="a" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
