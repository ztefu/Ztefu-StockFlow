import { createClient } from '@/lib/supabase/server';
import ScannerClient from './ScannerClient';

export default async function ScannerPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user?.id)
    .single();

  const { data: products } = await supabase
    .from('products')
    .select('id, sku, name')
    .eq('company_id', profile?.company_id);

  return (
    <div className="w-full">
      <ScannerClient products={products || []} />
    </div>
  );
}
