export const dynamic = "force-dynamic";

'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { BarChart3, Users, BookOpen, TrendingUp } from 'lucide-react'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import Layout from '@/components/AppShell'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
)

export default function ManagerAnalyticsPage() {

  /* ============================
        FETCH DASHBOARD DATA
  ============================ */
  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['manager-dashboard'],
    queryFn: async () =>
      api.get('/api/manager/dashboard').then((res) => res.data.data),
  })

  const { data: aiQuestions, isLoading: aiLoading } = useQuery({
    queryKey: ['ai-questions'],
    queryFn: async () =>
      api
        .get('/api/manager/analytics/ai-questions')
        .then((res) => res.data.data),
  })

  /* ============================
         STATIC CHARTS
  ============================ */
  const usageData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'AI Usage',
        data: [120, 190, 150, 250],
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#a855f7',
      },
    ],
  }

  const performanceData = {
    labels: ['Excellent', 'Good', 'Average', 'Low'],
    datasets: [
      {
        data: [25, 35, 25, 15],
        backgroundColor: [
          'rgba(34,197,94,0.85)',
          'rgba(59,130,246,0.85)',
          'rgba(251,191,36,0.85)',
          'rgba(239,68,68,0.85)',
        ],
        borderWidth: 0,
      },
    ],
  }

  const LoadingCard = () => (
    <div className="rounded-2xl p-6 bg-gray-800/40 animate-pulse h-32" />
  )

  return (
    <Layout>
      <div className="px-4 py-6">

        {/* HEADER */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl shadow-lg shadow-purple-500/20">
            <BarChart3 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white">College Analytics</h1>
            <p className="text-purple-400">Performance & AI usage insights</p>
          </div>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {dashboardLoading ? (
            <>
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </>
          ) : (
            <>
              <StatCard
                value={dashboard?.students || 0}
                label="Total Students"
                icon={<Users className="h-8 w-8 opacity-80" />}
                gradient="from-purple-600 to-pink-600"
              />

              <StatCard
                value={dashboard?.teachers || 0}
                label="Teachers"
                icon={<Users className="h-8 w-8 opacity-80" />}
                gradient="from-blue-600 to-cyan-600"
              />

              <StatCard
                value={dashboard?.content || 0}
                label="Content Files"
                icon={<BookOpen className="h-8 w-8 opacity-80" />}
                gradient="from-green-600 to-emerald-600"
              />

              <StatCard
                value={aiQuestions?.totalQuestions || 0}
                label="AI Questions"
                icon={<TrendingUp className="h-8 w-8 opacity-80" />}
                gradient="from-yellow-600 to-orange-600"
              />
            </>
          )}
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <ChartCard title="AI Usage Trend">
            <Line
              data={usageData}
              options={{
                plugins: {
                  legend: { labels: { color: '#fff' } },
                },
                scales: {
                  x: {
                    ticks: { color: '#9ca3af' },
                    grid: { color: 'rgba(147,51,234,0.05)' },
                  },
                  y: {
                    ticks: { color: '#9ca3af' },
                    grid: { color: 'rgba(147,51,234,0.05)' },
                  },
                },
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </ChartCard>

          <ChartCard title="Student Performance Distribution">
            <Doughnut
              data={performanceData}
              options={{
                plugins: {
                  legend: { labels: { color: '#fff' } },
                },
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </ChartCard>

        </div>
      </div>
    </Layout>
  )
}

/* ============================
      REUSABLE COMPONENTS
============================ */

function StatCard({ value, label, icon, gradient }: any) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-lg shadow-black/30`}
    >
      <div className="mb-2">{icon}</div>
      <div className="text-4xl font-black">{value}</div>
      <p className="text-white/80 font-semibold">{label}</p>
    </div>
  )
}

function ChartCard({ title, children }: any) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl border border-purple-500/20 shadow-xl h-[350px]">
      <h2 className="text-xl font-black text-white mb-4">{title}</h2>
      <div className="h-[260px]">{children}</div>
    </div>
  )
}
