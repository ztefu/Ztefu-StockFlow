"use client";

import { useState, useTransition, useEffect } from "react";
import { Edit, Trash2, FolderOpen, Search, AlertTriangle, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { createCategory, updateCategory, deleteCategory } from "./actions";

interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
}

export default function CategoriesClient({ initialCategories, userRole }: { initialCategories: Category[], userRole?: string }) {
  const canEdit = userRole === 'Administrateur' || userRole === 'Gestionnaire';
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();
  
  const [globalSuggestions, setGlobalSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Form state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (newCategoryName.length >= 2 && showSuggestions) {
        const { data } = await supabase
          .from('categories')
          .select('*')
          .is('company_id', null)
          .ilike('name', `%${newCategoryName}%`)
          .limit(5);
        setGlobalSuggestions(data || []);
      } else {
        setGlobalSuggestions([]);
      }
    };
    const timeout = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeout);
  }, [newCategoryName, showSuggestions]);

  const selectSuggestion = (suggestion: any) => {
    setNewCategoryName(suggestion.name);
    setNewCategoryDesc(suggestion.description || '');
    setShowSuggestions(false);
  };
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const filteredCategories = initialCategories.filter(category => {
    const matchesName = category.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDesc = category.description ? category.description.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    return matchesName || matchesDesc;
  });

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error("Le nom de la catégorie est requis");
      return;
    }

    const formData = new FormData();
    formData.append('name', newCategoryName);
    formData.append('description', newCategoryDesc);

    startTransition(async () => {
      const res = await createCategory(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Catégorie créée avec succès !");
        setNewCategoryName("");
        setNewCategoryDesc("");
      }
    });
  };

  const confirmDelete = (id: string) => {
    setCategoryToDelete(id);
    setDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (categoryToDelete) {
      startTransition(async () => {
        const res = await deleteCategory(categoryToDelete);
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success("Catégorie supprimée avec succès !");
          setDeleteModalOpen(false);
          setCategoryToDelete(null);
        }
      });
    }
  };

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<any>(null);

  const handleEdit = (category: any) => {
    setCategoryToEdit(category);
    setEditModalOpen(true);
  };

  const executeEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryToEdit?.name?.trim()) {
      toast.error("Le nom de la catégorie est requis");
      return;
    }
    
    const formData = new FormData();
    formData.append('name', categoryToEdit.name);
    formData.append('description', categoryToEdit.description || '');

    startTransition(async () => {
      const res = await updateCategory(categoryToEdit.id, formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Catégorie modifiée avec succès !");
        setEditModalOpen(false);
        setCategoryToEdit(null);
      }
    });
  };

  return (
    <div className="w-full space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 gap-6 md:gap-0">
        <div className="text-center md:text-left w-full">

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Catégories</h1>
          <p className="text-gray-500 mt-2">Organisez vos produits pour faciliter la recherche et l'analyse.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire d'ajout */}
        {canEdit && (
          <div className="lg:col-span-1">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-200">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Nouvelle Catégorie</h3>
            <form className="space-y-4" onSubmit={handleAddCategory}>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de la catégorie *</label>
                <input 
                  type="text" 
                  value={newCategoryName}
                  onChange={(e) => {
                    setNewCategoryName(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Ex: Électronique" 
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors" 
                />
                
                {showSuggestions && globalSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 dark:bg-gray-900/50">Suggestions du catalogue global</div>
                    <ul className="max-h-48 overflow-y-auto">
                      {globalSuggestions.map(suggestion => (
                        <li 
                          key={suggestion.id} 
                          className="px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center transition-colors"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectSuggestion(suggestion);
                          }}
                        >
                          <span className="font-medium text-gray-900 dark:text-white">{suggestion.name}</span>
                          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">Cloner</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea 
                  rows={4} 
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  placeholder="Courte description..." 
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors resize-none"
                ></textarea>
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-all active:scale-95 shadow-sm shadow-primary/30 mt-4">
                <Plus className="w-4 h-4" />
                Créer la catégorie
              </button>
            </form>
          </div>
          </div>
        )}

        {/* Liste des catégories */}
        <div className={canEdit ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all duration-200">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-gray-500" />
                Toutes les catégories
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
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Nom de la Catégorie</th>
                    <th className="px-6 py-4 font-medium">Description</th>
                    <th className="px-6 py-4 font-medium text-center">Produits</th>
                    {canEdit && <th className="px-6 py-4 font-medium text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                        {category.description}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                          {category.productCount}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEdit(category)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Modifier">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => confirmDelete(category.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Supprimer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredCategories.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-sm">
                Aucune catégorie trouvée.
              </div>
            )}
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
                Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.
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

      {/* Edit Modal */}
      {editModalOpen && categoryToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-primary" />
                Modifier la catégorie
              </h3>
            </div>
            <form onSubmit={executeEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de la catégorie *</label>
                <input 
                  type="text" 
                  value={categoryToEdit.name}
                  onChange={(e) => setCategoryToEdit({...categoryToEdit, name: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea 
                  rows={4} 
                  value={categoryToEdit.description}
                  onChange={(e) => setCategoryToEdit({...categoryToEdit, description: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors resize-none"
                ></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setCategoryToEdit(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
