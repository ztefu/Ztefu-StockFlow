import { CheckoutClient } from './CheckoutClient'

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; price?: string; cycle?: string }>
}) {
  const resolvedParams = await searchParams

  return (
    <CheckoutClient
      plan={resolvedParams.plan || 'Inconnu'}
      price={resolvedParams.price ? parseInt(resolvedParams.price) : 0}
      cycle={(resolvedParams.cycle as 'monthly' | 'annual') || 'monthly'}
    />
  )
}
