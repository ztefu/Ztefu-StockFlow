import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status')?.toUpperCase();
  const tx_ref = searchParams.get('tx_ref');
  const reference = searchParams.get('reference');

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si le paiement est annulé ou a échoué (Campay renvoie FAILED)
  if (status === 'CANCELLED' || status === 'FAILED') {
    return NextResponse.redirect(new URL('/settings?payment=failed', request.url));
  }

  // Campay renvoie SUCCESSFUL
  if ((status === 'SUCCESSFUL' || status === 'SUCCESS') && tx_ref) {
    try {
      // tx_ref format: tx-COMPANY_ID-PLAN-TIMESTAMP
      // ou mock_COMPANY_ID_PLAN en mode développement
      let companyId = '';
      let plan = '';

      if (tx_ref.startsWith('mock_')) {
        const parts = tx_ref.split('_');
        companyId = parts[1];
        plan = parts[2];
      } else {
        const parts = tx_ref.split('_');
        companyId = parts[1];
        plan = parts[2];
      }

      // TODO: En production, on devrait vérifier le paiement via l'API Flutterwave
      // en utilisant le transaction_id. Pour l'instant, on suppose que c'est valide.

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
      console.error('Erreur lors du traitement du callback de paiement:', error);
      return NextResponse.redirect(new URL('/settings?payment=error', request.url));
    }
  }

  return NextResponse.redirect(new URL('/settings', request.url));
}
