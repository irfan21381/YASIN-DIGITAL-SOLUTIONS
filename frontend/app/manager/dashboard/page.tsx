export const dynamic = "force-dynamic";

'use client'

import Layout from '@/components/AppShell'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import Link from 'next/link'
import { Users, BookOpen, FileText, ArrowRight } from 'lucide-react'

export default function ManagerDashboard() {
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['manager-dashboard'],
    queryFn: () =>
      api.get('/api/manager/dashboard').then((res) => res.data.data),
  })

  const links = [
    { icon: Users, title: 'Students', href: '/manager/students', count: stats?.students || 0 },
    { icon: Users, title: 'Teachers', href: '/manager/teachers', count: stats?.teachers || 0 },
    { icon: FileText, title: 'Content', href: '/manager/content', count: stats?.content || 0 },
    { icon: BookOpen, title: 'Subjects', href: '/manager/subjects', count: stats?.subjects || 0 },
  ]

  return (
    <Layout>
      <div className="px-4 py-6">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            Manager Dashboard
          </h1>
          <p className="text-purple-400">College Management Portal</p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading
            ? [...Array(4)].map((_, i) => <LoadingCard key={i} />)
            : links.map((link, idx) => <DashboardCard key={idx} {...link} />)}
        </div>

      </div>
    </Layout>
  )
}

/* ========================
   REUSABLE DASHBOARD CARD
======================== */
function DashboardCard({ icon: Icon, title, href, count }: any) {
  return (
    <Link
      href={href}
      className="
        relative bg-gradient-to-br from-gray-900 to-black rounded-2xl
        border border-purple-500/20 hover:border-purple-500/60
        transition-all p-6 group shadow-lg hover:shadow-purple-600/20
      "
    >
      {/* Glow */}
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-purple-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-50 transition"></div>

      <div className="flex items-center justify-between mb-4">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl shadow-lg shadow-purple-500/30">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <span className="text-3xl font-black text-white">{count}</span>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>

      <div className="flex items-center text-purple-400 opacity-0 group-hover:opacity-100 transition-all">
        <span className="text-sm font-bold">Manage</span>
        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  )
}

/* ======================
   LOADING SKELETON CARD
====================== */
function LoadingCard() {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-purple-500/20 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="w-12 h-12 bg-gray-700 rounded-xl" />
        <div className="w-10 h-8 bg-gray-700 rounded" />
      </div>
      <div className="w-32 h-5 bg-gray-700 rounded mb-2" />
      <div className="w-20 h-4 bg-gray-700 rounded" />
    </div>
  )
}
