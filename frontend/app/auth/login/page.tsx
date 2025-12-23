'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { Loader2, ArrowRight } from 'lucide-react'

type Step = 'role' | 'email' | 'otp' | 'password'

const ROLE_PATHS: Record<string, string> = {
  SUPER_ADMIN: '/admin/dashboard',
  MANAGER: '/manager',
  TEACHER: '/teacher',
  STUDENT: '/student/dashboard',
}

export default function LoginPage() {
  const [step, setStep] = useState<Step>('role')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [role, setRole] = useState('STUDENT')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const { setAuth } = useAuthStore()

  /* ---------------- SEND OTP ---------------- */
  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('Email is required')
      return
    }

    setLoading(true)
    try {
      // ✅ BACKEND MATCHING ROUTE
      await api.post('/api/auth/send-otp', { email, role })
      toast.success('OTP sent to your email')
      setStep('otp')
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- VERIFY OTP ---------------- */
  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits')
      return
    }

    setLoading(true)
    try {
      // ✅ BACKEND MATCHING ROUTE
      const res = await api.post('/api/auth/verify-otp', { email, otp })

      const user = res?.user || res?.data?.user
      const token = res?.token || res?.data?.token

      if (!user || !token) {
        throw new Error('Invalid login response')
      }

      setAuth(user, token)
      toast.success('Login successful')

      router.push(ROLE_PATHS[user.role] || '/')
    } catch (err: any) {
      toast.error(err.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- ADMIN PASSWORD LOGIN ---------------- */
  const passwordLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      toast.error('Email and password required')
      return
    }

    setLoading(true)
    try {
      // ✅ BACKEND MATCHING ROUTE
      const res = await api.post('/api/auth/login-password', {
        email,
        password,
      })

      const user = res?.user || res?.data?.user
      const token = res?.token || res?.data?.token

      if (!user || !token) {
        throw new Error('Invalid login response')
      }

      setAuth(user, token)
      toast.success('Admin login successful')

      router.push('/admin/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const button = (text: string) =>
    loading ? (
      <span className="flex items-center justify-center">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        {text}
      </span>
    ) : (
      <span className="flex items-center justify-center">
        {text}
        <ArrowRight className="h-4 w-4 ml-2" />
      </span>
    )

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md space-y-6">

        {/* ROLE SELECTION */}
        {step === 'role' && (
          <>
            <select
              className="w-full p-3 bg-black border rounded-xl"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="MANAGER">Manager</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>

            <button
              onClick={() =>
                role === 'SUPER_ADMIN'
                  ? setStep('password')
                  : setStep('email')
              }
              className="w-full py-3 bg-purple-600 rounded-xl font-bold"
            >
              Continue
            </button>
          </>
        )}

        {/* EMAIL */}
        {step === 'email' && (
          <form onSubmit={sendOtp}>
            <input
              type="email"
              className="w-full p-3 bg-black border rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
            <button className="w-full mt-4 py-3 bg-purple-600 rounded-xl">
              {button('Send OTP')}
            </button>
          </form>
        )}

        {/* OTP */}
        {step === 'otp' && (
          <form onSubmit={verifyOtp}>
            <input
              className="w-full p-3 text-center text-2xl bg-black border rounded-xl"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              placeholder="Enter OTP"
            />
            <button className="w-full mt-4 py-3 bg-purple-600 rounded-xl">
              {button('Verify OTP')}
            </button>
          </form>
        )}

        {/* PASSWORD */}
        {step === 'password' && (
          <form onSubmit={passwordLogin}>
            <input
              type="email"
              className="w-full p-3 bg-black border rounded-xl mb-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin Email"
              required
            />
            <input
              type="password"
              className="w-full p-3 bg-black border rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <button className="w-full mt-4 py-3 bg-purple-600 rounded-xl">
              {button('Login')}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
