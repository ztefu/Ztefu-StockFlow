'use client';

import { useState } from 'react';
import { Globe, Plus, Trash2, Search, Package, Tags } from 'lucide-react';
import { createGlobalCategory, createGlobalProduct, deleteGlobalElement } from './actions';
import toast from 'react-hot-toast';

export function CatalogClient({ initialCategories, initialProducts }: { initialCategories: any[], initialProducts: any[] }) {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Modales
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = initialCategories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const filteredProducts = initialProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const totalPagesProducts = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const validCurrentPageProducts = Math.min(currentPage, totalPagesProducts);
  
  const paginatedProducts = filteredProducts.slice(
    (validCurrentPageProducts - 1) * ITEMS_PER_PAGE, 
    validCurrentPageProducts * ITEMS_PER_PAGE
  );

  const totalPagesCategories = Math.max(1, Math.ceil(filteredCategories.length / ITEMS_PER_PAGE));
  const validCurrentPageCategories = Math.min(currentPage, totalPagesCategories);
  
  const paginatedCategories = filteredCategories.slice(
    (validCurrentPageCategories - 1) * ITEMS_PER_PAGE, 
    validCurrentPageCategories * ITEMS_PER_PAGE
  );

  const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await createGlobalCategory(formData);
    setIsSubmitting(false);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Catégorie globale créée");
      setShowCategoryModal(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await createGlobalProduct(formData);
    setIsSubmitting(false);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Produit global créé");
      setShowProductModal(false);
    }
  };

  const handleDelete = async (id: string, type: 'product' | 'category') => {
    if (!confirm(`Voulez-vous vraiment supprimer cet élément global ?`)) return;
    const res = await deleteGlobalElement(id, type);
    if (res.error) toast.error(res.error);
    else toast.success("Élément supprimé");
  };

  return (
    <div className="w-full space-y-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 gap-6 md:gap-0">
        <div className="text-center md:text-left w-full">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-3">
            <Globe className="w-8 h-8 text-primary" />
            Catalogue Global
          </h1>
          <p className="text-gray-500 mt-2 max-w-2xl">
            Gérez les produits et catégories modèles. Les entreprises pourront les cloner pour éviter les doublons.
          </p>
        </div>

        <div className="flex gap-3 justify-center md:justify-end w-full md:w-auto">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Catégorie Globale
          </button>
          <button
            onClick={() => setShowProductModal(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-dark active:scale-95 text-white rounded-lg text-sm font-medium transition-all shadow-sm shadow-primary/30 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Produit Global
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-8">
        <div className="flex border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => { setActiveTab('products'); setCurrentPage(1); }}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'products' ? 'text-primary' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
          >
            <Package className="w-4 h-4" />
            Produits Globaux ({initialProducts.length})
            {activeTab === 'products' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
            )}
          </button>
          <button
            onClick={() => { setActiveTab('categories'); setCurrentPage(1); }}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${activeTab === 'categories' ? 'text-primary' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
          >
            <Tags className="w-4 h-4" />
            Catégories Globales ({initialCategories.length})
            {activeTab === 'categories' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
            )}
          </button>
        </div>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Desktop Table Views */}
        <div className="overflow-x-auto hidden md:block">
          {activeTab === 'products' ? (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                  <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Produit</th>
                  <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Catégorie Globale</th>
                  <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">SKU</th>
                  <th className="p-4 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900 dark:text-white">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                      {p.category?.name || '-'}
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                      {p.sku || '-'}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(p.id, 'product')}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedProducts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">Aucun produit global trouvé.</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                  <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Catégorie</th>
                  <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Description</th>
                  <th className="p-4 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color || '#3B82F6' }} />
                        <span className="font-medium text-gray-900 dark:text-white">{c.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                      {c.description || '-'}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(c.id, 'category')}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedCategories.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-500">Aucune catégorie globale trouvée.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile Card Views */}
        <div className="grid grid-cols-1 gap-4 md:hidden p-4">
          {activeTab === 'products' ? (
            paginatedProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                Aucun produit global trouvé.
              </div>
            ) : (
              paginatedProducts.map((p) => (
                <div key={p.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white leading-tight">{p.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">SKU: <span className="font-mono">{p.sku || '-'}</span></p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mt-3 mb-4 border border-gray-100 dark:border-gray-700">
                    <p className="text-[11px] text-gray-500 mb-0.5">Catégorie Globale</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {p.category?.name || '-'}
                    </p>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button 
                      onClick={() => handleDelete(p.id, 'product')}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors text-xs font-medium"
                    >
                      <Trash2 className="w-4 h-4" /> Supprimer
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            paginatedCategories.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                Aucune catégorie globale trouvée.
              </div>
            ) : (
              paginatedCategories.map((c) => (
                <div key={c.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color || '#3B82F6' }} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white leading-tight">{c.name}</h4>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mt-3 mb-4 border border-gray-100 dark:border-gray-700">
                    <p className="text-[11px] text-gray-500 mb-0.5">Description</p>
                    <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                      {c.description || '-'}
                    </p>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button 
                      onClick={() => handleDelete(c.id, 'category')}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors text-xs font-medium"
                    >
                      <Trash2 className="w-4 h-4" /> Supprimer
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {activeTab === 'products' && paginatedProducts.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500">
            <div>Affichage de {(validCurrentPageProducts - 1) * ITEMS_PER_PAGE + (paginatedProducts.length > 0 ? 1 : 0)} à {(validCurrentPageProducts - 1) * ITEMS_PER_PAGE + paginatedProducts.length} sur {filteredProducts.length} produits globaux</div>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={validCurrentPageProducts === 1}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Précédent
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPagesProducts, prev + 1))}
                disabled={validCurrentPageProducts === totalPagesProducts}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {activeTab === 'categories' && paginatedCategories.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500">
            <div>Affichage de {(validCurrentPageCategories - 1) * ITEMS_PER_PAGE + (paginatedCategories.length > 0 ? 1 : 0)} à {(validCurrentPageCategories - 1) * ITEMS_PER_PAGE + paginatedCategories.length} sur {filteredCategories.length} catégories globales</div>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={validCurrentPageCategories === 1}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Précédent
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPagesCategories, prev + 1))}
                disabled={validCurrentPageCategories === totalPagesCategories}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Produit */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-surface rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4">Nouveau Produit Global</h3>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nom du produit *</label>
                <input required name="name" className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Catégorie Globale</label>
                <select name="category_id" className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900">
                  <option value="">Sélectionnez...</option>
                  {initialCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Code Barre / SKU (Optionnel)</label>
                <input name="sku" className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Image</label>
                <input type="file" name="image" accept="image/jpeg,image/png,image/webp" className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowProductModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Catégorie */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-surface rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4">Nouvelle Catégorie Globale</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nom *</label>
                <input required name="name" className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea name="description" rows={3} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Couleur</label>
                <div className="flex gap-2">
                  {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B'].map(c => (
                    <label key={c} className="cursor-pointer">
                      <input type="radio" name="color" value={c} className="sr-only peer" defaultChecked={c === '#3B82F6'} />
                      <div className="w-8 h-8 rounded-full border-2 border-transparent peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-primary dark:peer-checked:ring-offset-gray-900" style={{ backgroundColor: c }} />
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
