"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Shield, Ban, CheckCircle, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { inviteUser, updateUser } from "./actions";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
}

interface UsersClientProps {
  initialUsers: Profile[];
}

export function UsersClient({ initialUsers }: UsersClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [localUsers, setLocalUsers] = useState<Profile[]>(initialUsers);

  // Sync with server data after router.refresh()
  useEffect(() => {
    setLocalUsers(initialUsers);
  }, [initialUsers]);

  const [searchQuery, setSearchQuery] = useState("");
  
  // Form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<Profile | null>(null);

  // Success modal state (for temp password)
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [createdUserAuth, setCreatedUserAuth] = useState<{email: string, password: string} | null>(null);

  const filteredUsers = localUsers.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newRole) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Envoi de l'invitation en cours...");

    try {
      const result = await inviteUser({
        full_name: newName,
        email: newEmail,
        phone: newPhone,
        role: newRole
      });

      toast.success("Utilisateur créé avec succès !", { id: toastId });
      
      setCreatedUserAuth({
        email: newEmail,
        password: result.tempPassword
      });
      setSuccessModalOpen(true);
      
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setNewRole("");
      
      // On rafraichit la page pour récupérer les nouvelles données de la DB
      router.refresh();
      // On force le rechargement window pour que initialUsers soit bien mis à jour si nécessaire
      // ou bien on attend que router.refresh fasse son travail (qui peut prendre un petit délai).
      // Pour éviter le décalage UI, on peut insérer dans localUsers de manière optimiste :
      setLocalUsers([{
        id: "temp-" + Date.now(),
        full_name: newName,
        email: newEmail,
        phone: newPhone || null,
        role: newRole,
        status: "Actif"
      }, ...localUsers]);

    } catch (error: any) {
      console.error("Add user error:", error);
      toast.error(error.message || "Erreur lors de l'invitation.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id: string) => {
    if (id.startsWith("temp-")) {
      toast.error("Veuillez patienter, la création est en cours de finalisation...");
      return;
    }
    setUserToDelete(id);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    
    const toastId = toast.loading("Suppression en cours...");
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete);

      if (error) throw error;

      setLocalUsers(localUsers.filter(u => u.id !== userToDelete));
      toast.success("Utilisateur supprimé avec succès !", { id: toastId });
      setDeleteModalOpen(false);
      setUserToDelete(null);
      router.refresh();
    } catch (error: any) {
      console.error("Delete user error:", error);
      toast.error("Erreur lors de la suppression.", { id: toastId });
    }
  };

  const toggleUserStatus = async (id: string) => {
    if (id.startsWith("temp-")) {
      toast.error("Veuillez patienter, la création est en cours de finalisation...");
      return;
    }
    
    const userToToggle = localUsers.find(u => u.id === id);
    if (!userToToggle) return;

    const newStatus = userToToggle.status === "Actif" ? "Inactif" : "Actif";
    const toastId = toast.loading(`Mise à jour du statut...`);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setLocalUsers(localUsers.map(u => u.id === id ? data : u));
      toast.success(`Le compte a été ${newStatus === "Actif" ? 'activé' : 'désactivé'}.`, { id: toastId });
      router.refresh();
    } catch (error: any) {
      console.error("Toggle status error:", error);
      toast.error("Erreur lors de la mise à jour du statut.", { id: toastId });
    }
  };

  const handleEdit = (user: Profile) => {
    if (user.id.startsWith("temp-")) {
      toast.error("Veuillez patienter, la création est en cours de finalisation...");
      return;
    }
    setUserToEdit(user);
    setEditModalOpen(true);
  };

  const executeEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit?.full_name?.trim() || !userToEdit?.email?.trim() || !userToEdit?.role) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    const toastId = toast.loading("Modification en cours...");

    try {
      const result = await updateUser(userToEdit.id, {
        full_name: userToEdit.full_name,
        email: userToEdit.email,
        phone: userToEdit.phone || null,
        role: userToEdit.role
      });

      setLocalUsers(localUsers.map(u => u.id === userToEdit.id ? result.profile : u));
      toast.success("Profil modifié avec succès !", { id: toastId });
      setEditModalOpen(false);
      setUserToEdit(null);
      router.refresh();
    } catch (error: any) {
      console.error("Edit user error:", error);
      toast.error("Erreur lors de la modification.", { id: toastId });
    }
  };

  return (
    <div className="w-full space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 gap-6 md:gap-0">
        <div className="text-center md:text-left w-full">
          <div className="text-sm text-gray-500 mb-1 font-medium">Menu Principal &gt; Utilisateurs</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Utilisateurs</h1>
          <p className="text-gray-500 mt-2">Gérez les profils et les rôles des membres de votre équipe.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire d'ajout */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-200">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Nouveau Profil</h3>
            <form className="space-y-4" onSubmit={handleAddUser}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom complet *</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Ex: Jean Dupont" 
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors disabled:opacity-50" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse Email *</label>
                <input 
                  type="email" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="jean@stockflow.africa" 
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors disabled:opacity-50" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                <input 
                  type="tel" 
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="+225 00 00 00 00 00" 
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors disabled:opacity-50" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rôle *</label>
                <select 
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors appearance-none disabled:opacity-50"
                >
                  <option value="">Sélectionner un rôle...</option>
                  <option value="Administrateur">Administrateur</option>
                  <option value="Gestionnaire">Gestionnaire</option>
                  <option value="Magasinier">Magasinier</option>
                  <option value="Vendeur">Vendeur</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-all active:scale-95 shadow-sm shadow-primary/30 mt-4 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Inviter l'utilisateur
              </button>
            </form>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all duration-200">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-500" />
                Équipe
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
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">Utilisateur</th>
                    <th className="px-6 py-4 font-medium">Contact</th>
                    <th className="px-6 py-4 font-medium">Rôle</th>
                    <th className="px-6 py-4 font-medium text-center">Statut</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {user.full_name?.charAt(0) || "U"}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{user.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                        <div className="text-xs text-gray-500">{user.phone || "-"}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.role}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.status === "Actif" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                            Inactif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(user)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Modifier">
                            <Edit className="w-4 h-4" />
                          </button>
                          {user.status === "Actif" ? (
                            <button onClick={() => toggleUserStatus(user.id)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors" title="Désactiver">
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button onClick={() => toggleUserStatus(user.id)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors" title="Activer">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => confirmDelete(user.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Supprimer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-sm">
                Aucun utilisateur trouvé.
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
                Êtes-vous sûr de vouloir supprimer ce profil d'utilisateur ?
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
      {editModalOpen && userToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-primary" />
                Modifier le profil
              </h3>
            </div>
            <form onSubmit={executeEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom complet *</label>
                <input 
                  type="text" 
                  value={userToEdit.full_name}
                  onChange={(e) => setUserToEdit({...userToEdit, full_name: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse Email *</label>
                <input 
                  type="email" 
                  value={userToEdit.email}
                  onChange={(e) => setUserToEdit({...userToEdit, email: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                <input 
                  type="tel" 
                  value={userToEdit.phone || ""}
                  onChange={(e) => setUserToEdit({...userToEdit, phone: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rôle *</label>
                <select 
                  value={userToEdit.role}
                  onChange={(e) => setUserToEdit({...userToEdit, role: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors appearance-none"
                >
                  <option value="Administrateur">Administrateur</option>
                  <option value="Gestionnaire">Gestionnaire</option>
                  <option value="Magasinier">Magasinier</option>
                  <option value="Vendeur">Vendeur</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setUserToEdit(null);
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

      {/* Success Modal (Temp Password) */}
      {successModalOpen && createdUserAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center border-b border-gray-100 dark:border-gray-800">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Utilisateur créé avec succès !</h3>
              <p className="text-sm text-gray-500">
                Veuillez transmettre ces informations de connexion à l'utilisateur. Il devra changer son mot de passe à la première connexion.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 mb-1">Email</div>
                <div className="font-medium text-gray-900 dark:text-white mb-3">{createdUserAuth.email}</div>
                
                <div className="text-xs text-gray-500 mb-1">Mot de passe temporaire</div>
                <div className="font-mono text-lg font-bold text-primary tracking-wider">{createdUserAuth.password}</div>
              </div>
              <button 
                onClick={() => {
                  setSuccessModalOpen(false);
                  setCreatedUserAuth(null);
                }}
                className="w-full px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30"
              >
                J'ai noté le mot de passe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
