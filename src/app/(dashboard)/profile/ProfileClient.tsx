"use client";

import { useState, useRef } from "react";
import { User, Mail, Phone, Shield, Camera, Save, Lock, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/ui/password-input";

interface ProfileClientProps {
  user: any;
}

export function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState({
    name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Utilisateur",
    email: user?.email || "",
    phone: user?.user_metadata?.phone || "+225 00 00 00 00 00", // placeholder si pas de téléphone
    role: user?.user_metadata?.role || "Utilisateur",
    bio: user?.user_metadata?.bio || "Aucune biographie renseignée.",
    avatarUrl: user?.user_metadata?.avatar_url || ""
  });

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Met à jour les métadonnées de l'utilisateur dans Supabase Auth
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: profile.name,
          phone: profile.phone,
          bio: profile.bio
        }
      });

      if (error) {
        throw error;
      }

      toast.success("Profil mis à jour avec succès !");
      setIsEditing(false);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de la mise à jour du profil.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setIsUpdatingPassword(true);
    const toastId = toast.loading("Vérification du mot de passe actuel...");

    try {
      // 1. Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error("Le mot de passe actuel est incorrect.");
      }

      toast.loading("Mise à jour du mot de passe...", { id: toastId });

      // 2. Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      toast.success("Mot de passe modifié avec succès !", { id: toastId });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de la modification du mot de passe.", { id: toastId });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading("Téléchargement de l'image...");

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setProfile({ ...profile, avatarUrl: publicUrl });
      toast.success("Photo de profil mise à jour !", { id: toastId });
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors du téléchargement.", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 gap-6 md:gap-0">
        <div className="text-center md:text-left w-full">

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mon Profil</h1>
          <p className="text-gray-500 mt-2">Gérez vos informations personnelles et préférences de compte.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-dark-surface shadow-md overflow-hidden bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto text-primary font-bold text-4xl">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0).toUpperCase()
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-2 right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-dark transition-colors active:scale-95 disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
            <p className="text-sm text-gray-500 mb-4">{profile.role}</p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Compte Actif
            </span>
          </div>

          <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Coordonnées</h3>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="truncate">{profile.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{profile.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <Shield className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Niveau d'accès : {profile.role}</span>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-gray-500" />
                Informations Personnelles
              </h3>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  Modifier le profil
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom complet</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    disabled={!isEditing || isSaving}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-xl px-4 py-3 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rôle</label>
                  <input 
                    type="text" 
                    value={profile.role}
                    disabled
                    className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-xl px-4 py-3 outline-none border border-transparent transition-colors opacity-60 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Seul un super-administrateur peut modifier votre rôle.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse Email</label>
                  <input 
                    type="email" 
                    value={profile.email}
                    disabled
                    className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-xl px-4 py-3 outline-none border border-transparent transition-colors opacity-60 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">L'adresse email ne peut pas être modifiée ici.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Numéro de téléphone</label>
                  <input 
                    type="tel" 
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    disabled={!isEditing || isSaving}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-xl px-4 py-3 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Biographie / Notes</label>
                <textarea 
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  disabled={!isEditing || isSaving}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-xl px-4 py-3 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                ></textarea>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset changes
                      setProfile({
                        name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Utilisateur",
                        email: user?.email || "",
                        phone: user?.user_metadata?.phone || "+225 00 00 00 00 00",
                        role: user?.user_metadata?.role || "Utilisateur",
                        bio: user?.user_metadata?.bio || "Aucune biographie renseignée.",
                        avatarUrl: user?.user_metadata?.avatar_url || ""
                      });
                    }}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-all active:scale-95 shadow-sm shadow-primary/30 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mt-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-gray-500" />
                Sécurité & Mot de passe
              </h3>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe actuel</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <PasswordInput 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isUpdatingPassword}
                    required
                    placeholder="••••••••"
                    className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-xl pl-10 py-3 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nouveau mot de passe</label>
                  <PasswordInput 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isUpdatingPassword}
                    required
                    minLength={6}
                    placeholder="Nouveau mot de passe"
                    className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-xl px-4 py-3 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmer le nouveau</label>
                  <PasswordInput 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isUpdatingPassword}
                    required
                    minLength={6}
                    placeholder="Confirmer le mot de passe"
                    className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-xl px-4 py-3 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                <button 
                  type="submit"
                  disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg text-sm font-medium transition-all active:scale-95 shadow-sm disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  {isUpdatingPassword ? "Mise à jour..." : "Modifier le mot de passe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
