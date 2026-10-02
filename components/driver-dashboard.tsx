'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Bell, Check, ChevronLeft, CircleUserRound, LocateFixed, LogOut, MapPin, Navigation, Power, Truck, WalletCards } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/lib/database.types'

type Order = Tables<'orders'> & { restaurant?: Pick<Tables<'restaurants'>, 'name' | 'address' | 'latitude' | 'longitude'> | null }
type Driver = Tables<'drivers'>

const steps = ['accepted', 'preparing', 'ready', 'picked_up', 'delivered'] as const
const labels: Record<string, string> = { accepted: 'تم قبول الطلب', preparing: 'جارٍ التحضير', ready: 'جاهز للاستلام', picked_up: 'في الطريق للعميل', delivered: 'تم التسليم', cancelled: 'ملغى' }

function MapsLink({ order }: { order: Order }) {
  const destination = order.status === 'accepted' || order.status === 'preparing' || order.status === 'ready'
    ? `${order.restaurant?.latitude ?? ''},${order.restaurant?.longitude ?? ''}`
    : `${order.latitude ?? ''},${order.longitude ?? ''}`
  const fallback = order.status === 'accepted' || order.status === 'preparing' || order.status === 'ready' ? order.restaurant?.address : order.delivery_address
  const href = destination !== ',' ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallback ?? '')}`
  return <a href={href} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl border bg-card px-4 py-3 text-sm font-black text-primary"><Navigation /> فتح Google Maps</a>
}

function Shell({ children, title = 'لوحة السائق' }: { children: React.ReactNode; title?: string }) {
  return <main dir="rtl" className="min-h-screen bg-background px-4 pb-10 text-foreground sm:px-6"><div className="mx-auto max-w-4xl"><header className="flex items-center justify-between gap-4 py-5"><Link href="/driver" className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-primary text-xl font-black text-primary-foreground">U</span><span className="font-black">UniGo</span></Link><div className="flex items-center gap-2"><Link href="/driver/profile" aria-label="حساب السائق" className="grid size-10 place-items-center rounded-full border bg-card"><CircleUserRound /></Link><Link href="/driver/earnings" aria-label="الأرباح" className="grid size-10 place-items-center rounded-full border bg-card"><WalletCards /></Link></div></header><div className="mb-6 flex items-center justify-between"><div><p className="text-sm font-bold text-primary">مساحة السائق</p><h1 className="mt-1 text-2xl font-black">{title}</h1></div><Bell className="text-muted-foreground" /></div>{children}</div></main>
}

function useDriverData() {
  const [driver, setDriver] = useState<Driver | null>(null)
  const [current, setCurrent] = useState<Order | null>(null)
  const [available, setAvailable] = useState<Order[]>([])
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('يجب تسجيل الدخول بحساب سائق.'); return }
    const profile = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile.error || profile.data?.role !== 'driver') { setError('هذا القسم مخصص لحسابات السائقين فقط.'); return }
    const driverResult = await supabase.from('drivers').select('*').eq('profile_id', user.id).maybeSingle()
    if (driverResult.error) { setError('تعذر تحميل ملف السائق.'); return }
    setDriver(driverResult.data)
    const [mine, open] = await Promise.all([
      supabase.from('orders').select('*, restaurant:restaurants(name,address,latitude,longitude)').eq('driver_id', user.id).in('status', ['accepted', 'preparing', 'ready', 'picked_up']).maybeSingle(),
      supabase.from('orders').select('*, restaurant:restaurants(name,address,latitude,longitude)').is('driver_id', null).in('status', ['pending', 'ready']).order('created_at', { ascending: true }),
    ])
    if (mine.error || open.error) { setError('تعذر تحميل مهام التوصيل.'); return }
    setCurrent(mine.data as Order | null)
    setAvailable((open.data ?? []) as Order[])
  }, [])
  useEffect(() => { void load() }, [load])
  return { driver, current, available, error, reload: load }
}

export function DriverDashboard() {
  const { driver, current, available, error, reload } = useDriverData()
  const [pending, setPending] = useState(false)
  async function toggleOnline() { if (!driver) return; setPending(true); await createClient().from('drivers').update({ is_available: !driver.is_available }).eq('id', driver.id); await reload(); setPending(false) }
  async function accept(id: string) { setPending(true); const result = await createClient().from('orders').update({ driver_id: driver?.profile_id, status: 'accepted' }).eq('id', id).is('driver_id', null).select('id').maybeSingle(); await reload(); setPending(false); if (!result.data) window.alert('هذه المهمة تم قبولها من سائق آخر.') }
  if (error) return <Shell><div className="rounded-3xl border bg-card p-6 text-center font-bold text-destructive">{error}</div></Shell>
  return <Shell><section className="rounded-3xl bg-primary p-5 text-primary-foreground shadow-lg"><div className="flex items-center justify-between"><div><p className="text-sm font-bold opacity-80">حالتك الحالية</p><h2 className="mt-2 text-2xl font-black">{driver?.is_available ? 'متصل' : 'غير متصل'}</h2><p className="mt-1 text-sm opacity-80">{driver?.is_available ? 'أنت متاح لاستقبال طلبات التوصيل' : 'لن تصلك مهام جديدة وأنت غير متصل'}</p></div><button onClick={toggleOnline} disabled={pending} aria-label="تبديل حالة الاتصال" className="grid size-14 place-items-center rounded-full bg-primary-foreground/20 disabled:opacity-50"><Power /></button></div></section><section className="mt-6"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-black">الطلب الحالي</h2>{current && <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">{labels[current.status]}</span>}</div>{current ? <OrderCard order={current} current /> : <div className="rounded-3xl border border-dashed p-8 text-center text-sm font-bold text-muted-foreground">لا توجد مهمة توصيل حالية.</div>}</section><section className="mt-8"><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-black">الطلبات المتاحة</h2><span className="text-xs text-muted-foreground">{available.length} طلب</span></div>{!driver?.is_available && <p className="mb-3 rounded-2xl bg-muted p-3 text-xs font-bold text-muted-foreground">اتصل لتصبح مؤهلاً لاستقبال مهام جديدة.</p>}<div className="flex flex-col gap-3">{available.map(order => <OrderCard key={order.id} order={order} onAccept={() => accept(order.id)} disabled={!driver?.is_available || pending} />)}{available.length === 0 && <div className="rounded-3xl border border-dashed p-8 text-center text-sm text-muted-foreground">لا توجد طلبات متاحة حالياً.</div>}</div></section></Shell>
}

function OrderCard({ order, current = false, onAccept, disabled }: { order: Order; current?: boolean; onAccept?: () => void; disabled?: boolean }) {
  return <article className="rounded-3xl border bg-card p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-primary">#{order.id.slice(0, 8)}</p><h3 className="mt-1 font-black">{order.restaurant?.name ?? 'مطعم UniGo'}</h3><p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin />{current ? order.delivery_address : order.restaurant?.address ?? order.delivery_address}</p></div><Truck className="text-primary" /></div><div className="mt-4 grid grid-cols-2 gap-2 text-xs"><span className="rounded-xl bg-muted p-3"><b>قيمة الطلب</b><br />{order.total.toFixed(2)} د.أ</span><span className="rounded-xl bg-muted p-3"><b>أجرة التوصيل</b><br />{order.delivery_fee.toFixed(2)} د.أ</span></div>{current ? <div className="mt-4 flex gap-2"><Link href={`/driver/deliveries/${order.id}`} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground">تحديث الحالة <ChevronLeft /></Link><MapsLink order={order} /></div> : <div className="mt-4 flex gap-2"><button onClick={onAccept} disabled={disabled} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground disabled:opacity-50"><Check /> قبول الطلب</button><Link href={`/driver/deliveries/${order.id}`} className="flex items-center justify-center rounded-2xl border px-4 text-sm font-black">عرض</Link></div>}</article>
}

export function DriverDelivery({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null>(null); const [error, setError] = useState(''); const [pending, setPending] = useState(false)
  const load = useCallback(async () => { const result = await createClient().from('orders').select('*, restaurant:restaurants(name,address,latitude,longitude)').eq('id', id).maybeSingle(); if (result.error) setError('تعذر تحميل الطلب.'); else setOrder(result.data as Order | null) }, [id]); useEffect(() => { void load() }, [load])
  async function next() { if (!order) return; const nextStatus = order.status === 'accepted' ? 'preparing' : order.status === 'preparing' ? 'ready' : order.status === 'ready' ? 'picked_up' : order.status === 'picked_up' ? 'delivered' : null; if (!nextStatus) return; setPending(true); await createClient().from('orders').update({ status: nextStatus }).eq('id', id).eq('driver_id', (await createClient().auth.getUser()).data.user?.id); await load(); setPending(false) }
  const index = steps.indexOf(order?.status as typeof steps[number]);
  return <Shell title="تفاصيل التوصيل"><Link href="/driver" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-primary"><ChevronLeft className="rotate-180" /> العودة للوحة السائق</Link>{error || !order ? <div className="rounded-3xl border bg-card p-6 text-center font-bold">{error || 'جاري تحميل الطلب...'}</div> : <><section className="rounded-3xl border bg-card p-5"><p className="text-sm font-bold text-primary">#{order.id.slice(0, 8)}</p><h2 className="mt-2 text-2xl font-black">{order.restaurant?.name}</h2><div className="mt-5 flex flex-col gap-3 text-sm"><p className="flex gap-2"><MapPin className="text-primary" /> الاستلام: {order.restaurant?.address ?? 'غير متوفر'}</p><p className="flex gap-2"><MapPin className="text-primary" /> التسليم: {order.delivery_address}</p></div><div className="mt-5"><MapsLink order={order} /></div></section><section className="mt-4 rounded-3xl border bg-card p-5"><h3 className="font-black">مراحل التوصيل</h3><div className="mt-5 flex flex-col gap-4">{steps.map((step, i) => <div key={step} className="flex items-center gap-3 text-sm"><span className={`grid size-8 place-items-center rounded-full ${i <= index ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{i <= index ? <Check /> : i + 1}</span><span className={i <= index ? 'font-black' : 'text-muted-foreground'}>{labels[step]}</span></div>)}</div>{order.status !== 'delivered' && <button onClick={next} disabled={pending || index < 0} className="mt-6 w-full rounded-2xl bg-primary px-5 py-4 font-black text-primary-foreground disabled:opacity-50">{order.status === 'accepted' ? 'ابدأ التوجه للمطعم' : order.status === 'preparing' ? 'وصلت إلى المطعم' : order.status === 'ready' ? 'استلمت الطلب' : 'تأكيد التسليم'}</button>}</section></>}</Shell>
}

