'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import {
  Building2,
  Users,
  Brain,
  BookOpen,
  Shield,
  Loader2
} from 'lucide-react'

/* ---------------------------------------------------------------- */
/*   PostgreSQL / Prisma Friendly Interfaces (no MongoDB patterns)  */
/* ---------------------------------------------------------------- */

interface AIUsageData {
  total: number
  chatMessages: number
  notesGenerated: number
  quizAttempts: number
}

interface OverviewData {
  colleges: number
  students: number
  teachers: number
  managers: number
  contents: number
  quizzes: number
  aiUsage: AIUsageData
}

/* ---------------------------------------------------------------- */
/*   Safe Defaults (Prevents undefined objects)                     */
/* ---------------------------------------------------------------- */

const EMPTY_DATA: OverviewData = {
  colleges: 0,
  students: 0,
  teachers: 0,
  managers: 0,
  contents: 0,
  quizzes: 0,
  aiUsage: {
    total: 0,
    chatMessages: 0,
    notesGenerated: 0,
    quizAttempts: 0,
  }
}

/* ---------------------------------------------------------------- */

export default function AdminDashboard() {
  const [data, setData] = useState<OverviewData>(EMPTY_DATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* =================== LOAD OVERVIEW =================== */
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setError(null)
        setLoading(true)

        const res = await api.get('/api/admin/overview')

        const fetched = res.data?.data || {}

        setData({
          ...EMPTY_DATA,
          ...fetched,
          aiUsage: {
            ...EMPTY_DATA.aiUsage,
            ...(fetched.aiUsage || {})
          }
        })

      } catch (err: any) {
        console.error('Admin overview fetch error:', err)
        const status = err.response?.status
        const msg = err.response?.data?.message || err.message
        setError(`Failed to load data (${status || 'Network'}). ${msg}`)
      } finally {
        setLoading(false)
      }
    }

    fetchOverview()
  }, [])

  /* =================== UI =================== */

  return (
    <div className="px-4 py-6">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-1">
          Super Admin Dashboard
        </h1>
        <p className="text-purple-400 text-sm">
          System-wide control of colleges, users, AI usage and platform content.
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex items-center space-x-3 text-purple-300 p-8 justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading system overview...</span>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-100 px-6 py-4 rounded-xl mb-6 flex items-center">
          <Shield className="h-5 w-5 mr-3 text-red-400" />
          <div>
            <p className="font-bold">Error loading dashboard</p>
            <p className="text-xs opacity-80 font-mono mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* DASHBOARD CONTENT */}
      {!loading && !error && (
        <>
          {/* TOP STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
            <StatCard
              icon={Building2}
              label="Colleges"
              value={data.colleges}
              gradient="from-purple-500 to-pink-500"
            />
            <StatCard
              icon={Users}
              label="Students"
              value={data.students}
              gradient="from-blue-500 to-cyan-500"
            />
            <StatCard
              icon={Users}
              label="Teachers"
              value={data.teachers}
              gradient="from-green-500 to-emerald-500"
            />
            <StatCard
              icon={Users}
              label="Managers"
              value={data.managers}
              gradient="from-yellow-500 to-orange-500"
            />
            <StatCard
              icon={BookOpen}
              label="Content Files"
              value={data.contents}
              gradient="from-red-500 to-pink-500"
            />
          </div>

          {/* AI USAGE + SYSTEM STATUS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* AI USAGE BLOCK */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-white">AI Usage Summary</h2>
                  <p className="text-xs text-gray-400">Based on chat, notes & quizzes.</p>
                </div>
                <Brain className="h-7 w-7 text-purple-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <SmallMetric label="Total AI Events" value={data.aiUsage.total} />
                <SmallMetric label="Chats" value={data.aiUsage.chatMessages} />
                <SmallMetric
                  label="Notes + Quiz"
                  value={data.aiUsage.notesGenerated + data.aiUsage.quizAttempts}
                />
              </div>
            </div>

            {/* SYSTEM STATUS */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-blue-500/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-white">System Status</h2>
                  <p className="text-xs text-gray-400">High-level platform insights.</p>
                </div>
                <Shield className="h-7 w-7 text-blue-400" />
              </div>

              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                  Role-based access active
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                  Secure API endpoints active
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                  AI event tracking enabled
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                  Anti-cheat monitors running
                </li>
              </ul>
            </div>

          </div>
        </>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- */
/*                     Shared Component Blocks                      */
/* ---------------------------------------------------------------- */

function StatCard({ icon: Icon, label, value, gradient }: any) {
  return (
    <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-purple-500/20 overflow-hidden shadow-lg hover:border-purple-500/40 transition-colors group">
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br ${gradient} opacity-20 blur-2xl group-hover:opacity-30 transition-opacity`}
      />
      <div
        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} mb-4 shadow-inner`}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="text-3xl font-black text-white tracking-tight">
        {value?.toLocaleString() ?? 0}
      </div>
      <div className="text-xs font-bold text-purple-200/70 mt-1 uppercase tracking-wider">
        {label}
      </div>
    </div>
  )
}

function SmallMetric({ label, value }: any) {
  return (
    <div className="bg-black/40 border border-purple-500/20 rounded-xl px-4 py-3 hover:bg-black/60 transition-colors">
      <div className="text-xs text-gray-400 font-medium mb-1">{label}</div>
      <div className="text-2xl font-black text-white">
        {value?.toLocaleString() ?? 0}
      </div>
    </div>
  )
}
