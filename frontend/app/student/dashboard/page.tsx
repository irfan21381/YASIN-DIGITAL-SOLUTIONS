
'use client';

export const dynamic = 'force-dynamic' // optional but good for react-query pages



import Layout from '@/components/AppShell'
import { useAuthStore } from '@/lib/store'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import Link from 'next/link'

import {
  BookOpen,
  FileText,
  Code,
  BarChart3,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Loader2,
  Shield,
  Trophy,
  Flame,
  Star,
} from 'lucide-react'

// ------------------------
// Types (PostgreSQL style)
// ------------------------
interface StudentContent {
  id: string | number
  title: string
  type?: string
}

interface StudentQuiz {
  id: string | number
  title: string
  settings?: {
    duration?: number
  }
  questions?: any[]
}

// ------------------------
// Data Fetch Hooks
// ------------------------
const useStudentContent = () =>
  useQuery<StudentContent[]>({
    queryKey: ['student-content'],
    queryFn: async () => {
      const res = await api.get('/content') // adjust to /api/... if your backend uses that
      return res.data?.data || []
    },
  })

const useStudentQuizzes = () =>
  useQuery<StudentQuiz[]>({
    queryKey: ['student-quizzes'],
    queryFn: async () => {
      const res = await api.get('/quiz') // adjust to /api/... if needed
      return res.data?.data || []
    },
  })

// ------------------------
// Services List
// ------------------------
const services = [
  {
    icon: MessageSquare,
    title: 'AI Doubt Solver',
    desc: 'Chat with AI trained on teacher materials.',
    href: '/student/doubt-solver',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: BookOpen,
    title: 'AI Quiz Center',
    desc: 'Practice quizzes with anti-cheat.',
    href: '/student/quiz',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: FileText,
    title: 'AI Notes',
    desc: 'Generate exam-focused notes & Q&A.',
    href: '/student/notes',
    gradient: 'from-pink-500 to-red-500',
  },
  {
    icon: Code,
    title: 'Coding Lab',
    desc: 'Run code and get AI explanations.',
    href: '/student/coding-lab',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Sparkles,
    title: 'AI Mentor',
    desc: 'Personalized study roadmap.',
    href: '/student/mentor',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    desc: 'View scores, streak, and progress.',
    href: '/student/analytics',
    gradient: 'from-indigo-500 to-purple-500',
  },
]

