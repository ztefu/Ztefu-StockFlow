import { getDashboardMetrics } from '../actions'
import { AdminDashboardClient } from './AdminDashboardClient'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics()

  return <AdminDashboardClient initialMetrics={metrics} />
}
