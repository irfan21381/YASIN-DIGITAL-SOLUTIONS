export const dynamic = "force-dynamic";

'use client'

import Layout from '@/components/AppShell'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { BarChart3, TrendingUp, Users, BookOpen } from 'lucide-react'
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
)

export default function TeacherAnalyticsPage() {

  /* =====================================================
        SAFE API FETCHERS (PostgreSQL + Mongo Compatible)
  ===================================================== */
  const { data: usage } = useQuery({
    queryKey: ['analytics-usage'],
    queryFn: async () => {
      try {
        const res = await api.get('/analytics/student-usage')
        const raw = res?.data?.data ?? res?.data ?? {}
        return { total: raw.total ?? 0 }
      } catch {
        return { total: 0 }
      }
    }
  })

  const { data: quizMarks } = useQuery({
    queryKey: ['analytics-quiz-marks'],
    queryFn: async () => {
      try {
        const res = await api.get('/analytics/quiz-marks')
        const raw = res?.data?.data ?? res?.data ?? {}

        return {
          attempts: Array.isArray(raw.attempts) ? raw.attempts : [],
          totalAttempts: raw.totalAttempts ?? 0,
          averagePercentage: raw.averagePercentage ?? 0
        }
      } catch {
        return {
          attempts: [],
          totalAttempts: 0,
          averagePercentage: 0
        }
      }
    }
  })

  const { data: weakSubjects } = useQuery({
    queryKey: ['analytics-weak-subjects'],
    queryFn: async () => {
      try {
        const res = await api.get('/analytics/weak-subjects')
        const raw = res?.data?.data ?? res?.data ?? {}

        return {
          weakSubjects: Array.isArray(raw.weakSubjects) ? raw.weakSubjects : []
        }
      } catch {
        return { weakSubjects: [] }
      }
    }
  })

  const { data: difficulty } = useQuery({
    queryKey: ['analytics-difficulty'],
    queryFn: async () => {
      try {
        const res = await api.get('/analytics/difficulty-heatmap')
        const raw = res?.data?.data ?? res?.data ?? []
        return Array.isArray(raw) ? raw : []
      } catch {
        return []
      }
    }
  })

  /* =====================================================
        CHART DATA
  ===================================================== */

  // 1. AI Usage Trend - demo values (backend not providing list)
  const usageData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'AI Questions Asked',
      data: [12, 19, 15, 25, 22, 18, 14],
      borderColor: 'rgb(147, 51, 234)',
      backgroundColor: 'rgba(147, 51, 234, 0.1)',
      tension: 0.4,
    }],
  }

  // 2. Quiz Performance
  const quizAttempts = quizMarks?.attempts || []

  const quizData = {
    labels: quizAttempts.map((a: any) =>
      a.studentName?.split(' ')[0] ||
      a.student?.name ||
      "Student"
    ),
    datasets: [
      {
        label: 'Marks Obtained',
        data: quizAttempts.map((a: any) => a.marksObtained ?? 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Total Marks',
        data: quizAttempts.map((a: any) => a.totalMarks ?? 0),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
    ],
  }

  // 3. Weak Subjects
  const weakData = weakSubjects?.weakSubjects || []

  const weakSubjectsData = {
    labels: weakData.map((s: any) => s.subjectName || `Subject ${s.subjectId}`),
    datasets: [
      {
        label: 'Performance %',
        data: weakData.map((s: any) => s.percentage || 0),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 101, 101, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(251, 191, 36, 0.8)',
        ],
      }
    ]
  }

  // 4. Difficulty Radar
  const difficultyList = Array.isArray(difficulty) ? difficulty : []

  const difficultyData = {
    labels: difficultyList.map((d: any) =>
      (d.difficulty || d.level || "N/A").toUpperCase()
    ),
    datasets: [
      {
        label: 'Correct %',
        data: difficultyList.map((d: any) => d.percentage || d.correctPercent || 0),
        backgroundColor: 'rgba(147, 51, 234, 0.2)',
        borderColor: 'rgb(147, 51, 234)',
        pointBackgroundColor: 'rgb(147, 51, 234)',
      }
    ]
  }

  /* =====================================================
        UI 
  ===================================================== */
  return (
    <Layout>
      <div className="px-4 py-6">

        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-3 rounded-xl">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">Analytics Dashboard</h1>
              <p className="text-purple-400">Student Performance Insights</p>
            </div>
          </div>
        </div>

        {/* TOP STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
            <Users className="h-8 w-8 opacity-80" />
            <p className="text-3xl font-black">{usage?.total || 0}</p>
            <p className="text-purple-100 font-semibold">Total Activities</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
            <BookOpen className="h-8 w-8 opacity-80" />
            <p className="text-3xl font-black">{quizMarks?.totalAttempts || 0}</p>
            <p className="text-blue-100 font-semibold">Quiz Attempts</p>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
            <TrendingUp className="h-8 w-8 opacity-80" />
            <p className="text-3xl font-black">
              {(quizMarks?.averagePercentage || 0).toFixed(1)}%
            </p>
            <p className="text-green-100 font-semibold">Avg Score</p>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl p-6 text-white">
            <BarChart3 className="h-8 w-8 opacity-80" />
            <p className="text-3xl font-black">{weakData.length}</p>
            <p className="text-red-100 font-semibold">Weak Subjects</p>
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/20 p-6">
            <h2 className="text-xl font-black text-white mb-4">AI Usage Trend</h2>
            <Line data={usageData} />
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-blue-500/20 p-6">
            <h2 className="text-xl font-black text-white mb-4">Quiz Performance</h2>
            <Bar data={quizData} />
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-red-500/20 p-6">
            <h2 className="text-xl font-black text-white mb-4">Weak Subjects</h2>
            <Doughnut data={weakSubjectsData} />
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-green-500/20 p-6">
            <h2 className="text-xl font-black text-white mb-4">Difficulty Analysis</h2>
            <Radar data={difficultyData} />
          </div>

        </div>
      </div>
    </Layout>
  )
}
