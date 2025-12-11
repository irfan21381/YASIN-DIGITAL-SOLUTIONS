'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { BarChart3, Loader2 } from 'lucide-react'

/* --------------------------- New Clean Interfaces --------------------------- */
/* 
   MongoDB _id removed. 
   Future PostgreSQL row will return:
   {
     eventType: 'chat_message',
     count: 120
   }
*/
interface AIEventRow {
  eventType: string
  count: number
}

interface QuizStats {
  totalQuizzes: number
  totalAttempts: number
  avgScore: number
}

interface AnalyticsData {
  aiEvents: AIEventRow[]
  quizStats: QuizStats
}

/* --------------------------- Main Analytics Page --------------------------- */

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await api.get('/api/admin/analytics/overview')
        setData(res.data.data)
      } catch (err: any) {
        console.error('Analytics load error:', err)
        setError(err?.response?.data?.message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const getCount = (type: string) =>
    data?.aiEvents.find((e) => e.eventType === type)?.count || 0

  return (
    <div className="px-4 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl shadow-lg">
          <BarChart3 className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Analytics
          </h1>
          <p className="text-indigo-300 text-sm">
            AI usage & quiz performance summary across all colleges.
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center text-indigo-300">
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Loading analytics...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-900/40 border border-red-500/60 text-red-100 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Content */}
      {!loading && data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* AI Events Card */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-indigo-500/30 rounded-2xl p-5 space-y-3 shadow-xl">
            <h2 className="text-lg font-black text-white">AI Events</h2>

            <MetricRow label="Chat messages" value={getCount('chat_message')} />
            <MetricRow label="Notes generated" value={getCount('notes_generated')} />
            <MetricRow label="AI Quiz attempts" value={getCount('quiz_attempt')} />
            
            <MetricRow 
              label="Total AI events" 
              value={data.aiEvents.reduce((s, r) => s + r.count, 0)} 
            />
          </div>

          {/* Quiz Stats Card */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-5 space-y-3 shadow-xl">
            <h2 className="text-lg font-black text-white">Quizzes</h2>

            <MetricRow label="Total quizzes" value={data.quizStats.totalQuizzes} />
            <MetricRow label="Total attempts" value={data.quizStats.totalAttempts} />
            <MetricRow
              label="Average score"
              value={`${data.quizStats.avgScore?.toFixed(1) || 0}%`}
            />
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------ Metric Row ------------------------------ */

function MetricRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between text-sm text-gray-300 py-1">
      <span>{label}</span>
      <span className="font-bold text-indigo-200">{value}</span>
    </div>
  )
}
