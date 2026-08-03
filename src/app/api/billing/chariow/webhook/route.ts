import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // In a production environment, you should verify the webhook signature sent by Chariow
    // to ensure the request actually comes from them.
    // Example:
    // const signature = request.headers.get("x-chariow-signature");
    // verifySignature(payload, signature, process.env.CHARIOW_WEBHOOK_SECRET);

    console.log("Webhook Chariow reçu:", payload);

    // Adapt these fields to match Chariow's actual webhook payload structure
    const status = payload.status || payload.state;
    const metadata = payload.metadata || {};
    const companyId = metadata.company_id;
    const plan = metadata.plan;
    const cycle = metadata.cycle || 'monthly';

    // Check if payment was successful (status might be 'success', 'paid', 'settled', etc.)
    if (status === 'success' || status === 'paid' || status === 'settled') {
      if (companyId) {
        // Calculate subscription end date based on cycle
        const endDate = new Date();
        if (cycle === 'annual') {
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
          endDate.setMonth(endDate.getMonth() + 1);
        }

        // Update company subscription status
        const { error: updateError } = await supabaseAdmin
          .from('companies')
          .update({
            subscription_plan: plan || 'pro',
            subscription_status: 'active',
            subscription_end_date: endDate.toISOString(),
            // optionally store the transaction ID: chariow_transaction_id: payload.id
          })
          .eq('id', companyId);

        if (updateError) {
          console.error("Erreur de mise à jour Supabase via Webhook:", updateError);
          return NextResponse.json({ error: "Database update failed" }, { status: 500 });
        }

        console.log(`Abonnement validé pour l'entreprise ${companyId}`);
      }
    }

    // Always return a 200 OK so Chariow knows we received the webhook
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Chariow webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
