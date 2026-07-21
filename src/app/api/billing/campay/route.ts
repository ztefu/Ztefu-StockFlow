import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { plan, price } = await request.json();

    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id, full_name')
      .eq('id', userData.user.id)
      .single();

    if (!profile?.company_id) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 });
    }

    // Paramètres Campay
    const CAMPAY_USERNAME = process.env.CAMPAY_USERNAME;
    const CAMPAY_PASSWORD = process.env.CAMPAY_PASSWORD;
    const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const tx_ref = `tx_${profile.company_id}_${plan}_${Date.now()}`;

    if (!CAMPAY_USERNAME || !CAMPAY_PASSWORD) {
      console.warn("Les identifiants CAMPAY ne sont pas configurés. Utilisation d'un lien mocké.");
      // Mode développement / test : on simule le succès
      return NextResponse.json({ 
        link: `${APP_URL}/api/billing/callback?status=SUCCESSFUL&reference=mock_${tx_ref}` 
      });
    }

    // 1. Obtenir le token d'accès Campay
    // L'URL de base est "https://demo.campay.net/api" pour les tests et "https://www.campay.net/api" pour la prod
    const campayBaseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://www.campay.net/api' 
      : 'https://demo.campay.net/api';

    const tokenResponse = await fetch(`${campayBaseUrl}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: CAMPAY_USERNAME,
        password: CAMPAY_PASSWORD
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.token) {
      throw new Error("Impossible de s'authentifier auprès de Campay.");
    }

    // 2. Générer le lien de paiement
    // La limite du système de test Campay est de 25 XAF.
    const isDev = process.env.NODE_ENV !== 'production';
    const finalPrice = isDev ? Math.min(price, 25) : price;

    const linkResponse = await fetch(`${campayBaseUrl}/get_payment_link/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${tokenData.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: finalPrice,
        currency: 'XAF',
        description: `Abonnement au Plan ${plan} pour StockFlow AF`,
        external_reference: tx_ref,
        redirect_url: `${APP_URL}/api/billing/callback?tx_ref=${tx_ref}`
      })
    });

    const linkData = await linkResponse.json();

    if (linkData.link) {
      return NextResponse.json({ link: linkData.link });
    } else {
      console.error('Campay API Error Details:', linkData);
      return NextResponse.json({ error: 'Erreur Campay', details: linkData }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Erreur de facturation:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur', details: String(error) }, { status: 500 });
  }
}
