'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft, Check, Mail, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const redirectUrl = () => process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`

type AuthFieldProps = {
  label: string
  placeholder: string
  type?: string
  value: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  required?: boolean
  autoComplete?: string
}

function BrandMark() {
  return <div className="flex items-center gap-3"><div className="grid size-12 place-items-center rounded-2xl bg-primary text-xl font-black text-primary-foreground shadow-lg shadow-orange-200">U</div><div><p className="text-xl font-black tracking-tight">UniGo</p><p className="text-xs text-muted-foreground">أكلك أقرب مما تتخيل</p></div></div>
}

function AuthShell({ children, title, back = true }: { children: React.ReactNode; title?: string; back?: boolean }) {
  return <main className="min-h-screen px-5 py-6"><div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col">{back && <Link href="/auth" aria-label="العودة" className="mb-10 flex size-10 items-center justify-center rounded-full border bg-card"><ArrowLeft className="rotate-180" /></Link>}<div className="mb-10 flex justify-center"><BrandMark /></div>{title && <h1 className="mb-7 text-center text-2xl font-black">{title}</h1>}{children}</div></main>
}

function AuthField({ label, placeholder, type = 'text', value, onChange, required = false, autoComplete }: AuthFieldProps) {
  return <label className="flex flex-col gap-2 text-sm font-bold"><span>{label}</span><input type={type} placeholder={placeholder} value={value} onChange={onChange} required={required} autoComplete={autoComplete} className="rounded-2xl border bg-card px-4 py-4 text-sm font-normal outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10" /></label>
}

function SubmitButton({ children, pending }: { children: React.ReactNode; pending: boolean }) {
  return <button type="submit" disabled={pending} className="flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-4 font-black text-primary-foreground shadow-lg shadow-orange-200 disabled:cursor-not-allowed disabled:opacity-60">{pending ? 'جارٍ المعالجة...' : children}</button>
}

function WelcomePage() {
  return <AuthShell back={false}><div className="flex flex-1 flex-col items-center justify-center text-center"><div className="mb-8 grid size-28 place-items-center rounded-[2.25rem] bg-primary text-5xl font-black text-primary-foreground shadow-2xl shadow-orange-200">U</div><h1 className="text-4xl font-black tracking-tight">أكلك أقرب،<br /><span className="text-primary">وتوصيلك أوفر</span></h1><p className="mt-5 max-w-xs text-sm leading-7 text-muted-foreground">كل اللي بتحبه من مطاعم جامعتك، بيوصل لعندك بسرعة وبسعر يناسبك.</p><div className="mt-12 flex w-full flex-col gap-3"><Link href="/auth/signup" className="flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-4 font-black text-primary-foreground shadow-lg shadow-orange-200">إنشاء حساب</Link><Link href="/auth/login" className="flex w-full items-center justify-center rounded-2xl border bg-card px-5 py-4 font-black">تسجيل الدخول</Link></div><p className="mt-7 text-xs text-muted-foreground">منصة توصيل الطعام للطلاب في الأردن</p></div></AuthShell>
}

