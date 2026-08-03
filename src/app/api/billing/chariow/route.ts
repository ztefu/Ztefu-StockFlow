import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from '@/lib/supabase/server';

// Initialize Supabase admin client for updates if needed
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { plan, cycle = 'monthly' } = await request.json();

    if (!plan) {
      return NextResponse.json({ error: "Missing plan" }, { status: 400 });
    }

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

    const companyId = profile.company_id;

    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('name')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const { data: settings } = await supabaseAdmin
      .from('settings')
      .select('phone')
      .eq('company_id', companyId)
      .single();

    const PRICES: Record<string, { monthly: number, annual: number }> = {
      'Pro': { monthly: 5000, annual: 48000 },
      'Business': { monthly: 15000, annual: 144000 }
    };

    if (!PRICES[plan] || !PRICES[plan][cycle as 'monthly' | 'annual']) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
    }

    const price = PRICES[plan][cycle as 'monthly' | 'annual'];
    const chariowSecretKey = process.env.CHARIOW_SECRET_KEY;
    const chariowProductId = process.env.CHARIOW_PRODUCT_ID;

    if (!chariowSecretKey) {
      return NextResponse.json({ error: "Chariow API key is not configured" }, { status: 500 });
    }
    if (!chariowProductId) {
      return NextResponse.json({ error: "CHARIOW_PRODUCT_ID n'est pas configuré dans le fichier .env.local" }, { status: 500 });
    }

    // Format names
    const fullNameParts = (profile.full_name || "Client StockFlow").split(" ");
    const firstName = fullNameParts[0];
    const lastName = fullNameParts.slice(1).join(" ") || "Client";

    // Format phone
    let rawPhone = settings?.phone || "";
    rawPhone = rawPhone.replace(/\D/g, ""); // Remove non-digits
    
    // Si le numéro commence par 237, on l'enlève pour ne garder que les 9 chiffres
    if (rawPhone.startsWith("237")) {
      rawPhone = rawPhone.substring(3);
    }
    
    // Si on n'a pas pu récupérer un numéro de 9 chiffres, on met une suite de zéros 
    // pour forcer le client à taper son vrai numéro sur la page Chariow
    if (!rawPhone || rawPhone.length !== 9) {
      rawPhone = "000000000"; 
    }

    const chariowPayload = {
      product_id: chariowProductId,
      amount: price,
      currency: "XAF",
      description: `Abonnement StockFlow AF - Plan ${plan.toUpperCase()}`,
      email: profile.email || "contact@entreprise.cm",
      first_name: firstName,
      last_name: lastName,
      phone: {
        number: rawPhone,
        country_code: "CM"
      },
      metadata: {
        company_id: companyId,
        plan: plan,
        cycle: cycle
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?canceled=true`,
      webhook_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://votre-domaine.com'}/api/billing/chariow/webhook`
    };

    // Call Chariow API to create a checkout session
    const response = await fetch("https://api.chariow.com/v1/checkout", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${chariowSecretKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(chariowPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erreur API Chariow:", data);
      return NextResponse.json({ error: data.message || "Failed to create Chariow session" }, { status: response.status });
    }

    // Return the checkout URL from Chariow
    // Chariow's response structure is { data: { step: 'payment', payment: { checkout_url: '...' } } }
    const redirectUrl = 
      data.data?.payment?.checkout_url || 
      data.data?.checkout_url || 
      data.checkout_url || 
      data.url || 
      data.link;

    if (!redirectUrl) {
      console.error("Impossible d'extraire l'URL de paiement de la réponse Chariow:", data);
      return NextResponse.json({ error: "No checkout URL returned" }, { status: 500 });
    }

    return NextResponse.json({ url: redirectUrl });

  } catch (error: any) {
    console.error("Chariow checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error during Chariow checkout" },
      { status: 500 }
    );
  }
}
