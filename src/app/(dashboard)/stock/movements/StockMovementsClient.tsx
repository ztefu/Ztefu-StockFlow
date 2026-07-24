"use client";

import { useState } from "react";
import { Search, Download, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import toast from "react-hot-toast";
import { DatePicker } from "@/components/ui/date-picker";

export default function StockMovementsClient({ initialMovements }: { initialMovements: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const filteredMovements = initialMovements.filter(movement => {
    const matchesSearch = movement.product_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (movement.user_name && movement.user_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "all" ? true : movement.type === typeFilter;
    const matchesDate = dateFilter ? movement.date.startsWith(dateFilter) : true;
    return matchesSearch && matchesType && matchesDate;
  });

  const handleExport = () => {
    const toastId = toast.loading("Génération du CSV...");
    try {
      let csvContent = "\uFEFF"; // BOM pour forcer UTF-8
      const separator = ";";
      csvContent += ["Date", "Type", "Produit", "Quantité", "Motif / Fournisseur", "Utilisateur", "Observation"].join(separator) + "\n";
      
      filteredMovements.forEach(m => {
        const date = new Date(m.date).toLocaleDateString('fr-FR');
        const type = m.type === 'in' ? 'Entrée' : 'Sortie';
        const produit = `"${m.product_name || ''}"`;
        const quantite = m.quantity;
        const motif = `"${m.type === 'in' ? (m.fournisseur || '') : (m.motif || 'Vente')}"`;
        const user = `"${m.user_name || 'Système'}"`;
        const observation = `"${(m.observation || '').replace(/"/g, '""')}"`;
        csvContent += [date, type, produit, quantite, motif, user, observation].join(separator) + "\n";
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `mouvements_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      
      // Délai pour éviter l'annulation sur certains navigateurs
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 500);

      toast.success("Export réussi !", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'export.", { id: toastId });
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 gap-6 md:gap-0">
        <div className="text-center md:text-left w-full">

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Grand Livre des Stocks</h1>
          <p className="text-gray-500 mt-2">Consultez l'historique complet de toutes les entrées et sorties de votre stock.</p>
        </div>
        <div className="flex gap-4 justify-center md:justify-end w-full md:w-auto">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors active:scale-95 shadow-sm whitespace-nowrap">
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher par produit, utilisateur..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-gray-50 dark:bg-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors flex-1 md:flex-none appearance-none"
          >
            <option value="all">Tous les types</option>
            <option value="in">Entrées uniquement</option>
            <option value="out">Sorties uniquement</option>
          </select>
          <div className="flex-1 md:flex-none">
            <DatePicker value={dateFilter} onChange={setDateFilter} align="right" />
          </div>
        </div>
      </div>

      {/* Movements List Desktop */}
      <div className="hidden md:block bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Produit</th>
                <th className="px-6 py-4 font-medium text-right">Quantité</th>
                <th className="px-6 py-4 font-medium">Motif / Fournisseur</th>
                <th className="px-6 py-4 font-medium">Utilisateur</th>
                <th className="px-6 py-4 font-medium">Observation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredMovements.map((movement) => (
                <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{new Date(movement.date).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4">
                    {movement.type === "in" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                        <ArrowDownToLine className="w-3.5 h-3.5" />
                        Entrée
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20">
                        <ArrowUpFromLine className="w-3.5 h-3.5" />
                        Sortie
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {movement.product_name}
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${movement.type === "in" ? "text-green-600 dark:text-green-500" : "text-orange-600 dark:text-orange-500"}`}>
                    {movement.type === "in" ? "+" : "-"}{movement.quantity} <span className="font-normal text-xs">{movement.quantity > 1 ? `${movement.unit}s` : movement.unit}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {movement.type === "in" ? movement.fournisseur || "-" : movement.motif || "Vente"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {movement.user_name || "Système"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={movement.observation}>
                    {movement.observation || "-"}
                  </td>
                </tr>
              ))}
              {filteredMovements.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Aucun mouvement trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredMovements.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500">
            <div>Affichage de 1 à {filteredMovements.length} sur {filteredMovements.length} mouvements</div>
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">Précédent</button>
              <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">Suivant</button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredMovements.map((movement) => (
          <div key={movement.id} className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{movement.product_name}</h4>
                <p className="text-xs text-gray-500 mt-1">{new Date(movement.date).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="shrink-0">
                {movement.type === "in" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    <ArrowDownToLine className="w-3 h-3" /> Entrée
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
                    <ArrowUpFromLine className="w-3 h-3" /> Sortie
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl mb-3">
              <div>
                <p className="text-[11px] text-gray-500 mb-0.5">Quantité</p>
                <p className={`text-sm font-bold ${movement.type === "in" ? "text-green-600 dark:text-green-500" : "text-orange-600 dark:text-orange-500"}`}>
                  {movement.type === "in" ? "+" : "-"}{movement.quantity} <span className="font-normal text-xs text-gray-500">{movement.quantity > 1 ? `${movement.unit}s` : movement.unit}</span>
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 mb-0.5">Utilisateur</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{movement.user_name || "Système"}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
              <p className="text-[11px] text-gray-500 mb-0.5">{movement.type === "in" ? "Fournisseur" : "Motif"}</p>
              <p className="text-sm text-gray-900 dark:text-white mb-2">{movement.type === "in" ? movement.fournisseur || "-" : movement.motif || "Vente"}</p>
              
              {movement.observation && (
                <>
                  <p className="text-[11px] text-gray-500 mb-0.5">Observation</p>
                  <p className="text-sm text-gray-900 dark:text-white">{movement.observation}</p>
                </>
              )}
            </div>
          </div>
        ))}
        {filteredMovements.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-gray-800">
            <p className="text-gray-500 text-sm">Aucun mouvement trouvé.</p>
          </div>
        )}
      </div>
    </div>
  );
}
