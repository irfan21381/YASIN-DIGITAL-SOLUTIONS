

'use client';
export const dynamic = "force-dynamic";

import Layout from '@/components/AppShell'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { 
  Users, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Sparkles 
} from 'lucide-react'

export default function ClassroomPage() {

  /* ==========================================================
        1. ACTIVE STUDENTS (PostgreSQL + Mongo Compatible)
  ========================================================== */
  const { data: activeStudents = [] } = useQuery({
    queryKey: ['active-students'],
    queryFn: async () => {
      try {
        const res = await api.get('/classroom/active-students')

        const raw =
          res?.data?.data ??
          res?.data?.students ??
          res?.data ??
          []

        return Array.isArray(raw) ? raw : []
      } catch {
        return []
      }
    }
  })

  const firstStudentId =
    activeStudents[0]?.id ||
    activeStudents[0]?._id ||
    null

  /* ==========================================================
        2. AI RECOMMENDATIONS FOR FIRST ACTIVE STUDENT
  ========================================================== */
  const { data: recommendations } = useQuery({
    queryKey: ['ai-recommendations', firstStudentId],
    enabled: !!firstStudentId,
    queryFn: async () => {
      try {
        const res = await api.get(
          `/classroom/ai-recommendations?studentId=${firstStudentId}`
        )

        const raw =
          res?.data?.data ??
          res?.data?.recommendations ??
          null

        if (!raw) return null

        return {
          recommendations: raw.recommendations ?? "No recommendations yet."
        }
      } catch {
        return null
      }
    }
  })

  return (
    <Layout>
      <div className="px-4 py-6">

        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-xl">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">Classroom Manager</h1>
              <p className="text-purple-400">Track student activity and performance</p>
            </div>
          </div>
        </div>

        {/* =====================================================
                ACTIVE STUDENTS
        ===================================================== */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-green-500/20 p-6 mb-6">

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-green-400" />
              <h2 className="text-2xl font-black text-white">Active Students</h2>
            </div>
            <span className="text-sm text-gray-400">Last 24 hours</span>
          </div>

          {activeStudents.length === 0 && (
            <p className="text-gray-500 text-center py-6">No student activity found.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeStudents.map((student: any) => {
              const id = student.id || student._id
              return (
                <div
                  key={id}
                  className={`p-4 rounded-xl border ${
                    student.is_active || student.isActive
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-gray-800/50 border-gray-700/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white">
                      {student.name || "Unnamed Student"}
                    </h3>

                    {(student.is_active || student.isActive) && (
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    )}
                  </div>

                  <p className="text-sm text-gray-400 mb-2">
                    {student.email || "No email"}
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {student.last_activity || student.lastActivity
                          ? new Date(
                              student.last_activity || student.lastActivity
                            ).toLocaleTimeString()
                          : 'Never'}
                      </span>
                    </div>
                    <span>
                      {student.activity_count ?? student.activityCount ?? 0} activities
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* =====================================================
                AI RECOMMENDATIONS
        ===================================================== */}
        {recommendations && (
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/20 p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-black text-white">AI Recommendations</h2>
            </div>

            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {recommendations.recommendations}
            </div>
          </div>
        )}

        {/* =====================================================
                STRONG & WEAK TOPICS (STATIC PLACEHOLDERS)
        ===================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Strong Topics */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-green-500/20 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-6 w-6 text-green-400" />
              <h2 className="text-xl font-black text-white">Strong Topics</h2>
            </div>

            <div className="space-y-2">
              {['Data Structures', 'Algorithms', 'Database Systems'].map((topic, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                  <span className="text-white font-semibold">{topic}</span>
                  <span className="text-green-400 font-bold">85%+</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weak Topics */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-red-500/20 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingDown className="h-6 w-6 text-red-400" />
              <h2 className="text-xl font-black text-white">Weak Topics</h2>
            </div>

            <div className="space-y-2">
              {['Machine Learning', 'Networking', 'Operating Systems'].map((topic, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                  <span className="text-white font-semibold">{topic}</span>
                  <span className="text-red-400 font-bold">&lt;50%</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* =====================================================
                TIMELINE (STATIC PLACEHOLDER)
        ===================================================== */}
        <div className="mt-6 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-blue-500/20 p-6">

          <h2 className="text-xl font-black text-white mb-4">Recent Activity Timeline</h2>

          <div className="space-y-3">
            {[ 
              { student: 'John Doe', action: 'Completed Quiz', time: '2 hours ago' },
              { student: 'Jane Smith', action: 'Asked AI Doubt', time: '3 hours ago' },
              { student: 'Bob Wilson', action: 'Generated Notes', time: '4 hours ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-black/50 rounded-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="flex-1">
                  <span className="text-white font-semibold">{activity.student}</span>
                  <span className="text-gray-400 ml-2">{activity.action}</span>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  )
}
