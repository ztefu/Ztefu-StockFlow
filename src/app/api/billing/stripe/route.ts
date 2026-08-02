import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  try {
    const { plan, cycle = 'monthly' } = await request.json();

    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id, full_name, email')
      .eq('id', userData.user.id)
      .single();

    if (!profile?.company_id) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 });
    }

    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('id', profile.company_id)
      .single();

    const companyName = company?.name || "l'entreprise";

    const APP_URL = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn("STRIPE_SECRET_KEY n'est pas configuré. Utilisation d'un lien mocké.");
      return NextResponse.json({ 
        link: `${APP_URL}/api/billing/callback?session_id=mock_${profile.company_id}_${plan}_${cycle}` 
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2026-06-24.dahlia' // Use the latest compatible Stripe API version
    });

    const PRICES: Record<string, { monthly: number, annual: number }> = {
      'Pro': { monthly: 5000, annual: 48000 },
      'Business': { monthly: 15000, annual: 144000 }
    };

    if (!PRICES[plan] || !PRICES[plan][cycle as 'monthly' | 'annual']) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
    }

    const serverPrice = PRICES[plan][cycle as 'monthly' | 'annual'];

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: profile.email,
      client_reference_id: `${profile.company_id}_${plan}_${cycle}`,
      line_items: [
        {
          price_data: {
            currency: 'xaf',
            product_data: {
              name: `Abonnement StockFlow AF - Plan ${plan}`,
              description: `Mise à niveau vers le plan ${plan} pour ${companyName}.`,
            },
            unit_amount: serverPrice, // En XAF (zéro-décimales)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${APP_URL}/api/billing/callback?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/settings?payment=failed`,
    });

    if (session.url) {
      return NextResponse.json({ link: session.url });
    } else {
      return NextResponse.json({ error: 'Erreur lors de la création de la session Stripe' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Erreur de facturation Stripe:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur', details: String(error) }, { status: 500 });
  }
}
