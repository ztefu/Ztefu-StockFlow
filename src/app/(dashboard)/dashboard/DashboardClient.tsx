"use client";

import { useState } from "react";
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
  X
} from "lucide-react";
import toast from "react-hot-toast";

interface DashboardClientProps {
  stats: {
    totalStockValue: number;
    totalProducts: number;
    lowStockItems: number;
    outOfStockItems: number;
    entriesToday: number;
    exitsToday: number;
  };
  chartData: any[];
  recentMovements: any[];
  lowStockProducts: any[];
}

export function DashboardClient({ 
  stats, 
  chartData, 
  recentMovements, 
  lowStockProducts 
}: DashboardClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleExportPDF = () => {
    toast.success("Export PDF généré avec succès !");
    window.print();
  };

  return (
    <div className="w-full space-y-8">
      {/* Header section / Topbar replacement */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 gap-6 md:gap-0">
        <div className="text-center md:text-left w-full">

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Aperçu de l&apos;Activité</h1>
          <p className="text-gray-500 mt-2">Suivez vos stocks et vos mouvements en temps réel.</p>
        </div>
        <div className="flex gap-4 justify-center md:justify-end w-full md:w-auto">
          <button 
            onClick={handleExportPDF}
            className="px-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors active:scale-95"
          >
            Exporter PDF
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30 whitespace-nowrap active:scale-95"
          >
            Nouveau Mouvement
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Valeur Totale du Stock" 
          value={`${stats.totalStockValue.toLocaleString("fr-FR")} XAF`} 
          icon={Wallet}
        />
        <StatCard 
          title="Total Produits Actifs" 
          value={stats.totalProducts} 
          icon={Package} 
        />
        <StatCard 
          title="Produits en Alerte" 
          value={stats.lowStockItems} 
          icon={AlertTriangle} 
        />
        <StatCard 
          title="Ruptures de Stock" 
          value={stats.outOfStockItems} 
          icon={XCircle} 
        />
        <StatCard 
          title="Entrées Aujourd'hui" 
          value={stats.entriesToday} 
          icon={ArrowDownToLine} 
        />
        <StatCard 
          title="Sorties Aujourd'hui" 
          value={stats.exitsToday} 
          icon={ArrowUpFromLine} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Chart */}
          <StockChart data={chartData} />
          
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
