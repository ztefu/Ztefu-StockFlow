"use client";

import { useState } from "react";
import { AlertTriangle, Search, PackageX, TrendingDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface AlertsClientProps {
  allAlerts: any[];
  outOfStockCount: number;
  lowStockCount: number;
}

export function AlertsClient({ allAlerts: initialAlerts, outOfStockCount, lowStockCount }: AlertsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [alertsList, setAlertsList] = useState(initialAlerts);
  const supabase = createClient();

  const alerts = alertsList.filter((product: any) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOrder = async (id: string, name: string) => {
    const toastId = toast.loading(`Marquage de ${name} en commande...`);
    try {
      const { error } = await supabase
        .from('products')
        .update({ order_pending: true })
        .eq('id', id);

      if (error) throw error;

      setAlertsList(alertsList.map(a => a.id === id ? { ...a, order_pending: true } : a));
      toast.success(`Commande de réapprovisionnement enregistrée pour ${name}`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error(`Erreur lors du marquage.`, { id: toastId });
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 gap-6 md:gap-0">
        <div className="text-center md:text-left w-full">

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Alertes et Réapprovisionnement</h1>
          <p className="text-gray-500 mt-2">Suivez les produits qui nécessitent votre attention immédiate.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-red-50 dark:bg-red-500/10 p-6 rounded-2xl shadow-sm border border-red-100 dark:border-red-500/20 flex items-center gap-4 hover:-translate-y-1 transition-all duration-200">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
            <PackageX className="w-6 h-6 text-red-600 dark:text-red-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-400">Ruptures de stock</p>
            <p className="text-2xl font-bold text-red-900 dark:text-red-300">{outOfStockCount} produits</p>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-500/10 p-6 rounded-2xl shadow-sm border border-amber-100 dark:border-amber-500/20 flex items-center gap-4 hover:-translate-y-1 transition-all duration-200">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6 text-amber-600 dark:text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Stocks faibles</p>
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-300">{lowStockCount} produits</p>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all duration-200">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Produits à réapprovisionner
          </h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg pl-9 pr-4 py-2 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Produit</th>
                <th className="px-6 py-4 font-medium text-center">Stock Actuel</th>
                <th className="px-6 py-4 font-medium text-center">Stock Minimum</th>
                <th className="px-6 py-4 font-medium">Niveau d'urgence</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    Aucun produit en alerte trouvé.
                  </td>
                </tr>
              ) : alerts.map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sku || "-"}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-center font-bold">
                    <span className={product.stock === 0 ? "text-red-600 dark:text-red-500" : "text-amber-600 dark:text-amber-500"}>
                      {product.stock} <span className="font-normal text-xs">{product.stock > 1 ? `${product.unit}s` : product.unit}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-500">
                    {product.minStock} {product.minStock > 1 ? `${product.unit}s` : product.unit}
                  </td>
                  <td className="px-6 py-4">
                    {product.status === "out_of_stock" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Rupture immédiate
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Stock faible
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {product.order_pending ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 rounded-lg text-sm font-medium">
                        Commande en cours...
                      </span>
                    ) : (
                      <button onClick={() => handleOrder(product.id, product.name)} className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-sm font-medium transition-colors">
                        Commander
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
