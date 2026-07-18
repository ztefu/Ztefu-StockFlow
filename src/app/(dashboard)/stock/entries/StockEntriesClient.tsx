"use client";

import { useState, useTransition } from "react";
import { Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import { DatePicker } from "@/components/ui/date-picker";
import { createStockEntry } from "../actions";

export default function StockEntriesClient({ 
  products, 
  initialEntries 
}: { 
  products: any[], 
  initialEntries: any[] 
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  
  // Form state
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [fournisseur, setFournisseur] = useState("");
  const [remarque, setRemarque] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const entries = initialEntries.filter(entry => 
    entry.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entry.user_name && entry.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (entry.fournisseur && entry.fournisseur.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !quantity) {
      toast.error("Veuillez remplir les champs obligatoires (Produit, Quantité)");
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append('product_id', selectedProductId);
      formData.append('quantity', quantity);
      formData.append('date', date);
      if (fournisseur) formData.append('fournisseur', fournisseur);
      if (remarque) formData.append('remarque', remarque);

      const res = await createStockEntry(formData);
      
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`Entrée de ${quantity} ${parseInt(quantity) > 1 ? `${product.unit}s` : product.unit} enregistrée !`);
        // Reset form
        setSelectedProductId("");
        setQuantity("");
        setFournisseur("");
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
          <div className="text-sm text-gray-500 mb-1 font-medium">Stock &gt; Entrées</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Entrées de Stock</h1>
          <p className="text-gray-500 mt-2">Enregistrez les réapprovisionnements et les livraisons fournisseurs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire d'entrée */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-200">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Nouvelle Entrée</h3>
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
                    <option key={p.id} value={p.id}>{p.name} ({p.stock} {p.stock > 1 ? `${p.unit}s` : p.unit})</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantité *</label>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0" 
                    className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors" 
                    disabled={isPending}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                  <DatePicker value={date} onChange={setDate} align="right" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix d'achat unitaire</label>
                <input type="number" placeholder="0 FCFA" className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors" disabled={isPending} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fournisseur</label>
                <input 
                  type="text" 
                  value={fournisseur}
                  onChange={(e) => setFournisseur(e.target.value)}
                  placeholder="Nom du fournisseur..." 
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors" 
                  disabled={isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarque</label>
                <textarea 
                  rows={2} 
                  value={remarque}
                  onChange={(e) => setRemarque(e.target.value)}
                  placeholder="Observation optionnelle..." 
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors resize-none"
                  disabled={isPending}
                ></textarea>
              </div>

              <button type="submit" disabled={isPending} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-all active:scale-95 shadow-sm shadow-primary/30 mt-4 disabled:opacity-50">
                <Plus className="w-4 h-4" />
                {isPending ? 'Enregistrement...' : "Enregistrer l'entrée"}
              </button>
            </form>
          </div>
        </div>

        {/* Historique des entrées */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all duration-200">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Historique des entrées</h3>
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
                    <th className="px-6 py-4 font-medium">Fournisseur</th>
                    <th className="px-6 py-4 font-medium">Utilisateur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(entry.date).toLocaleDateString('fr-FR')}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{entry.product_name}</td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600 dark:text-green-500">
                        +{entry.quantity} {entry.quantity > 1 ? `${entry.unit}s` : entry.unit}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{entry.fournisseur || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{entry.user_name || "Système"}</td>
                    </tr>
                  ))}
                  {entries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        Aucune entrée trouvée.
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
