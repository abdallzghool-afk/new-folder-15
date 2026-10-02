import { DriverDashboard } from '@/components/driver-dashboard'

export default function DriverPage() {
  return <DriverDashboard />
}

export const dynamic = 'force-dynamic'

// Driver access is enforced by the profile role check in the dashboard and Supabase RLS.
// Apply the project's existing RLS policies before exposing driver data in production.

export const metadata = { title: 'لوحة السائق | UniGo' }

export const revalidate = 0

export const runtime = 'nodejs'

export const preferredRegion = 'auto'

export const maxDuration = 30