export function DriverEarnings() { return <Shell title="الأرباح"><div className="rounded-3xl border bg-card p-6"><WalletCards className="text-primary" /><h2 className="mt-4 text-xl font-black">أجور التوصيل</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">تعرض هذه الصفحة الأجور المسجلة في طلباتك من Supabase.</p><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-muted p-4"><span className="text-xs text-muted-foreground">طلبات اليوم</span><strong className="mt-2 block text-2xl font-black">—</strong></div><div className="rounded-2xl bg-muted p-4"><span className="text-xs text-muted-foreground">هذا الأسبوع</span><strong className="mt-2 block text-2xl font-black">—</strong></div><div className="rounded-2xl bg-muted p-4"><span className="text-xs text-muted-foreground">الإجمالي</span><strong className="mt-2 block text-2xl font-black">—</strong></div></div></div></Shell> }

export function DriverProfile() { const [driver, setDriver] = useState<Driver | null>(null); useEffect(() => { void createClient().from('drivers').select('*').maybeSingle().then(({ data }) => setDriver(data)) }, []); return <Shell title="ملف السائق"><div className="rounded-3xl border bg-card p-6"><CircleUserRound className="size-14 text-primary" /><h2 className="mt-4 text-xl font-black">ملف السائق</h2><div className="mt-6 flex flex-col gap-4 text-sm"><p><b>نوع المركبة:</b> {driver?.vehicle_type ?? 'غير محدد'}</p><p><b>الحالة:</b> {driver?.is_available ? 'متصل' : 'غير متصل'}</p><p><b>الموقع:</b> {driver?.current_latitude && driver?.current_longitude ? 'تم حفظ آخر موقع' : 'غير متوفر'}</p></div></div></Shell> }

export function DriverLocationButton() { const [message, setMessage] = useState(''); async function update() { if (!navigator.geolocation) { setMessage('المتصفح لا يدعم تحديد الموقع.'); return } navigator.geolocation.getCurrentPosition(async ({ coords }) => { const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return; await supabase.from('drivers').update({ current_latitude: coords.latitude, current_longitude: coords.longitude }).eq('profile_id', user.id); setMessage('تم تحديث موقعك.'); }, () => setMessage('اسمح بالوصول إلى موقعك لتحديث موقع الاستلام.')) } return <button onClick={update} className="flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold"><LocateFixed /> تحديث الموقع {message && <span className="text-primary">{message}</span>}</button> }

export { LogOut }