function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'student' | 'restaurant' | 'driver'>('student')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const normalizedPhone = phone.trim()
    if (fullName.trim().length < 2) return setError('اكتب اسمك الكامل بشكل صحيح.')
    if (!/^\+?[0-9\s()-]{8,}$/.test(normalizedPhone)) return setError('أدخل رقم هاتف صحيحاً.')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('أدخل بريداً إلكترونياً صحيحاً.')
    if (password.length < 8) return setError('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.')
    if (password !== confirmPassword) return setError('تأكيد كلمة المرور غير مطابق.')
    setPending(true)
    const { error: signUpError } = await createClient().auth.signUp({ email, password, options: { emailRedirectTo: redirectUrl(), data: { full_name: fullName.trim(), phone: normalizedPhone, requested_role: role } } })
    setPending(false)
    if (signUpError) {
      setError(signUpError.message.toLowerCase().includes('already') ? 'هذا البريد مستخدم مسبقاً.' : 'تعذر إنشاء الحساب حالياً. حاول مرة أخرى.')
      return
    }
    window.sessionStorage.setItem('unigo-signup-email', email)
    window.location.href = '/auth/verify'
  }

  return <AuthShell title="أنشئ حسابك"><form onSubmit={submit} className="flex flex-col gap-4"><AuthField label="الاسم الكامل" placeholder="مثال: أحمد محمد" value={fullName} onChange={event => setFullName(event.target.value)} required autoComplete="name" /><AuthField label="رقم الهاتف" placeholder="+962 7X XXX XXXX" type="tel" value={phone} onChange={event => setPhone(event.target.value)} required autoComplete="tel" /><AuthField label="البريد الإلكتروني" placeholder="name@example.com" type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" /><AuthField label="كلمة المرور" placeholder="••••••••" type="password" value={password} onChange={event => setPassword(event.target.value)} required autoComplete="new-password" /><AuthField label="تأكيد كلمة المرور" placeholder="••••••••" type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} required autoComplete="new-password" /><fieldset className="flex flex-col gap-3 pt-2"><legend className="text-sm font-bold">نوع الحساب</legend><div className="grid grid-cols-3 gap-2">{([{ value: 'student', label: 'طالب' }, { value: 'restaurant', label: 'مطعم' }, { value: 'driver', label: 'سائق' }] as const).map(option => <label key={option.value} className={`cursor-pointer rounded-2xl border px-3 py-3 text-center text-sm font-bold ${role === option.value ? 'border-primary bg-secondary text-secondary-foreground' : 'bg-card text-muted-foreground'}`}><input type="radio" name="role" value={option.value} checked={role === option.value} onChange={() => setRole(option.value)} className="sr-only" />{option.label}</label>)}</div></fieldset>{error && <p role="alert" className="text-sm font-bold text-destructive">{error}</p>}<SubmitButton pending={pending}>إنشاء الحساب</SubmitButton></form><p className="mt-6 text-center text-sm text-muted-foreground">لديك حساب؟ <Link href="/auth/login" className="font-black text-primary">تسجيل الدخول</Link></p></AuthShell>
}

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setError(''); setPending(true); const { error: signInError } = await createClient().auth.signInWithPassword({ email, password }); setPending(false); if (signInError) { setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.'); return } window.location.href = '/' }
  return <AuthShell title="أهلاً بعودتك"><form onSubmit={submit} className="flex flex-col gap-4"><AuthField label="البريد الإلكتروني" placeholder="name@example.com" type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" /><AuthField label="كلمة المرور" placeholder="••••••••" type="password" value={password} onChange={event => setPassword(event.target.value)} required autoComplete="current-password" /><Link href="/auth/forgot-password" className="-mt-1 text-sm font-bold text-primary">نسيت كلمة المرور؟</Link>{error && <p role="alert" className="text-sm font-bold text-destructive">{error}</p>}<SubmitButton pending={pending}>تسجيل الدخول</SubmitButton></form><p className="mt-6 text-center text-sm text-muted-foreground">ليس لديك حساب؟ <Link href="/auth/signup" className="font-black text-primary">إنشاء حساب</Link></p></AuthShell>
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setError(''); setMessage(''); setPending(true); const { error: resetError } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset-password` }); setPending(false); if (resetError) { setError('تعذر إرسال الرابط. تحقق من البريد الإلكتروني وحاول مرة أخرى.'); return } setMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.') }
  return <AuthShell title="استعادة كلمة المرور"><form onSubmit={submit} className="flex flex-col gap-4"><p className="text-center text-sm leading-6 text-muted-foreground">أدخل بريدك الإلكتروني وسنرسل لك رابطاً آمناً لإعادة تعيين كلمة المرور.</p><AuthField label="البريد الإلكتروني" placeholder="name@example.com" type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" />{message && <p role="status" className="rounded-2xl bg-secondary p-4 text-sm font-bold text-secondary-foreground">{message}</p>}{error && <p role="alert" className="text-sm font-bold text-destructive">{error}</p>}<SubmitButton pending={pending}>إرسال رابط إعادة التعيين</SubmitButton></form><p className="mt-6 text-center text-sm"><Link href="/auth/login" className="font-black text-primary">العودة لتسجيل الدخول</Link></p></AuthShell>
}

function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setError(''); if (password.length < 8) return setError('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.'); if (password !== confirmPassword) return setError('تأكيد كلمة المرور غير مطابق.'); setPending(true); const { error: updateError } = await createClient().auth.updateUser({ password }); setPending(false); if (updateError) { setError('انتهت صلاحية الرابط. اطلب رابطاً جديداً.'); return } router.push('/auth/login') }
  return <AuthShell title="تعيين كلمة مرور جديدة"><form onSubmit={submit} className="flex flex-col gap-4"><AuthField label="كلمة المرور الجديدة" placeholder="••••••••" type="password" value={password} onChange={event => setPassword(event.target.value)} required autoComplete="new-password" /><AuthField label="تأكيد كلمة المرور" placeholder="••••••••" type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} required autoComplete="new-password" />{error && <p role="alert" className="text-sm font-bold text-destructive">{error}</p>}<SubmitButton pending={pending}>حفظ كلمة المرور</SubmitButton></form></AuthShell>
}

function VerifyPage() {
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  async function resend() { setPending(true); setMessage(''); const email = window.sessionStorage.getItem('unigo-signup-email'); if (email) { const { error } = await createClient().auth.resend({ type: 'signup', email }); setMessage(error ? 'تعذر إعادة إرسال الرسالة حالياً.' : 'تمت إعادة إرسال رسالة التحقق.') } else setMessage('ارجع إلى التسجيل لإدخال بريدك الإلكتروني من جديد.'); setPending(false) }
  return <AuthShell title="تحقق من بريدك الإلكتروني"><div className="text-center"><div className="mx-auto grid size-20 place-items-center rounded-full bg-secondary text-primary"><Mail className="size-9" /></div><p className="mt-6 text-sm leading-7 text-muted-foreground">تم إرسال رابط التحقق إلى بريدك الإلكتروني. افتح الرسالة واضغط على الرابط لتفعيل حسابك.</p>{message && <p role="status" className="mt-5 text-sm font-bold text-primary">{message}</p>}<button type="button" onClick={resend} disabled={pending} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary disabled:opacity-60"><RefreshCw className="size-4" />{pending ? 'جارٍ الإرسال...' : 'إعادة إرسال رسالة التحقق'}</button><Link href="/auth/login" className="mt-8 flex w-full items-center justify-center rounded-2xl border bg-card px-5 py-4 font-black">العودة لتسجيل الدخول</Link></div></AuthShell>
}

export default function UniGoAuth() {
  const pathname = usePathname()
  if (pathname === '/auth/signup') return <SignupPage />
  if (pathname === '/auth/login') return <LoginPage />
  if (pathname === '/auth/forgot-password') return <ForgotPasswordPage />
  if (pathname === '/auth/reset-password') return <ResetPasswordPage />
  if (pathname === '/auth/verify') return <VerifyPage />
  return <WelcomePage />
}

export { Check }
