"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import toast from "react-hot-toast";
import { deleteProduct, updateProduct } from "./actions";
import { exportToCSV, exportToPDF } from "@/lib/utils/export";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  sellPrice: number;
  unit: string;
  stock: number;
  minStock: number;
  status: string;
  sku: string;
  image_url?: string | null;
}

export default function ProductsClient({ initialProducts, categoriesList, userRole }: { initialProducts: Product[], categoriesList: {id: string, name: string}[], userRole?: string }) {
  const canEdit = userRole === 'Administrateur' || userRole === 'Gestionnaire';

  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [productToView, setProductToView] = useState<Product | null>(null);

  const filteredProducts = initialProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesStatus = selectedStatus ? product.status === selectedStatus : true;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const confirmDelete = (id: string) => {
    setProductToDelete(id);
    setDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (productToDelete) {
      startTransition(async () => {
        const res = await deleteProduct(productToDelete);
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success("Produit supprimé avec succès !");
          setDeleteModalOpen(false);
          setProductToDelete(null);
        }
      });
    }
  };

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any>(null);

  const handleEdit = (product: any) => {
    setProductToEdit(product);
    setEditModalOpen(true);
  };

  const executeEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productToEdit?.name?.trim()) {
      toast.error("Le nom du produit est requis");
      return;
    }
    
    startTransition(async () => {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const res = await updateProduct(productToEdit.id, formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Produit modifié avec succès !");
        setEditModalOpen(false);
        setProductToEdit(null);
      }
    });
  };

  const openViewModal = (product: Product) => {
    setProductToView(product);
    setViewModalOpen(true);
  };

  return (
    <div className="w-full space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 gap-6 md:gap-0">
        <div className="text-center md:text-left w-full">

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Catalogue des Produits</h1>
          <p className="text-gray-500 mt-2">Gérez l'ensemble de vos articles et leurs niveaux de stock.</p>
        </div>
        {canEdit && (
          <div className="flex gap-2 justify-center md:justify-end w-full md:w-auto flex-wrap">
            <button 
              onClick={() => {
                const csvData = filteredProducts.map(p => ({
                  'Produit': p.name,
                  'SKU': p.sku,
                  'Catégorie': p.category,
                  'Prix Achat': p.price,
                  'Prix Vente': p.sellPrice,
                  'Stock': p.stock,
                  'Statut': p.status
                }));
                exportToCSV('produits.csv', csvData);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium transition-all"
            >
              CSV
            </button>
            <button 
              onClick={() => {
                const headers = ['Produit', 'SKU', 'Catégorie', 'Stock', 'Prix Vente'];
                const pdfData = filteredProducts.map(p => [
                  p.name, p.sku, p.category, p.stock.toString(), p.sellPrice?.toString() + ' XAF'
                ]);
                exportToPDF('produits.pdf', 'Liste des Produits', headers, pdfData);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium transition-all"
            >
              PDF
            </button>
            <Link 
              href="/products/new"
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-all active:scale-95 shadow-sm shadow-primary/30 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Nouveau
            </Link>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher un produit (Nom, SKU)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <select 
            className="bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors cursor-pointer appearance-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Toutes les catégories</option>
            {categoriesList.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-gray-50 dark:bg-gray-800 text-sm rounded-xl px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors flex-1 md:flex-none appearance-none"
          >
            <option value="">Tous les statuts</option>
            <option value="in_stock">🟢 En Stock</option>
            <option value="low_stock">🟡 Stock Faible</option>
            <option value="out_of_stock">🔴 Rupture</option>
          </select>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Produit</th>
                <th className="px-6 py-4 font-medium">Catégorie</th>
                <th className="px-6 py-4 font-medium text-right">Prix Achat</th>
                <th className="px-6 py-4 font-medium text-right">Prix Vente</th>
                <th className="px-6 py-4 font-medium text-center">Stock</th>
                <th className="px-6 py-4 font-medium text-center">Statut</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-gray-400 font-medium text-xs">IMG</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-right font-medium">
                    {product.price?.toLocaleString('fr-FR') ?? 0} XAF
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-right font-medium">
                    {product.sellPrice?.toLocaleString('fr-FR') ?? 0} XAF
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className="font-medium text-gray-900 dark:text-white">{product.stock}</span>
                    <span className="text-gray-500 ml-1">{product.stock > 1 ? `${product.unit}s` : product.unit}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {product.status === "in_stock" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Disponible
                      </span>
                    )}
                    {product.status === "low_stock" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Faible
                      </span>
                    )}
                    {product.status === "out_of_stock" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Rupture
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openViewModal(product)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      {canEdit && (
                        <>
                          <button onClick={() => handleEdit(product)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => confirmDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-500/10">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Aucun produit trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500">
          <div>Affichage de 1 à {filteredProducts.length} sur {initialProducts.length} produits</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">Précédent</button>
            <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">Suivant</button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-gray-500 mb-6">
                Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={executeDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-red-600/30"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewModalOpen && productToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Détails du Produit</h3>
              <button 
                onClick={() => setViewModalOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center shrink-0">
                  {productToView.image_url ? (
                    <img src={productToView.image_url} alt={productToView.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-gray-400 font-medium text-sm">IMG</span>
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">{productToView.name}</h4>
                  <p className="text-sm text-gray-500">SKU: {productToView.sku}</p>
                  <span className="inline-block mt-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium">
                    {productToView.category}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Stock Actuel</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{productToView.stock} {productToView.unit}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Prix de Vente</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{productToView.sellPrice?.toLocaleString('fr-FR') ?? 0} XAF</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && productToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-primary" />
                Modifier le produit
              </h3>
              <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form id="edit-product-form" onSubmit={executeEdit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du produit *</label>
                    <input 
                      type="text" 
                      name="name"
                      value={productToEdit.name}
                      onChange={(e) => setProductToEdit({...productToEdit, name: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU *</label>
                    <input 
                      type="text" 
                      name="sku"
                      value={productToEdit.sku}
                      onChange={(e) => setProductToEdit({...productToEdit, sku: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie *</label>
                    <select 
                      name="category_id"
                      value={categoriesList.find(c => c.name === productToEdit.category)?.id || ""}
                      onChange={(e) => setProductToEdit({...productToEdit, category: categoriesList.find(c => c.id === e.target.value)?.name})}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors appearance-none"
                    >
                      {categoriesList.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unité</label>
                    <input 
                      type="text" 
                      value={productToEdit.unit}
                      onChange={(e) => setProductToEdit({...productToEdit, unit: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix d'achat (XAF)</label>
                    <input 
                      type="number" 
                      name="cost_price"
                      value={productToEdit.price}
                      onChange={(e) => setProductToEdit({...productToEdit, price: parseInt(e.target.value) || 0})}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix de vente (XAF)</label>
                    <input 
                      type="number" 
                      name="price"
                      value={productToEdit.sellPrice}
                      onChange={(e) => setProductToEdit({...productToEdit, sellPrice: parseInt(e.target.value) || 0})}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors" 
                    />
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => {
                  setEditModalOpen(false);
                  setProductToEdit(null);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                Annuler
              </button>
              <button 
                type="submit"
                form="edit-product-form"
                className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30"
              >
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