export default function StudentDashboard() {
  const { user } = useAuthStore()

  const {
    data: content,
    isLoading: contentLoading,
    isError: contentError,
  } = useStudentContent()

  const {
    data: quizzes,
    isLoading: quizzesLoading,
    isError: quizzesError,
  } = useStudentQuizzes()

  const isLoading = contentLoading || quizzesLoading
  const isError = contentError || quizzesError

  const quizCount = quizzes?.length ?? 0
  const contentCount = content?.length ?? 0

  // simple gamification demo
  const streakDays = 3
  const xpLevel = 12
  const xpPercent = 65

  // ------------------------
  // Loading UI
  // ------------------------
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-white">
          <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
          <p className="mt-4 text-lg text-gray-400">
            Preparing your AI powered dashboard...
          </p>
        </div>
      </Layout>
    )
  }

  // ------------------------
  // Error UI
  // ------------------------
  if (isError) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-white">
          <Shield className="h-12 w-12 text-red-500" />
          <p className="mt-4 text-lg text-red-400">
            Error loading dashboard. Please refresh.
          </p>
        </div>
      </Layout>
    )
  }

  // ------------------------
  // FINAL UI
  // ------------------------
  return (
    <Layout>
      <div className="space-y-8">

        {/* ----------------------------------------------------
            TOP SECTION
        ---------------------------------------------------- */}
        <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          {/* Greeting Card */}
          <div className="flex-1 bg-gradient-to-br from-purple-900/70 via-black to-pink-900/60 rounded-3xl border border-purple-500/30 p-6 md:p-7 shadow-[0_0_50px_rgba(168,85,247,0.2)]">

            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-lg opacity-60 rounded-2xl" />
                  <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                </div>

                <div>
                  <p className="text-sm text-purple-200 uppercase tracking-[0.18em] font-semibold">
                    YDS EDUAI
                  </p>
                  <h1 className="text-3xl md:text-4xl font-black text-white mt-1 leading-tight">
                    Welcome back{' '}
                    {user?.name?.split(' ')[0] ||
                      user?.email?.split('@')[0] ||
                      'Student'}{' '}
                    👋
                  </h1>
                </div>
              </div>
            </div>

            <p className="text-sm md:text-base text-gray-300 max-w-xl">
              Your AI copilot is ready. Strengthen weak topics and track your progress.
            </p>

            {/* XP + Streak */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* XP */}
              <div className="bg-black/40 border border-purple-500/30 rounded-2xl px-4 py-3">
                <p className="text-xs text-gray-400 uppercase">Learning Level</p>
                <p className="text-lg font-bold text-white flex items-center space-x-2">
                  <span>Level {xpLevel}</span>
                  <Star className="h-4 w-4 text-yellow-400" />
                </p>

                <div className="w-full h-2 rounded-full bg-purple-900/60 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>

                <p className="text-xs text-gray-400">{xpPercent}% to next level</p>
              </div>

              {/* Streak */}
              <div className="bg-black/40 border border-amber-500/40 rounded-2xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Study Streak
                  </p>
                  <p className="text-lg font-bold text-white flex items-center space-x-2">
                    <span>{streakDays} days</span>
                    <Flame className="h-4 w-4 text-orange-400" />
                  </p>
                  <p className="text-xs text-amber-200">
                    Keep going! Don’t break the chain 🔥
                  </p>
                </div>
                <Trophy className="h-10 w-10 text-yellow-300 opacity-80" />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="w-full lg:w-[280px] space-y-4">

            <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl border border-slate-700/60 p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                Snapshot
              </p>
              <p className="text-sm text-gray-300 mb-4">
                Quick summary of your AI resources.
              </p>

              <div className="space-y-3">

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-purple-300" />
                    <span>Quizzes</span>
                  </span>
                  <span className="text-xl font-extrabold text-white">
                    {quizCount}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-300" />
                    <span>Materials</span>
                  </span>
                  <span className="text-xl font-extrabold text-white">
                    {contentCount}
                  </span>
                </div>

              </div>
            </div>

            {/* Achievement */}
            <div className="bg-gradient-to-br from-yellow-900/70 to-amber-900/70 rounded-3xl border border-yellow-500/40 p-4 flex items-center space-x-3">
              <Trophy className="h-8 w-8 text-yellow-300" />
              <div className="space-y-1">
                <p className="text-xs text-yellow-200 uppercase tracking-wide">
                  Achievement
                </p>
                <p className="text-sm text-yellow-100">
                  Complete 1 quiz today to unlock a new badge.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ----------------------------------------------------
            AI SERVICES
        ---------------------------------------------------- */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-black text-white">
              <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
                AI Services & Tools
              </span>
            </h2>
            <p className="text-xs md:text-sm text-gray-400">
              Powered by your teacher content.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <Link
                  key={index}
                  href={service.href}
                  className="group relative overflow-hidden bg-gradient-to-br from-[#050608] to-[#05020b] rounded-2xl border border-purple-500/20 hover:border-purple-400/70 transition-all duration-300 hover:shadow-[0_0_50px_rgba(139,92,246,0.25)] p-5"
                >
                  <div
                    className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${service.gradient} opacity-20 group-hover:opacity-40 blur-2xl transition`}
                  />

                  <div className="relative space-y-3">
                    <div
                      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${service.gradient} w-11 h-11`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 transition">
                      {service.title}
                    </h3>

                    <p className="text-sm text-gray-400">{service.desc}</p>

                    <div className="flex items-center text-purple-300 text-xs font-semibold pt-2">
                      <span>Open tool</span>
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ----------------------------------------------------
            RECENT CONTENT + QUIZZES
        ---------------------------------------------------- */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ContentBlock content={content} />
          <QuizBlock quizzes={quizzes} />
        </section>

      </div>
    </Layout>
  )
}

// ------------------------
// Recent Content Component
// ------------------------
function ContentBlock({ content }: { content?: StudentContent[] }) {
  return (
    <div className="bg-gradient-to-br from-gray-950 to-gray-900 rounded-2xl border border-purple-500/20 p-5">

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-black text-white">Recent Content</h2>
        <FileText className="h-5 w-5 text-purple-400" />
      </div>

      <p className="text-xs text-gray-400 mb-4">
        New materials uploaded by your teachers.
      </p>

      {content && content.length > 0 ? (
        <div className="space-y-3">
          {content.slice(0, 5).map((item) => (
            <Link
              key={item.id}
              href={`/student/content/${item.id}`}
              className="block rounded-xl px-4 py-3 bg-black/40 border border-purple-500/10 hover:bg-purple-500/10 hover:border-purple-400/50 transition group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white group-hover:text-purple-200">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {item.type || 'Material'}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-300 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center py-6">
          No content available yet.
        </p>
      )}
    </div>
  )
}

// ------------------------
// Recent Quizzes Component
// ------------------------
function QuizBlock({ quizzes }: { quizzes?: StudentQuiz[] }) {
  return (
    <div className="bg-gradient-to-br from-gray-950 to-gray-900 rounded-2xl border border-blue-500/20 p-5">

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-black text-white">Available Quizzes</h2>
        <BookOpen className="h-5 w-5 text-blue-400" />
      </div>

      <p className="text-xs text-gray-400 mb-4">
        Take a quiz to boost your XP and streak.
      </p>

      {quizzes && quizzes.length > 0 ? (
        <div className="space-y-3">
          {quizzes.slice(0, 5).map((quiz) => (
            <Link
              key={quiz.id}
              href={`/student/quiz/${quiz.id}`}
              className="block rounded-xl px-4 py-3 bg-black/40 border border-blue-500/10 hover:bg-blue-500/10 hover:border-blue-400/50 transition group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white group-hover:text-blue-200">
                    {quiz.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {quiz.settings?.duration || 60} min •{' '}
                    {quiz.questions?.length || 0} questions
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-300 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center py-6">
          No quizzes available yet.
        </p>
      )}
    </div>
  )
}
