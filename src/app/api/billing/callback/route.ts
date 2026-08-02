import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const session_id = searchParams.get('session_id');

  if (!session_id) {
    return NextResponse.redirect(new URL('/settings?payment=failed', request.url));
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    let companyId = '';
    let plan = '';
    let cycle = 'monthly';

    // Mode Mock (quand STRIPE_SECRET_KEY n'est pas configuré)
    if (session_id.startsWith('mock_')) {
      const parts = session_id.split('_');
      companyId = parts[1];
      plan = parts[2];
      if (parts[3]) cycle = parts[3];
    } else {
      // Vérification réelle via l'API Stripe
      if (!process.env.STRIPE_SECRET_KEY) {
         throw new Error("Clé Stripe non configurée");
      }
      
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: '2026-06-24.dahlia'
      });
      
      const session = await stripe.checkout.sessions.retrieve(session_id);
      
      if (session.payment_status !== 'paid') {
        return NextResponse.redirect(new URL('/settings?payment=failed', request.url));
      }

      if (!session.client_reference_id) {
        throw new Error("Référence client manquante dans la session Stripe");
      }

      const parts = session.client_reference_id.split('_');
      companyId = parts[0];
      plan = parts[1];
      if (parts[2]) cycle = parts[2];
    }

    if (companyId && plan) {
      // Récupérer l'entreprise pour vérifier sa date d'expiration actuelle et son dernier paiement
      const { data: currentCompany } = await supabase
        .from('companies')
        .select('subscription_end_date, subscription_status, last_stripe_session_id')
        .eq('id', companyId)
        .single();

      // Sécurité: Empêcher le "Replay Attack" d'une ancienne session Stripe
      if (currentCompany?.last_stripe_session_id === session_id) {
        console.warn("Tentative de rejeu d'une session Stripe déjà traitée:", session_id);
        return NextResponse.redirect(new URL('/settings?payment=already_processed', request.url));
      }

      // Calculer la date d'expiration
      let baseDate = new Date();
      if (currentCompany?.subscription_end_date && currentCompany.subscription_status === 'Actif') {
        const currentEndDate = new Date(currentCompany.subscription_end_date);
        if (currentEndDate > baseDate) {
          baseDate = currentEndDate;
        }
      }

      const endDate = new Date(baseDate);
      if (cycle === 'annual') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      // Mettre à jour le plan de l'entreprise
      const { error } = await supabase
        .from('companies')
        .update({ 
          subscription_plan: plan,
          subscription_status: 'Actif',
          billing_cycle: cycle,
          subscription_end_date: endDate.toISOString(),
          last_stripe_session_id: session_id
        })
        .eq('id', companyId);

      if (error) {
        console.error("Erreur de mise à jour de l'abonnement:", error);
        return NextResponse.redirect(new URL('/settings?payment=error', request.url));
      }

      return NextResponse.redirect(new URL(`/settings?payment=success&plan=${plan}`, request.url));
    }

  } catch (error) {
    console.error('Erreur lors du traitement de la session Stripe:', error);
    return NextResponse.redirect(new URL('/settings?payment=error', request.url));
  }

  return NextResponse.redirect(new URL('/settings', request.url));
}
