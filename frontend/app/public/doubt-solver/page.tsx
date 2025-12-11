'use client'

import { useState } from 'react'
import { Brain, ArrowLeft, Sparkles, Send } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function DoubtSolverPage() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  const [history, setHistory] = useState<
    Array<{ question: string; answer: string }>
  >([])

  // ======================================================
  // ⭐ FIXED: API route updated → /api/public/doubt-solver
  // ⭐ FIXED: More reliable AI answer extraction
  // ======================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!question.trim()) {
      toast.error('Please enter a question')
      return
    }

    setLoading(true)
    setAnswer('')

    try {
      const res = await api.post('/api/public/doubt-solver', { question })
      const data = res.data || {}

      console.log('AI Response:', data)

      // ============================
      // ⭐ Best possible answer extraction
      // ============================
      const answerText =
        data.data?.answer ||
        data.data?.output ||
        data.data?.output_text ||
        data.answer ||
        data.output ||
        data.response ||
        data.ai_answer ||
        'I generated an answer, but the response format was unexpected.'

      setAnswer(answerText)

      // Save to history (max 10)
      setHistory(prev =>
        [{ question, answer: answerText }, ...prev].slice(0, 10)
      )

      toast.success('Answer received!')
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to get AI answer'

      setAnswer(
        `❌ Error:\n${msg}\n\nPlease try again later or check AI key settings.`
      )

      toast.error('AI Request Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* NAVBAR */}
      <nav className="bg-black/80 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/public" className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-75 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
                  <Brain className="h-7 w-7 text-white" />
                </div>
              </div>

              <div>
                <span className="text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  YDS EduAI
                </span>
                <p className="text-xs text-purple-400">Free Student Mode</p>
              </div>
            </Link>

            <Link
              href="/auth/login"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition font-bold"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/public"
          className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Services</span>
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* HEADER */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl mb-6">
              <Brain className="h-10 w-10 text-white" />
            </div>

            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              AI Doubt Solver
            </h1>

            <p className="text-xl text-gray-300">
              Get instant & accurate explanations powered by AI
            </p>

            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 px-6 py-3 rounded-full mt-6">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-400 font-bold">
                Free – No Login Required
              </span>
            </div>
          </div>

          {/* MAIN CARD */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/20 p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <label className="block text-sm font-bold text-gray-300 mb-3">
                Ask Your Question
              </label>

              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="e.g., Explain OSI model, Difference between OOP and POP, What is AI?..."
                className="w-full px-6 py-4 bg-black/50 border border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 text-white text-lg"
                rows={5}
                disabled={loading}
              />

              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-black text-lg flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>Getting Answer...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Get Answer</span>
                  </>
                )}
              </button>
            </form>

            {/* ANSWER BOX */}
            {answer && (
              <div className="mt-8 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/30">
                <div className="flex items-center space-x-2 mb-4">
                  <Brain className="h-6 w-6 text-purple-400" />
                  <h3 className="text-xl font-black text-white">AI Answer</h3>
                </div>

                <p className="text-white whitespace-pre-wrap leading-relaxed text-lg">
                  {answer}
                </p>
              </div>
            )}
          </div>

          {/* HISTORY */}
          {history.length > 0 && (
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/20 p-8">
              <h3 className="text-2xl font-black mb-6">Recent Questions</h3>

              <div className="space-y-4">
                {history.map((item, i) => (
                  <div
                    key={i}
                    className="p-4 bg-black/50 rounded-xl border border-purple-500/10 hover:border-purple-500/30 transition"
                  >
                    <div className="font-semibold text-purple-400 mb-2">
                      Q: {item.question}
                    </div>
                    <div className="text-gray-300 text-sm line-clamp-2">
                      {item.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
