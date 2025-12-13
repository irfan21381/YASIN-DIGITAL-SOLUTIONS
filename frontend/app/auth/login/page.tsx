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
/* ROLE / ROUTER MAP (MATCH BACKEND)                               */
/* -------------------------------------------------------------- */

const ROLES = ['STUDENT', 'TEACHER', 'MANAGER', 'SUPER_ADMIN'] as const

const ROLE_PATHS: Record<string, string> = {
  SUPER_ADMIN: '/admin/dashboard',
  MANAGER: '/manager',
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

  /* ---------------- SEND OTP ---------------- */
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

  /* ---------------- VERIFY OTP ---------------- */
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

      const roleKey = user.activeRole || user.role
      router.push(ROLE_PATHS[roleKey] || '/')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- ADMIN PASSWORD LOGIN ---------------- */
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
      toast.error(err?.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- BUTTON UI ---------------- */
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

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* STEP HANDLING */}
        {step === 'role' && (
          <>
            <select
              className="w-full px-4 py-3 bg-black border rounded-xl"
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
              onClick={() =>
                role === 'SUPER_ADMIN' ? setStep('password') : setStep('email')
              }
              className="w-full mt-6 py-4 bg-purple-600 rounded-xl font-black"
            >
              Continue
            </button>
          </>
        )}

        {step === 'email' && (
          <form onSubmit={handleSendOTP}>
            <input
              type="email"
              className="w-full px-4 py-3 bg-black border rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
            <button className="w-full mt-6 py-4 bg-purple-600 rounded-xl">
              {buttonContent('Send OTP')}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP}>
            <input
              type="text"
              maxLength={6}
              className="w-full text-center text-3xl p-4"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
            <button className="w-full mt-6 py-4 bg-purple-600 rounded-xl">
              {buttonContent('Verify OTP')}
            </button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handlePasswordLogin}>
            <input
              type="email"
              className="w-full px-4 py-3 bg-black border rounded-xl mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin email"
            />
            <input
              type="password"
              className="w-full px-4 py-3 bg-black border rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <button className="w-full mt-6 py-4 bg-purple-600 rounded-xl">
              {buttonContent('Login')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

