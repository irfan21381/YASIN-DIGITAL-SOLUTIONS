'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Brain,
  Mail,
  ArrowRight,
  Sparkles,
  Lock,
  Loader2,
} from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import Link from 'next/link'
import toast from 'react-hot-toast'

/* -------------------------------------------------------------- */
/*                       ROLE / ROUTER MAP                        */
/* -------------------------------------------------------------- */

const ROLES = ['STUDENT', 'TEACHER', 'COLLEGE_MANAGER', 'SUPER_ADMIN'] as const

const ROLE_PATHS: Record<string, string> = {
  SUPER_ADMIN: '/admin/dashboard',
  COLLEGE_MANAGER: '/manager',
  TEACHER: '/teacher',
  STUDENT: '/student/dashboard',
}

/* -------------------------------------------------------------- */

type Step = 'role' | 'email' | 'otp' | 'password'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<string>('STUDENT')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<Step>('role')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const { setAuth } = useAuthStore()

  /* -------------------------------------------------------------- */
  /*                       SEND OTP                                 */
  /* -------------------------------------------------------------- */
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) return toast.error('Email is required')

    setLoading(true)

    try {
      await api.post('/api/auth/send-otp', { email, role })
      toast.success(`OTP sent to ${email}`)
      setStep('otp')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  /* -------------------------------------------------------------- */
  /*                       VERIFY OTP                               */
  /* -------------------------------------------------------------- */
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otp.length !== 6) return toast.error('OTP must be 6 digits')

    setLoading(true)

    try {
      const { data } = await api.post('/api/auth/verify-otp', { email, otp })

      const user = data.data?.user || data.user
      const token = data.data?.token || data.token

      if (!user || !token) throw new Error('Invalid login response')

      setAuth(user, token)
      toast.success('Login successful')

      router.push(ROLE_PATHS[user.activeRole] || '/dashboard')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  /* -------------------------------------------------------------- */
  /*                       ADMIN PASSWORD LOGIN                      */
  /* -------------------------------------------------------------- */
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      return toast.error('Enter email & password')
    }

    setLoading(true)

    try {
      const { data } = await api.post('/api/auth/login-password', {
        email,
        password,
      })

      const user = data.data?.user || data.user
      const token = data.data?.token || data.token

      if (!user || !token) throw new Error('Invalid login response')

      setAuth(user, token)
      toast.success('Admin login successful')

      router.push('/admin/dashboard')
    } catch (err: any) {
      const msg = err?.response?.data?.message
      toast.error(msg || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  /* -------------------------------------------------------------- */
  /*                       BUTTON SPINNER                           */
  /* -------------------------------------------------------------- */
  const buttonContent = (label: string) =>
    loading ? (
      <span className="flex items-center justify-center">
        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        {label}
      </span>
    ) : (
      <span className="flex items-center justify-center">
        {label}
        <ArrowRight className="h-5 w-5 ml-2" />
      </span>
    )

  /* -------------------------------------------------------------- */
  /*                              UI                               */
  /* -------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-pink-900/40" />
        <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-purple-600/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-pink-600/30 rounded-full blur-3xl" />
      </div>

      {/* LOGIN WRAPPER */}
      <div className="w-full max-w-md relative z-10">
        {/* LOGO */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-75" />
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                YDS EduAI
              </span>
              <p className="text-xs text-purple-300">AI Learning Suite</p>
            </div>
          </Link>

          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40 px-4 py-2 rounded-full text-sm font-bold">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span className="text-yellow-300">
              {step === 'password' ? 'Admin Login' : 'Secure OTP Login'}
            </span>
          </div>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
          {/* STEP: ROLE SELECTION */}
          {step === 'role' && (
            <>
              <h2 className="text-2xl font-black mb-4">Select your role</h2>
              <p className="text-gray-400 mb-4 text-sm">
                Students register themselves. Teachers & Managers need admin approval.
              </p>

              <select
                className="w-full px-4 py-3 bg-black/60 border border-purple-500/40 rounded-xl"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.replace('_', ' ')}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setStep('email')}
                className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-black"
              >
                {buttonContent('Continue')}
              </button>
            </>
          )}

          {/* STEP: EMAIL */}
          {step === 'email' && (
            <form
              onSubmit={(e) => {
                if (role === 'SUPER_ADMIN') {
                  e.preventDefault()
                  return setStep('password')
                }
                handleSendOTP(e)
              }}
            >
              <h2 className="text-2xl font-black mb-2">Welcome back</h2>
              <p className="text-gray-400 mb-4 text-sm">
                Role: <span className="text-purple-300 font-semibold">{role.replace('_', ' ')}</span>
              </p>

              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-purple-400" />
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-3 bg-black/60 border border-purple-500/40 rounded-xl"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-black"
              >
                {role === 'SUPER_ADMIN'
                  ? buttonContent('Continue')
                  : buttonContent('Send OTP')}
              </button>
            </form>
          )}

          {/* STEP: OTP VERIFICATION */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP}>
              <h2 className="text-2xl font-black mb-2">Enter OTP</h2>
              <p className="text-gray-400 mb-4 text-sm">
                Code sent to <span className="text-purple-300 font-semibold">{email}</span>
              </p>

              <input
                type="text"
                maxLength={6}
                className="w-full text-center text-3xl p-4 tracking-[0.4em] bg-black/60 border border-purple-500/40 rounded-xl font-black"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
              />

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-black disabled:opacity-50"
              >
                {buttonContent('Verify OTP')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtp('')
                  setStep('email')
                }}
                className="w-full text-sm mt-3 text-purple-300 hover:text-purple-200"
              >
                ← Change email / resend OTP
              </button>
            </form>
          )}

          {/* STEP: ADMIN PASSWORD LOGIN */}
          {step === 'password' && (
            <form onSubmit={handlePasswordLogin}>
              <h2 className="text-2xl font-black mb-2">Admin Login</h2>
              <p className="text-gray-400 mb-4 text-sm">
                Only <span className="text-purple-300 font-semibold">SUPER_ADMIN</span> uses password login.
              </p>

              {/* Email */}
              <label className="block text-sm font-semibold mb-2">Admin Email</label>
              <div className="relative mb-4">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-purple-400" />
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-3 bg-black/60 border border-purple-500/40 rounded-xl"
                  placeholder="admin@yds.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <label className="block text-sm font-semibold mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-purple-400" />
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-3 bg-black/60 border border-purple-500/40 rounded-xl"
                  placeholder="Admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-black disabled:opacity-50"
              >
                {buttonContent('Login')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setPassword('')
                  setStep('email')
                }}
                className="w-full text-sm mt-3 text-purple-300 hover:text-purple-200"
              >
                ← Back to OTP login
              </button>
            </form>
          )}
        </div>

        {/* BACK TO HOME */}
        <p className="mt-6 text-center text-gray-400 text-sm">
          <Link href="/" className="hover:text-purple-300">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
