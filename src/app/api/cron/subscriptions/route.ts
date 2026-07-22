import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Optionnel : Ajouter une vérification de clé secrète pour sécuriser la route cron
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const supabase = await createClient();
    
    // Obtenir la date actuelle
    const now = new Date().toISOString();

    // Rechercher toutes les entreprises actives dont la date d'expiration est dépassée
    const { data: expiredCompanies, error: fetchError } = await supabase
      .from('companies')
      .select('id')
      .eq('subscription_status', 'Actif')
      .lt('subscription_end_date', now);

    if (fetchError) throw fetchError;

    if (!expiredCompanies || expiredCompanies.length === 0) {
      return NextResponse.json({ message: 'Aucun abonnement expiré trouvé.', processed: 0 });
    }

    // Mettre à jour le statut en 'Expiré' pour ces entreprises
    const expiredIds = expiredCompanies.map(c => c.id);
    
    const { error: updateError } = await supabase
      .from('companies')
      .update({ subscription_status: 'Expiré' })
      .in('id', expiredIds);

    if (updateError) throw updateError;

    return NextResponse.json({ 
      message: 'Abonnements expirés mis à jour avec succès.', 
      processed: expiredIds.length,
      companyIds: expiredIds
    });

  } catch (error: any) {
    console.error('Erreur lors du cron job des abonnements:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur', details: String(error) }, { status: 500 });
  }
}
