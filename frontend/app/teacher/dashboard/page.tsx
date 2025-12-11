export const dynamic = "force-dynamic";

'use client'

import Layout from '@/components/AppShell'
import Link from 'next/link'
import {
  BookOpen,
  Upload,
  BarChart3,
  Users,
  FileText,
  Zap,
  ArrowRight,
} from 'lucide-react'

export default function TeacherDashboard() {
  
  const services = [
    {
      icon: Upload,
      title: 'Upload Materials',
      desc: 'Upload PDFs, PPTs, Notes for AI',
      href: '/teacher/upload',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: BookOpen,
      title: 'AI Quiz Generator',
      desc: 'Generate quizzes automatically',
      href: '/teacher/quiz',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: 'Classroom Manager',
      desc: 'Track student activity & behaviour',
      href: '/teacher/classroom',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      desc: 'View student performance insights',
      href: '/teacher/analytics',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Zap,
      title: 'AI Tools',
      desc: 'Generate study materials instantly',
      href: '/teacher/ai-tools',
      gradient: 'from-pink-500 to-red-500',
    },
    {
      icon: FileText,
      title: 'Content Library',
      desc: 'Manage uploaded teaching content',
      href: '/teacher/content',
      gradient: 'from-indigo-500 to-purple-500',
    },
  ]

  return (
    <Layout>
      <div className="px-4 py-6">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            Teacher Dashboard
          </h1>
          <p className="text-purple-400">
            Manage your classes & AI-powered tools
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <Link
                key={index}
                href={service.href}
                className="
                  group relative bg-gradient-to-br from-gray-900 to-black p-6
                  rounded-2xl border border-purple-500/20
                  hover:border-purple-500/50 
                  hover:shadow-2xl hover:shadow-purple-500/20 
                  hover:scale-[1.03] transition-all duration-300
                "
              >

                {/* Glow Effect */}
                <div
                  className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${service.gradient}
                  opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition`}
                />

                {/* Icon Box */}
                <div
                  className={`relative bg-gradient-to-br ${service.gradient}
                  w-14 h-14 rounded-xl flex items-center justify-center mb-4
                  group-hover:scale-110 group-hover:rotate-6 transition-transform`}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-black text-white mb-2">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 mb-4 text-sm">
                  {service.desc}
                </p>

                {/* Arrow */}
                <div className="
                  flex items-center text-purple-400 opacity-0 
                  group-hover:opacity-100 transition
                ">
                  <span className="text-sm font-bold">Access</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>

              </Link>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
