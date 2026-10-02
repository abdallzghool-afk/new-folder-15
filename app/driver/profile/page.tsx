import { DriverProfile } from '@/components/driver-dashboard'

export const metadata = { title: 'ملف السائق | UniGo' }

export default function DriverProfilePage() {
  return <DriverProfile />
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
