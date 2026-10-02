import { DriverEarnings } from '@/components/driver-dashboard'

export const metadata = { title: 'أرباح السائق | UniGo' }

export default function DriverEarningsPage() {
  return <DriverEarnings />
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
