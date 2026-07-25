"use client";

import { useState, useEffect, useMemo } from "react";
import { Save, Upload, MapPin, Building, Mail, Phone, Globe, Clock, Banknote, Settings, CreditCard, ShieldCheck, CheckCircle, LockKeyhole, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

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
  subscription_plan?: string;
  subscription_status?: string;
  usage?: {
    users: number;
    products: number;
    categories: number;
    movements: number;
  };
  subscription_end_date?: string | null;
  billing_cycle?: string | null;
  is_super_admin?: boolean;
}

interface SettingsClientProps {
  initialSettings: Settings | null;
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnnualBilling, setIsAnnualBilling] = useState(false);
  const [settings, setSettings] = useState<Settings>(initialSettings || {
    id: "",
    company_name: "Mon Entreprise",
    registration_number: "",
    contact_email: "",
    phone: "",
    address: "",
    currency: "XOF",
    language: "fr",
    timezone: "Africa/Douala",
  });

  const canRenew = useMemo(() => {
    if (settings.subscription_status === 'Expiré') return true;
    if (settings.subscription_end_date && settings.subscription_status === 'Actif') {
      const expirationDate = new Date(settings.subscription_end_date);
      const today = new Date();
      const diffTime = expirationDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 14;
    }
    return false;
  }, [settings.subscription_end_date, settings.subscription_status]);

  useEffect(() => {
    // Vérification de l'approche de la date d'expiration
    if (settings.subscription_end_date && settings.subscription_status === 'Actif' && !settings.is_super_admin) {
      const expirationDate = new Date(settings.subscription_end_date);
      const today = new Date();
      const diffTime = expirationDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Si c'est un abonnement mensuel et expiré dans <= 5 jours
      // Si c'est un abonnement annuel et expiré dans <= 14 jours
      const isMonthlyWarning = settings.billing_cycle !== 'annual' && diffDays <= 5 && diffDays > 0;
      const isAnnualWarning = settings.billing_cycle === 'annual' && diffDays <= 14 && diffDays > 0;

      if (isMonthlyWarning || isAnnualWarning) {
        toast('Attention : Votre abonnement expire dans ' + diffDays + ' jour(s). Pensez à le renouveler pour éviter toute interruption.', {
          icon: '⚠️',
          duration: 10000,
          style: {
            background: '#FFF3CD',
            color: '#856404',
            border: '1px solid #FFEEBA',
          },
        });
      }
    }
  }, [settings.subscription_end_date, settings.subscription_status, settings.billing_cycle, settings.is_super_admin]);

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const plan = searchParams.get('plan');
    const cycle = searchParams.get('cycle');

    if (cycle === 'annual') {
      setIsAnnualBilling(true);
    } else if (cycle === 'monthly') {
      setIsAnnualBilling(false);
    }

    if (paymentStatus === 'success') {
      toast.success(`Félicitations ! Vous êtes maintenant sur le plan ${plan}.`);
      router.replace('/settings'); // Nettoyer l'URL
      router.refresh(); // Recharger les données
    } else if (paymentStatus === 'failed') {
      toast.error('Le paiement a été annulé ou a échoué.');
      router.replace('/settings');
    } else if (paymentStatus === 'error') {
      toast.error('Une erreur est survenue lors de la validation du paiement.');
      router.replace('/settings');
    }
  }, [searchParams, router]);

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

  const handleUpgrade = async (plan: string, price: number, cycle: 'monthly' | 'annual' = 'monthly') => {
    // Redirection vers la page de checkout intermédiaire
    const searchParams = new URLSearchParams({
      plan,
      price: price.toString(),
      cycle
    });
    router.push(`/checkout?${searchParams.toString()}`);
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

        {/* Abonnement et Facturation - Masqué pour le Super Admin */}
        {!settings.is_super_admin && (
        <div id="billing" className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 scroll-mt-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600 dark:text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Abonnement & Facturation</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 mb-2">Plan actuel</p>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {settings.subscription_plan || 'Gratuit'}
                  {settings.subscription_plan !== 'Gratuit' && (
                    <span className="text-sm text-gray-500 font-normal ml-2">
                      ({settings.billing_cycle === 'annual' ? 'Annuel' : 'Mensuel'})
                    </span>
                  )}
                </span>
                {settings.subscription_status === 'Actif' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
                    <ShieldCheck className="w-3 h-3" />
                    Actif
                  </span>
                )}
                {settings.subscription_status === 'Expiré' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 animate-pulse">
                    <CheckCircle className="w-3 h-3" />
                    Expiré
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {settings.subscription_plan === 'Gratuit' 
                  ? 'Limité à 50 produits et 1 utilisateur. Passez à la vitesse supérieure.'
                  : settings.subscription_plan === 'Pro' 
                    ? 'Vous bénéficiez de fonctionnalités premium avec des limites généreuses.'
                    : 'Vous bénéficiez de toutes les fonctionnalités premium en illimité.'}
              </p>

              {settings.subscription_plan !== 'Gratuit' && (
                <div className={`mb-6 p-3 rounded-lg border ${settings.subscription_status === 'Expiré' ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Date d'expiration</p>
                  <p className={`font-medium ${settings.subscription_status === 'Expiré' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                    {settings.subscription_end_date ? (
                      <>
                        {new Date(settings.subscription_end_date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        {settings.billing_cycle === 'annual' ? ' (Cycle Annuel)' : ' (Cycle Mensuel)'}
                      </>
                    ) : (
                      'Non définie (Compte existant)'
                    )}
                  </p>
                </div>
              )}

              {/* Statistiques d'utilisation (uniquement pour Gratuit et Pro) */}
              {/* Statistiques d'utilisation et Limites */}
              {settings.usage && (
                <div className="space-y-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Consommation & Limites</h4>
                  
                  {/* Produits */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-700 dark:text-gray-300">Produits</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {settings.subscription_plan === 'Business' 
                          ? 'Illimité' 
                          : `${settings.usage.products} / ${settings.subscription_plan === 'Gratuit' ? 50 : 2000}`}
                      </span>
                    </div>
                    {settings.subscription_plan !== 'Business' && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (settings.usage.products / (settings.subscription_plan === 'Gratuit' ? 50 : 2000)) > 0.8 
                              ? 'bg-red-500' 
                              : 'bg-primary'
                          }`}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Catégories */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-700 dark:text-gray-300">Catégories</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {settings.subscription_plan === 'Gratuit' 
                          ? `${settings.usage.categories || 0} / 5`
                          : 'Illimité'}
                      </span>
                    </div>
                    {settings.subscription_plan === 'Gratuit' && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            ((settings.usage.categories || 0) / 5) > 0.8 
                              ? 'bg-red-500' 
                              : 'bg-primary'
                          }`}
                          style={{ width: `${Math.min(100, ((settings.usage.categories || 0) / 5) * 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Mouvements de stock / mois */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-700 dark:text-gray-300">Mouvements / mois</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {settings.subscription_plan === 'Gratuit' 
                          ? `${settings.usage.movements || 0} / 200`
                          : 'Illimité'}
                      </span>
                    </div>
                    {settings.subscription_plan === 'Gratuit' && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            ((settings.usage.movements || 0) / 200) > 0.8 
                              ? 'bg-red-500' 
                              : 'bg-primary'
                          }`}
                          style={{ width: `${Math.min(100, ((settings.usage.movements || 0) / 200) * 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Utilisateurs */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-700 dark:text-gray-300">Utilisateurs</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {settings.subscription_plan === 'Business' 
                          ? 'Illimité' 
                          : `${settings.usage.users} / ${settings.subscription_plan === 'Gratuit' ? 1 : 5}`}
                      </span>
                    </div>
                    {settings.subscription_plan !== 'Business' && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (settings.usage.users / (settings.subscription_plan === 'Gratuit' ? 1 : 5)) >= 1 
                              ? 'bg-red-500' 
                              : 'bg-primary'
                          }`}
                          style={{ width: `${Math.min(100, (settings.usage.users / (settings.subscription_plan === 'Gratuit' ? 1 : 5)) * 100)}%` }}
                        ></div>
                      </div>
                    )}
                    {(settings.subscription_plan === 'Gratuit' && settings.usage.users >= 1) && (
                      <p className="text-xs text-red-500 mt-2">Limite atteinte. Passez au plan Pro pour ajouter votre équipe.</p>
                    )}
                    {(settings.subscription_plan === 'Pro' && settings.usage.users >= 5) && (
                      <p className="text-xs text-red-500 mt-2">Limite atteinte. Passez au plan Business.</p>
                    )}
                  </div>

                  {/* Fonctionnalités Additionnelles */}
                  <div className="space-y-3 pt-2">
                    {/* Alertes SMS & Email */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700 dark:text-gray-300">Alertes SMS & Email</span>
                      {settings.subscription_plan === 'Gratuit' ? (
                        <span className="text-gray-400 dark:text-gray-500 flex items-center gap-1.5 text-xs font-medium"><LockKeyhole className="w-3.5 h-3.5" /> Débloqué en Pro</span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1.5 text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Inclus</span>
                      )}
                    </div>
                    
                    {/* Support prioritaire */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700 dark:text-gray-300">Support prioritaire</span>
                      {settings.subscription_plan === 'Gratuit' ? (
                        <span className="text-gray-400 dark:text-gray-500 flex items-center gap-1.5 text-xs font-medium"><LockKeyhole className="w-3.5 h-3.5" /> Débloqué en Pro</span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1.5 text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Inclus</span>
                      )}
                    </div>

                    {/* Multi-boutiques */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700 dark:text-gray-300">Multi-boutiques</span>
                      {settings.subscription_plan !== 'Business' ? (
                        <span className="text-gray-400 dark:text-gray-500 flex items-center gap-1.5 text-xs font-medium"><LockKeyhole className="w-3.5 h-3.5" /> Débloqué en Business</span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1.5 text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Inclus</span>
                      )}
                    </div>

                    {/* Accompagnement dédié */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700 dark:text-gray-300">Accompagnement dédié</span>
                      {settings.subscription_plan !== 'Business' ? (
                        <span className="text-gray-400 dark:text-gray-500 flex items-center gap-1.5 text-xs font-medium"><LockKeyhole className="w-3.5 h-3.5" /> Débloqué en Business</span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1.5 text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Inclus</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 flex flex-col">
              {/* Toggle Mensuel/Annuel pour la mise à niveau */}
              <div className="flex items-center justify-end gap-3 mb-6">
                <span className={`text-sm font-medium ${!isAnnualBilling ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>Mensuel</span>
                <button 
                  onClick={() => setIsAnnualBilling(!isAnnualBilling)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAnnualBilling ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isAnnualBilling ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>Annuel</span>
                  <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">-20%</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
              {/* Pro Plan */}
              <div className={`border rounded-xl p-5 hover:border-primary transition-colors flex flex-col ${settings.subscription_plan === 'Pro' ? 'border-primary ring-1 ring-primary/30 bg-primary/5 dark:bg-primary/10' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Plan Pro</h4>
                    <p className="text-sm text-gray-500">Jusqu'à 2000 produits</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-2">
                      <span className="text-sm text-gray-400 line-through">9 900</span>
                      <span className="text-lg font-bold text-primary">{isAnnualBilling ? '4 000' : '5 000'} XAF<span className="text-xs text-gray-500">/mois</span></span>
                    </div>
                    {isAnnualBilling && <div className="text-xs text-gray-500 mt-1">Facturé 48 000 XAF/an</div>}
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span><strong>2 000</strong> produits stockés</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Jusqu'à <strong>5</strong> utilisateurs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Catégories <strong>illimitées</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Mouvements / mois <strong>illimités</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Alertes par SMS & Email</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Support prioritaire</span>
                  </li>
                </ul>

                <button 
                  onClick={() => handleUpgrade('Pro', isAnnualBilling ? 48000 : 5000, isAnnualBilling ? 'annual' : 'monthly')}
                  disabled={(settings.subscription_plan === 'Pro' && !canRenew) || settings.subscription_plan === 'Business'}
                  className="mt-auto w-full py-2 bg-primary hover:bg-primary-dark disabled:bg-gray-200 disabled:text-gray-500 disabled:dark:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {settings.subscription_plan === 'Pro' 
                    ? (canRenew ? 'Renouveler' : 'Plan Actuel') 
                    : 'Souscrire'}
                </button>
              </div>

              {/* Business Plan */}
              <div className={`border rounded-xl p-5 hover:border-primary transition-colors flex flex-col ${settings.subscription_plan === 'Business' ? 'border-primary ring-1 ring-primary/30 bg-primary/5 dark:bg-primary/10' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Plan Business</h4>
                    <p className="text-sm text-gray-500 text-primary font-medium">L'illimité absolu</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-2">
                      <span className="text-sm text-gray-400 line-through">19 900</span>
                      <span className="text-lg font-bold text-primary">{isAnnualBilling ? '12 000' : '15 000'} XAF<span className="text-xs text-gray-500">/mois</span></span>
                    </div>
                    {isAnnualBilling && <div className="text-xs text-gray-500 mt-1">Facturé 144 000 XAF/an</div>}
                  </div>
                </div>

                <ul className="space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Produits <strong>illimités</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Utilisateurs <strong>illimités</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Catégories <strong>illimitées</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Mouvements / mois <strong>illimités</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Alertes par SMS & Email</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Support prioritaire</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Multi-boutiques</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Accompagnement dédié</span>
                  </li>
                </ul>

                <button 
                  onClick={() => handleUpgrade('Business', isAnnualBilling ? 144000 : 15000, isAnnualBilling ? 'annual' : 'monthly')}
                  disabled={settings.subscription_plan === 'Business' && !canRenew}
                  className="mt-auto w-full py-2 bg-primary hover:bg-primary-dark disabled:bg-gray-200 disabled:text-gray-500 disabled:dark:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {settings.subscription_plan === 'Business' 
                    ? (canRenew ? 'Renouveler' : 'Plan Actuel') 
                    : 'Souscrire'}
                </button>
              </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
