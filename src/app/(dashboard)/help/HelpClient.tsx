"use client";

import { useState } from "react";
import { HelpCircle, Mail, Phone, ExternalLink, ChevronDown, ChevronUp, FileText, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { useSubscription } from "@/providers/SubscriptionProvider";
import { Lock } from "lucide-react";

const faqs = [
  {
    question: "Comment ajouter un nouveau produit au catalogue ?",
    answer: "Pour ajouter un produit, rendez-vous dans le menu 'Produits', puis cliquez sur le bouton 'Ajouter un produit' en haut à droite. Remplissez ensuite le formulaire avec les détails du produit et validez."
  },
  {
    question: "Comment corriger une erreur de stock ?",
    answer: "Si vous constatez une erreur d'inventaire, vous pouvez faire un mouvement manuel en utilisant l'option 'Nouveau Mouvement' depuis le Tableau de bord, puis sélectionner le motif approprié (ex: Ajustement d'inventaire)."
  },
  {
    question: "Puis-je avoir plusieurs utilisateurs avec des accès différents ?",
    answer: "Oui, depuis la page 'Administration > Utilisateurs', vous pouvez créer autant de comptes que vous le souhaitez et leur assigner des rôles précis (Administrateur, Gestionnaire, Magasinier, Vendeur)."
  },
  {
    question: "Les données sont-elles sauvegardées en temps réel ?",
    answer: "Absolument. Toutes vos modifications sont sauvegardées instantanément de manière sécurisée dans le cloud, vous permettant d'avoir toujours accès à un inventaire à jour."
  },
];

interface HelpClientProps {
  userEmail: string;
  userRole: string;
  companyId: string;
  initialTickets?: any[];
}

export function HelpClient({ userEmail, userRole, companyId, initialTickets = [] }: HelpClientProps) {
  const supabase = createClient();
  const { plan } = useSubscription();
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@stockflow-af.com';
  const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+237 000 00 00 00';
  const supportPhoneLink = supportPhone.replace(/\s+/g, '');
  const [tickets, setTickets] = useState(initialTickets);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleMarkAsRead = async (id: string) => {
    const toastId = toast.loading("Mise à jour...");
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'Fermé' })
        .eq('id', id);
      if (error) throw error;
      setTickets(tickets.map(t => t.id === id ? { ...t, status: 'Fermé' } : t));
      toast.success("Marqué comme lu", { id: toastId });
    } catch (err) {
      toast.error("Erreur lors de la mise à jour", { id: toastId });
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Veuillez remplir tous les champs du formulaire.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Envoi du message en cours...");

    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert([{
          user_email: userEmail,
          subject: subject.trim(),
          message: message.trim(),
          status: 'Ouvert',
          company_id: companyId
        }]);

      if (error) throw error;

      const newTicket = {
        id: "temp-" + Date.now(),
        user_email: userEmail,
        subject: subject.trim(),
        message: message.trim(),
        status: 'Ouvert',
        created_at: new Date().toISOString(),
        admin_reply: null
      };

      setTickets([newTicket, ...tickets]);
      toast.success("Votre message a bien été envoyé. Notre équipe vous répondra sous 24h.", { id: toastId });
      setSubject("");
      setMessage("");
    } catch (error: any) {
      console.error("Support ticket error:", error);
      toast.error("Erreur lors de l'envoi du message.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 gap-6 md:gap-0">
        <div className="text-center md:text-left w-full">

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Centre d'Assistance</h1>
          <p className="text-gray-500 mt-2">Trouvez des réponses à vos questions ou contactez notre équipe technique.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          {/* FAQ Section */}
          <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary" />
              Questions Fréquentes
            </h3>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`border rounded-xl transition-all duration-200 overflow-hidden ${openFaq === index ? 'border-primary shadow-sm bg-gray-50 dark:bg-gray-800/50' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'}`}
                >
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-900 dark:text-white focus:outline-none"
                  >
                    <span>{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-primary shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                    )}
                  </button>
                  {openFaq === index && (
                     <div className="p-4 pt-0 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-transparent">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => toast.success("Ouverture de la documentation dans un nouvel onglet...")} className="flex items-center text-left gap-4 p-6 bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Documentation Complète</h4>
                <p className="text-xs text-gray-500 mt-1">Lisez notre guide d'utilisation pas-à-pas.</p>
              </div>
            </button>
            <button onClick={() => toast.success("Redirection vers le forum communautaire...")} className="flex items-center text-left gap-4 p-6 bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
                <MessageCircle className="w-6 h-6 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Forum de la Communauté</h4>
                <p className="text-xs text-gray-500 mt-1">Échangez avec d'autres utilisateurs.</p>
              </div>
            </button>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Contact Support or Internal Message */}
          {userRole === "Administrateur" ? (
            <>
              <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Contacter le Support</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Besoin d'aide ? Envoyez-nous un message et créez un ticket d'assistance.
                </p>

                <form className="space-y-4" onSubmit={handleContactSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sujet *</label>
                    <input 
                      type="text" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="Ex: Problème d'export CSV" 
                      className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors disabled:opacity-50" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message *</label>
                    <textarea 
                      rows={4} 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="Détaillez votre problème ici..." 
                      className="w-full bg-gray-50 dark:bg-gray-800 text-sm rounded-lg px-4 py-2.5 outline-none border border-transparent focus:border-primary focus:bg-white transition-colors resize-none disabled:opacity-50"
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-all active:scale-95 shadow-sm shadow-primary/30 mt-2 disabled:opacity-50"
                  >
                    {isSubmitting ? "Envoi..." : "Envoyer le message"}
                  </button>
                </form>
              </div>

              {/* Tickets History */}
              {tickets.length > 0 && (
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Vos demandes</h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {tickets.map(ticket => (
                      <div key={ticket.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{ticket.subject}</h4>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            ticket.status === 'Ouvert' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{ticket.message}</p>
                        
                        {ticket.admin_reply && (
                          <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                            <div className="text-xs font-semibold text-primary mb-1">Réponse de Ztefu :</div>
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                              {ticket.admin_reply}
                            </p>
                          </div>
                        )}
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-[10px] text-gray-400">
                            Le {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                          </div>
                          {ticket.status === 'Résolu' && (
                            <button 
                              onClick={() => handleMarkAsRead(ticket.id)}
                              className="text-xs font-medium text-primary hover:text-primary-dark transition-colors px-3 py-1 bg-primary/10 rounded-lg"
                            >
                              Marquer comme lu
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Contact Info */}
              <div className="relative bg-primary/5 border border-primary/10 rounded-2xl p-6 overflow-hidden">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wide">Contacts directs</h4>
                <div className={`space-y-4 ${plan === 'Gratuit' ? 'blur-sm select-none' : ''}`}>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-5 h-5 text-primary" />
                    <a href={plan === 'Gratuit' ? '#' : `mailto:${supportEmail}`} className="hover:text-primary transition-colors">{supportEmail}</a>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-5 h-5 text-primary" />
                    <a href={plan === 'Gratuit' ? '#' : `tel:${supportPhoneLink}`} className="hover:text-primary transition-colors">{supportPhone}</a>
                  </div>
                </div>

                {/* Free Plan Overlay */}
                {plan === 'Gratuit' && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 dark:bg-dark-surface/40 backdrop-blur-[2px]">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-2">
                        <Lock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Contacts réservés</p>
                      <p className="text-xs text-gray-500 mt-1">Disponible à partir du plan Pro</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm border border-amber-200 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10">
              <h3 className="text-lg font-bold text-amber-900 dark:text-amber-500 mb-2">Besoin d'assistance ?</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400/80 leading-relaxed">
                En tant que membre de l'équipe, pour toute demande d'assistance technique, de modification de vos droits d'accès ou pour signaler un problème, veuillez <strong>contacter l'Administrateur de votre entreprise</strong>. 
                <br /><br />
                L'administrateur pourra résoudre votre problème en interne ou contacter directement notre support technique Ztefu si nécessaire.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
