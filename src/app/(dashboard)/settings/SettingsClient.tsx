"use client";

import { useState } from "react";
import { Save, Upload, MapPin, Building, Mail, Phone, Globe, Clock, Banknote, Settings } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Settings {
  id: string;
  company_name: string;
  registration_number: string | null;
  contact_email: string | null;
  phone: string | null;
  address: string | null;
  currency: string;
  language: string;
  timezone: string;
  logo_url?: string | null;
}

interface SettingsClientProps {
  initialSettings: Settings | null;
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const supabase = createClient();
  const router = useRouter();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [settings, setSettings] = useState<Settings>(initialSettings || {
    id: "",
    company_name: "Mon Entreprise",
    registration_number: "",
    contact_email: "",
    phone: "",
    address: "Douala, Cameroun",
    currency: "XAF",
    language: "fr",
    timezone: "Africa/Douala",
    logo_url: null
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!settings.id) {
      toast.error("Veuillez d'abord sauvegarder les paramètres par défaut.");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Téléchargement du logo...");

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `logo-${settings.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("logos").getPublicUrl(fileName);
      
      const { error: updateError } = await supabase
        .from('settings')
        .update({ logo_url: data.publicUrl })
        .eq('id', settings.id);

      if (updateError) throw updateError;

      setSettings({ ...settings, logo_url: data.publicUrl });
      toast.success("Logo mis à jour !", { id: toastId });
      router.refresh();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Erreur lors de la mise à jour du logo.", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!settings.id) {
      toast.error("Aucun paramètre global trouvé.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Sauvegarde en cours...");

    try {
      const { error } = await supabase
        .from('settings')
        .update({
          company_name: settings.company_name,
          registration_number: settings.registration_number,
          contact_email: settings.contact_email,
          phone: settings.phone,
          address: settings.address,
          currency: settings.currency,
          language: settings.language,
          timezone: settings.timezone,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast.success("Paramètres sauvegardés avec succès !", { id: toastId });
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error("Erreur lors de la sauvegarde.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 gap-6 md:gap-0">
        <div className="text-center md:text-left w-full">

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Paramètres de l'Entreprise</h1>
          <p className="text-gray-500 mt-2">Configurez les informations globales de votre entreprise et les préférences système.</p>
        </div>
        <div className="flex gap-4 justify-center md:justify-end w-full md:w-auto">
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-all active:scale-95 shadow-sm shadow-primary/30 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Sauvegarde..." : "Enregistrer les modifications"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Identité de l'entreprise */}
        <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <Building className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Identité de l'entreprise</h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 mb-8">
            <div className="flex flex-col items-center gap-4">
              <label className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group relative overflow-hidden">
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors mb-2" />
                    <span className="text-xs font-medium text-gray-500 text-center px-4">Changer le logo</span>
                  </>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/png, image/jpeg" 
                  className="hidden" 
                  onChange={handleLogoUpload}
                  disabled={isUploading}
                />
              </label>
              <p className="text-xs text-gray-400">PNG, JPG (Max. 2MB)</p>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'entreprise *</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={settings.company_name}
                    onChange={(e) => setSettings({...settings, company_name: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg pl-10 pr-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Numéro d'immatriculation / NINEA</label>
                <input 
                  type="text" 
                  placeholder="Optionnel" 
                  value={settings.registration_number || ""}
                  onChange={(e) => setSettings({...settings, registration_number: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors" 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse Email de contact</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="email" 
                  placeholder="contact@entreprise.cm"
                  value={settings.contact_email || ""}
                  onChange={(e) => setSettings({...settings, contact_email: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg pl-10 pr-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone de l'entreprise</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="tel" 
                  placeholder="+237 6XX XX XX XX"
                  value={settings.phone || ""}
                  onChange={(e) => setSettings({...settings, phone: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg pl-10 pr-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors" 
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse postale complète</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea 
                  rows={2} 
                  placeholder="Douala, Cameroun"
                  value={settings.address || ""}
                  onChange={(e) => setSettings({...settings, address: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg pl-10 pr-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors resize-none"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Préférences du Système */}
        <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Préférences du Système</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Devise par défaut</label>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                  value={settings.currency}
                  onChange={(e) => setSettings({...settings, currency: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg pl-10 pr-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors appearance-none"
                >
                  <option value="XOF">Franc CFA (XOF)</option>
                  <option value="XAF">Franc CFA (XAF)</option>
                  <option value="USD">Dollar Américain (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Langue de l'interface</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                  value={settings.language}
                  onChange={(e) => setSettings({...settings, language: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg pl-10 pr-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors appearance-none"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fuseau horaire</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select 
                  value={settings.timezone}
                  onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg pl-10 pr-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors appearance-none"
                >
                  <option value="Africa/Abidjan">Africa/Abidjan (GMT)</option>
                  <option value="Africa/Dakar">Africa/Dakar (GMT)</option>
                  <option value="Africa/Douala">Africa/Douala (GMT+1)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
