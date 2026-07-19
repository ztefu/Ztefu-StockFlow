"use client";

import { useState, useTransition } from "react";
import { Minus, Search, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { DatePicker } from "@/components/ui/date-picker";
import { createStockExit } from "../actions";

export default function StockExitsClient({ 
  products, 
  initialExits 
}: { 
  products: any[], 
  initialExits: any[] 
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  
  // Form state
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [motif, setMotif] = useState("");
  const [remarque, setRemarque] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const exits = initialExits.filter(exit => 
    exit.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (exit.user_name && exit.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (exit.motif && exit.motif.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !quantity) {
      toast.error("Veuillez remplir les champs obligatoires (Produit, Quantité)");
      return;
    }

    if (!selectedProduct) return;

    if (parseInt(quantity) > selectedProduct.stock) {
      toast.error(`Stock insuffisant. Il ne reste que ${selectedProduct.stock} ${selectedProduct.stock > 1 ? `${selectedProduct.unit}s` : selectedProduct.unit}.`);
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('product_id', selectedProductId);
      formData.append('quantity', quantity);
      formData.append('date', date);
      if (motif) formData.append('motif', motif);
      if (remarque) formData.append('remarque', remarque);

      const res = await createStockExit(formData);
      
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`Sortie de ${quantity} ${parseInt(quantity) > 1 ? `${selectedProduct.unit}s` : selectedProduct.unit} enregistrée !`);
        // Reset form
        setSelectedProductId("");
        setQuantity("");
        setMotif("");
        setRemarque("");
        setDate(new Date().toISOString().split('T')[0]);
      }
    });
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 gap-6 md:gap-0">
        <div className="text-center md:text-left w-full">

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sorties de Stock</h1>
          <p className="text-gray-500 mt-2">Enregistrez les ventes, les pertes ou les déstockages.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire de sortie */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-200">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Nouvelle Sortie</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Produit *</label>
                <select 
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors appearance-none"
                  disabled={isPending}
                >
                  <option value="">Sélectionner un produit...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.stock === 0}>
                      {p.name} ({p.stock} {p.stock > 1 ? `${p.unit}s` : p.unit}) {p.stock === 0 ? '- Rupture' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && selectedProduct.stock <= selectedProduct.minStock && selectedProduct.stock > 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-lg text-sm">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>Attention: Le stock de ce produit est faible ({selectedProduct.stock} restants).</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantité *</label>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0" 
                    max={selectedProduct?.stock || ""}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors" 
                    disabled={isPending || !selectedProductId}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                  <DatePicker value={date} onChange={setDate} align="right" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motif *</label>
                <select 
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  required
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors appearance-none"
                  disabled={isPending}
                >
                  <option value="">Sélectionner un motif...</option>
                  <option value="Vente">Vente (Client)</option>
                  <option value="Perte/Casse">Perte / Casse</option>
                  <option value="Expiration">Expiration</option>
                  <option value="Autre">Autre déstockage</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarque</label>
                <textarea 
                  rows={2} 
                  value={remarque}
                  onChange={(e) => setRemarque(e.target.value)}
                  placeholder="Détails supplémentaires..." 
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors resize-none"
                  disabled={isPending}
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isPending || !selectedProductId}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all active:scale-95 shadow-sm shadow-red-600/30 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
                {isPending ? 'Enregistrement...' : 'Enregistrer la sortie'}
              </button>
            </form>
          </div>
        </div>

        {/* Historique des sorties */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all duration-200">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Historique des sorties</h3>
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
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Produit</th>
                    <th className="px-6 py-4 font-medium">Quantité</th>
                    <th className="px-6 py-4 font-medium">Motif</th>
                    <th className="px-6 py-4 font-medium">Utilisateur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {exits.map((exit) => (
                    <tr key={exit.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(exit.date).toLocaleDateString('fr-FR')}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{exit.product_name}</td>
                      <td className="px-6 py-4 text-sm font-bold text-red-600 dark:text-red-500">
                        -{exit.quantity} {exit.quantity > 1 ? `${exit.unit}s` : exit.unit}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300">
                          {exit.motif || "Non défini"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{exit.user_name || "Système"}</td>
                    </tr>
                  ))}
                  {exits.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        Aucune sortie trouvée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
