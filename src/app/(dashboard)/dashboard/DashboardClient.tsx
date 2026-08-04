"use client";

import { useState, useMemo } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { StockChart } from "@/components/dashboard/stock-chart";
import { RecentMovements } from "@/components/dashboard/recent-movements";
import { LowStockList } from "@/components/dashboard/low-stock-list";
import Link from "next/link";
import { 
  Package, 
  Wallet, 
  AlertTriangle, 
  XCircle, 
  ArrowDownToLine, 
  ArrowUpFromLine,
  X,
  Banknote
} from "lucide-react";
import toast from "react-hot-toast";

interface DashboardClientProps {
  stats: {
    totalStockValue: number;
    totalPotentialRevenue: number;
    totalProducts: number;
    lowStockItems: number;
    outOfStockItems: number;
  };
  chartData?: any[]; // We will compute this dynamically now
  recentMovements: any[];
  lowStockProducts: any[];
  allMovements: any[];
}

export function DashboardClient({ 
  stats, 
  chartData, 
  recentMovements, 
  lowStockProducts,
  allMovements = []
}: DashboardClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month');

  const { entries, exits, realRevenue } = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const filtered = allMovements.filter(m => {
      const mDate = new Date(m.date);
      switch (timeRange) {
        case 'today': return mDate >= startOfToday;
        case 'week': return mDate >= startOfWeek;
        case 'month': return mDate >= startOfMonth;
        case 'year': return mDate >= startOfYear;
        case 'all': return true;
        default: return true;
      }
    });

    const entriesCount = filtered.filter(m => m.type === 'in').reduce((acc, m) => acc + m.quantity, 0);
    const exitsCount = filtered.filter(m => m.type === 'out').reduce((acc, m) => acc + m.quantity, 0);
    const revenue = filtered
      .filter(m => m.type === 'out' && m.motif === 'Vente')
      .reduce((acc, m) => acc + (m.quantity * (m.unit_price || m.products?.price || 0)), 0);

    return { entries: entriesCount, exits: exitsCount, realRevenue: revenue };
  }, [allMovements, timeRange]);

  const dynamicChartData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    if (timeRange === 'year' || timeRange === 'all') {
      const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthIndex = d.getMonth();
        const year = d.getFullYear();
        
        const mvt = allMovements.filter(m => {
          const mDate = new Date(m.date);
          return mDate.getMonth() === monthIndex && mDate.getFullYear() === year;
        });

        data.push({
          name: monthNames[monthIndex],
          entries: mvt.filter(m => m.type === 'in').reduce((acc, m) => acc + m.quantity, 0),
          exits: mvt.filter(m => m.type === 'out').reduce((acc, m) => acc + m.quantity, 0)
        });
      }
    } else if (timeRange === 'month' || timeRange === 'week') {
      const days = timeRange === 'month' ? 30 : 7;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        
        const mvt = allMovements.filter(m => {
          const mDate = new Date(m.date);
          return mDate.getDate() === d.getDate() && mDate.getMonth() === d.getMonth() && mDate.getFullYear() === d.getFullYear();
        });

        data.push({
          name: `${d.getDate()}/${d.getMonth()+1}`,
          entries: mvt.filter(m => m.type === 'in').reduce((acc, m) => acc + m.quantity, 0),
          exits: mvt.filter(m => m.type === 'out').reduce((acc, m) => acc + m.quantity, 0)
        });
      }
    } else if (timeRange === 'today') {
      for (let i = 8; i <= 20; i += 2) {
        const mvt = allMovements.filter(m => {
          const mDate = new Date(m.date);
          const hour = mDate.getHours();
          return mDate.getDate() === now.getDate() && mDate.getMonth() === now.getMonth() && mDate.getFullYear() === now.getFullYear() && hour >= i && hour < i + 2;
        });
        
        data.push({
          name: `${i}h`,
          entries: mvt.filter(m => m.type === 'in').reduce((acc, m) => acc + m.quantity, 0),
          exits: mvt.filter(m => m.type === 'out').reduce((acc, m) => acc + m.quantity, 0)
        });
      }
    }

    return data;
  }, [allMovements, timeRange]);

  const timeLabels: Record<string, string> = {
    today: "Auj.",
    week: "Sem.",
    month: "Mois",
    year: "Année",
    all: "Global"
  };


  return (
    <div className="w-full space-y-8">
      {/* Header section / Topbar replacement */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 gap-6 md:gap-0">
        <div className="text-center md:text-left w-full">

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Aperçu de l&apos;Activité</h1>
          <p className="text-gray-500 mt-2">Suivez vos stocks et vos mouvements en temps réel.</p>
        </div>
        <div className="flex flex-row items-center justify-center md:justify-end gap-3 w-full md:w-auto">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
          >
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette Semaine</option>
            <option value="month">Ce Mois</option>
            <option value="year">Cette Année</option>
            <option value="all">Tout</option>
          </select>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30 whitespace-nowrap active:scale-95"
          >
            Nouveau Mouvement
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Block 1 */}
        <div className="flex flex-col gap-4 bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-3xl border border-blue-100 dark:border-blue-800/30 hover:shadow-lg hover:bg-blue-100/50 dark:hover:bg-blue-900/40 hover:-translate-y-1 transition-all duration-300">
          <StatCard 
            title="Valeur Totale (Achat)" 
            value={`${stats.totalStockValue.toLocaleString("fr-FR")} XAF`} 
            icon={Wallet}
            color="indigo"
          />
          <StatCard 
            title="Total Produits Actifs" 
            value={stats.totalProducts} 
            icon={Package} 
            color="blue"
          />
        </div>

        {/* Block 2 */}
        <div className="flex flex-col gap-4 bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-3xl border border-blue-100 dark:border-blue-800/30 hover:shadow-lg hover:bg-blue-100/50 dark:hover:bg-blue-900/40 hover:-translate-y-1 transition-all duration-300">
          <StatCard 
            title="C.A Potentiel (Vente)" 
            value={`${stats.totalPotentialRevenue.toLocaleString("fr-FR")} XAF`} 
            icon={Banknote}
            color="emerald"
          />
          <StatCard 
            title={`C.A Réel (${timeLabels[timeRange]})`} 
            value={`${realRevenue.toLocaleString("fr-FR")} XAF`} 
            icon={Banknote} 
            color="green"
          />
        </div>

        {/* Block 3 */}
        <div className="flex flex-col gap-4 bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-3xl border border-blue-100 dark:border-blue-800/30 hover:shadow-lg hover:bg-blue-100/50 dark:hover:bg-blue-900/40 hover:-translate-y-1 transition-all duration-300">
          <StatCard 
            title={`Entrées (${timeLabels[timeRange]})`} 
            value={entries} 
            icon={ArrowDownToLine} 
            color="green"
          />
          <StatCard 
            title={`Sorties (${timeLabels[timeRange]})`} 
            value={exits} 
            icon={ArrowUpFromLine} 
            color="red"
          />
        </div>

        {/* Block 4 */}
        <div className="flex flex-col gap-4 bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-3xl border border-blue-100 dark:border-blue-800/30 hover:shadow-lg hover:bg-blue-100/50 dark:hover:bg-blue-900/40 hover:-translate-y-1 transition-all duration-300">
          <StatCard 
            title="Produits en Alerte" 
            value={stats.lowStockItems} 
            icon={AlertTriangle} 
            color="orange"
          />
          <StatCard 
            title="Ruptures de Stock" 
            value={stats.outOfStockItems} 
            icon={XCircle} 
            color="rose"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Chart */}
          <StockChart data={dynamicChartData} />
          
          {/* Recent Movements Table */}
          <RecentMovements movements={recentMovements} />
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          {/* Low Stock Alerts */}
          <LowStockList products={lowStockProducts} />
          
          {/* Info Card Example */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-primary-dark dark:text-blue-300">
            <h4 className="font-bold flex items-center gap-2 mb-2">
              <span className="text-xl">💡</span> Astuce
            </h4>
            <p className="text-sm opacity-90 leading-relaxed">
              Maintenez vos stocks minimums à jour pour éviter les ruptures inattendues. Le système vous alertera automatiquement dès qu&apos;un seuil est atteint.
            </p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nouveau Mouvement</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500 mb-6">
                Quel type de mouvement souhaitez-vous enregistrer ?
              </p>
              <Link 
                href="/stock/entries"
                className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-500 flex items-center justify-center shrink-0 mr-4">
                  <ArrowDownToLine className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">Entrée de Stock</h4>
                  <p className="text-sm text-gray-500">Approvisionnement, retour client...</p>
                </div>
              </Link>

              <Link 
                href="/stock/exits"
                className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-500 flex items-center justify-center shrink-0 mr-4">
                  <ArrowUpFromLine className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors">Sortie de Stock</h4>
                  <p className="text-sm text-gray-500">Vente, perte, consommation interne...</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
