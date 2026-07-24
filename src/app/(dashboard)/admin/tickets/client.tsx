"use client";

import { useState } from "react";
import { MessageCircle, CheckCircle, Clock, Eye, Send, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

interface SupportTicket {
  id: string;
  user_email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  admin_reply: string | null;
  companies?: {
    name: string;
  };
}

interface TicketsClientProps {
  tickets: SupportTicket[];
}

export function TicketsClient({ tickets: initialTickets }: TicketsClientProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const toastId = toast.loading("Mise à jour du statut...");
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
      if (selectedTicket?.id === id) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
      toast.success("Statut mis à jour avec succès !", { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour.", { id: toastId });
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    setIsSubmitting(true);
    const toastId = toast.loading("Envoi de la réponse...");
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          admin_reply: replyText.trim(),
          status: 'Résolu' // Automatically mark as resolved when replying
        })
        .eq('id', selectedTicket.id);

      if (error) throw error;

      const updatedTickets = tickets.map(t => 
        t.id === selectedTicket.id 
          ? { ...t, admin_reply: replyText.trim(), status: 'Résolu' } 
          : t
      );
      setTickets(updatedTickets);
      setSelectedTicket({ ...selectedTicket, admin_reply: replyText.trim(), status: 'Résolu' });
      setReplyText("");
      
      toast.success("Réponse envoyée avec succès !", { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error("Erreur lors de l'envoi de la réponse.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 gap-6 md:gap-0">
        <div className="text-center md:text-left w-full">

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tickets Clients (Super Admin)</h1>
          <p className="text-gray-500 mt-2">Gérez et répondez aux demandes d'assistance de toutes les entreprises.</p>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden md:block">
          <div className="min-w-[900px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <th className="py-4 px-6 font-semibold">Date</th>
                  <th className="py-4 px-6 font-semibold">Client & Entreprise</th>
                  <th className="py-4 px-6 font-semibold">Sujet</th>
                  <th className="py-4 px-6 font-semibold">Statut</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-800">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Aucun ticket d'assistance pour le moment.
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <td className="py-4 px-6 text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        {new Date(ticket.created_at).toLocaleString('fr-FR', { 
                          dateStyle: 'short', 
                          timeStyle: 'short' 
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900 dark:text-white">{ticket.user_email}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Building2 className="w-3 h-3" />
                          {ticket.companies?.name || "Inconnue"}
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-md">
                        <div className="font-bold text-gray-900 dark:text-white truncate">{ticket.subject}</div>
                        {ticket.admin_reply && (
                          <div className="text-xs text-primary mt-1 font-medium">✓ Répondu</div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                          ticket.status === 'Ouvert' 
                            ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-800' 
                            : 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-800'
                        }`}>
                          {ticket.status === 'Ouvert' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => { setSelectedTicket(ticket); setReplyText(""); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Gérer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="grid grid-cols-1 gap-4 md:hidden p-4">
          {tickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Aucun ticket d'assistance pour le moment.
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 pr-2">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{ticket.subject}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(ticket.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium ${
                    ticket.status === 'Ouvert' 
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400' 
                      : 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                  }`}>
                    {ticket.status === 'Ouvert' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                    {ticket.status}
                  </span>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mt-3 mb-4 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {ticket.companies?.name || "Entreprise Inconnue"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500 truncate">{ticket.user_email}</p>
                  </div>
                  {ticket.admin_reply && (
                    <div className="mt-2 text-[10px] font-bold text-primary flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Répondu
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 border-t border-gray-200 dark:border-gray-700 pt-3">
                  <button 
                    onClick={() => { setSelectedTicket(ticket); setReplyText(""); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors text-xs font-medium"
                  >
                    <Eye className="w-4 h-4" /> Gérer le ticket
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Ticket Support</h3>
                <p className="text-sm text-gray-500 mt-1">
                  De: {selectedTicket.user_email} ({selectedTicket.companies?.name || "Entreprise inconnue"})
                </p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${
                selectedTicket.status === 'Ouvert' 
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' 
                  : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
              }`}>
                {selectedTicket.status}
              </span>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Message du client */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">{selectedTicket.subject}</h4>
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
                  {selectedTicket.message}
                </div>
                <div className="text-xs text-gray-400 mt-4">
                  Envoyé le {new Date(selectedTicket.created_at).toLocaleString('fr-FR')}
                </div>
              </div>

              {/* Réponse de l'admin (s'il y en a une) */}
              {selectedTicket.admin_reply && (
                <div className="bg-primary/5 rounded-xl p-5 border border-primary/20">
                  <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Votre Réponse
                  </h4>
                  <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-sm">
                    {selectedTicket.admin_reply}
                  </div>
                </div>
              )}

              {/* Formulaire de réponse (si non répondu ou pour modifier) */}
              <form onSubmit={handleSendReply} className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {selectedTicket.admin_reply ? "Modifier la réponse" : "Rédiger une réponse"}
                  </label>
                  <textarea 
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Bonjour, suite à votre demande..."
                    className="w-full bg-white dark:bg-gray-900 text-sm rounded-lg px-4 py-3 outline-none border border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-2">
                    L'envoi d'une réponse passera automatiquement le ticket en statut "Résolu". Le client verra cette réponse sur sa page d'Aide.
                  </p>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex flex-wrap gap-3 justify-end items-center">
              <div className="flex-1 flex gap-2">
                {selectedTicket.status === 'Ouvert' ? (
                  <button 
                    onClick={() => handleUpdateStatus(selectedTicket.id, 'Résolu')}
                    className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/30 rounded-lg transition-colors"
                  >
                    Marquer résolu sans répondre
                  </button>
                ) : (
                  <button 
                    onClick={() => handleUpdateStatus(selectedTicket.id, 'Ouvert')}
                    className="px-4 py-2 text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:hover:bg-orange-500/30 rounded-lg transition-colors"
                  >
                    Rouvrir le ticket
                  </button>
                )}
              </div>
              <button 
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-5 py-2.5 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                Fermer
              </button>
              <button 
                onClick={handleSendReply}
                disabled={isSubmitting || !replyText.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-all shadow-sm shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Envoyer la réponse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
