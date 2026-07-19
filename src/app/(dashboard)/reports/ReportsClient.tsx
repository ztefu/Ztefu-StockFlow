"use client";

import { useState, useMemo } from "react";
import { FileText, Download, BarChart2, PieChart, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Product {
  id: string;
  name: string;
  stock_actuel?: number;
  purchase_price?: number;
}

interface StockMovement {
  id: string;
  product_id: string;
  quantity: number;
  type: string;
  created_at: string;
  fournisseur?: string;
  motif?: string;
  reference?: string;
}

interface ReportsClientProps {
  products: Product[];
  movements: StockMovement[];
}

export function ReportsClient({ products, movements }: ReportsClientProps) {
  const [period, setPeriod] = useState("Cette semaine");

  const getStartDate = () => {
    const now = new Date();
    let startDate = new Date();
    if (period === "Cette semaine") {
      startDate.setDate(now.getDate() - 7);
    } else if (period === "Ce mois-ci") {
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === "Cette année") {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      startDate.setHours(0, 0, 0, 0);
    }
    return startDate;
  };

  const handleGenerate = (reportName: string) => {
    const toastId = toast.loading(`Génération de "${reportName}"...`);
    
    try {
      let csvContent = "\uFEFF"; // BOM pour forcer UTF-8 dans Excel
      const separator = ";";
      let filename = "rapport.csv";

      if (reportName === "Inventaire complet") {
        filename = `inventaire_${new Date().toISOString().split('T')[0]}.csv`;
        csvContent += ["ID", "Produit", "Stock Actuel", "Prix d'Achat", "Valeur Totale"].join(separator) + "\n";
        
        products.forEach(p => {
          const stock = p.stock_actuel || 0;
          const price = p.purchase_price || 0;
          const value = stock * price;
          csvContent += [p.id, `"${p.name}"`, stock, price, value].join(separator) + "\n";
        });
      } 
      else if (reportName === "Historique des entrées") {
        filename = `entrees_${new Date().toISOString().split('T')[0]}.csv`;
        csvContent += ["Date", "Produit", "Quantité", "Fournisseur", "Référence"].join(separator) + "\n";
        
        const startDate = getStartDate();
        const filtered = movements.filter(m => m.type === 'in' && new Date(m.created_at) >= startDate);
        
        filtered.forEach(m => {
          const product = products.find(p => p.id === m.product_id)?.name || "Inconnu";
          const date = new Date(m.created_at).toLocaleDateString();
          csvContent += [date, `"${product}"`, m.quantity, `"${m.fournisseur || ''}"`, `"${m.reference || ''}"`].join(separator) + "\n";
        });
      }
      else if (reportName === "Analyse des sorties") {
        filename = `sorties_${new Date().toISOString().split('T')[0]}.csv`;
        csvContent += ["Date", "Produit", "Quantité", "Motif", "Référence"].join(separator) + "\n";
        
        const startDate = getStartDate();
        const filtered = movements.filter(m => m.type === 'out' && new Date(m.created_at) >= startDate);
        
        filtered.forEach(m => {
          const product = products.find(p => p.id === m.product_id)?.name || "Inconnu";
          const date = new Date(m.created_at).toLocaleDateString();
          csvContent += [date, `"${product}"`, m.quantity, `"${m.motif || ''}"`, `"${m.reference || ''}"`].join(separator) + "\n";
        });
      }

      // Déclencher le téléchargement
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      
      // Nettoyage asynchrone pour éviter que le navigateur n'annule le téléchargement
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 500);

      toast.success(`Rapport généré avec succès !`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error(`Erreur lors de la génération.`, { id: toastId });
    }
  };

  const chartData = useMemo(() => {
    const startDate = getStartDate();

    const filteredMovements = movements.filter(m => m.type === 'out' && new Date(m.created_at) >= startDate);

    // Grouper par produit
    const aggregated: Record<string, number> = {};
    filteredMovements.forEach(m => {
      aggregated[m.product_id] = (aggregated[m.product_id] || 0) + m.quantity;
    });

    // Mapper avec le nom du produit et trier
    const data = Object.entries(aggregated)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        return {
          name: product ? product.name : "Produit Inconnu",
          value: quantity
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5

    // Si aucune donnée, renvoyer un tableau vide structuré
    return data.length > 0 ? data : [{ name: "Aucune donnée", value: 0 }];
  }, [period, movements, products]);

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 gap-6 md:gap-0">
        <div className="text-center md:text-left w-full">

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rapports et Analyses</h1>
          <p className="text-gray-500 mt-2">Générez des rapports détaillés sur l'état de votre stock et vos mouvements.</p>
        </div>
        <div className="flex justify-center md:justify-end w-full md:w-auto">
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-auto bg-white dark:bg-dark-surface text-sm rounded-lg px-4 py-2.5 outline-none border border-gray-200 dark:border-gray-700 focus:border-primary transition-colors appearance-none shadow-sm"
          >
            <option>Aujourd'hui</option>
            <option>Cette semaine</option>
            <option>Ce mois-ci</option>
            <option>Cette année</option>
            <option>Personnalisé...</option>
          </select>
        </div>
      </div>

      {/* Main Stats Chart */}
      <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            Top 5 des produits les plus sortis ({period.toLowerCase()})
          </h3>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} />
              <Tooltip 
                cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report Types Grid */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Bibliothèque de rapports</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col h-full">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-500" />
          </div>
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Inventaire complet</h4>
          <p className="text-sm text-gray-500 mb-6 flex-1">
            Générez un rapport détaillé de tous les produits en stock, incluant les quantités actuelles et la valorisation globale.
          </p>
          <button 
            onClick={() => handleGenerate("Inventaire complet")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white dark:bg-blue-500/10 dark:hover:bg-blue-600 dark:text-blue-400 dark:hover:text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Générer (Excel/CSV)
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col h-full">
          <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-500" />
          </div>
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Historique des entrées</h4>
          <p className="text-sm text-gray-500 mb-6 flex-1">
            Un résumé de tous les réapprovisionnements sur la période sélectionnée, classés par date et par fournisseur.
          </p>
          <button 
            onClick={() => handleGenerate("Historique des entrées")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-600 text-green-600 hover:text-white dark:bg-green-500/10 dark:hover:bg-green-600 dark:text-green-400 dark:hover:text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Générer (Excel/CSV)
          </button>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col h-full">
          <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-4">
            <PieChart className="w-6 h-6 text-orange-600 dark:text-orange-500" />
          </div>
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Analyse des sorties</h4>
          <p className="text-sm text-gray-500 mb-6 flex-1">
            Statistiques sur les ventes, pertes et consommations internes pour identifier les tendances.
          </p>
          <button 
            onClick={() => handleGenerate("Analyse des sorties")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white dark:bg-orange-500/10 dark:hover:bg-orange-600 dark:text-orange-400 dark:hover:text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Générer (Excel/CSV)
          </button>
        </div>
      </div>
    </div>
  );
}
