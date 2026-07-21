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

    // Mode Mock (quand STRIPE_SECRET_KEY n'est pas configuré)
    if (session_id.startsWith('mock_')) {
      const parts = session_id.split('_');
      companyId = parts[1];
      plan = parts[2];
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
    }

    if (companyId && plan) {
      // Mettre à jour le plan de l'entreprise
      const { error } = await supabase
        .from('companies')
        .update({ 
          subscription_plan: plan,
          subscription_status: 'Actif'
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
