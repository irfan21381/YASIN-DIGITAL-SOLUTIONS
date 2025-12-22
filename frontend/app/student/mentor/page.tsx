'use client'

export const dynamic = 'force-dynamic'

import Layout from '@/components/AppShell'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Sparkles, BookOpen, Target, Lightbulb } from 'lucide-react'

export default function MentorPage() {
  /* ------------------------------
     SAFE MENTOR DATA FETCH
  ------------------------------ */
  const { data, isLoading, isError } = useQuery({
    queryKey: ['ai-mentor'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/ai/mentor')

        const raw =
          res?.data?.data ??
          res?.data?.mentor ??
          res?.data ??
          {}

        return {
          recommendations:
            typeof raw.recommendations === 'string'
              ? raw.recommendations
              : '',
          weakTopics: Array.isArray(raw.weakTopics) ? raw.weakTopics : [],
          unitSummaries: Array.isArray(raw.unitSummaries)
            ? raw.unitSummaries
            : [],
        }
      } catch {
        return {
          recommendations: '',
          weakTopics: [],
          unitSummaries: [],
        }
      }
    },
  })

  const recommendations =
    data?.recommendations?.trim()
      ? data.recommendations
      : 'No recommendations available yet.'

  const weakTopics = data?.weakTopics ?? []
  const unitSummaries = data?.unitSummaries ?? []

  return (
    <Layout>
      <div className="px-4 py-6 max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-3 rounded-xl shadow-lg shadow-yellow-600/20">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">AI Mentor</h1>
              <p className="text-yellow-400">
                Your Personalized Learning Guide
              </p>
            </div>
          </div>
        </div>

        {/* LOADING */}
        {isLoading && (
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/20 p-12 text-center">
            <Sparkles className="h-16 w-16 text-purple-400 mx-auto mb-4 opacity-50 animate-pulse" />
            <p className="text-gray-400">
              Loading your personalized mentor recommendations…
            </p>
          </div>
        )}

        {/* ERROR */}
        {isError && (
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-red-500/20 p-12 text-center">
            <p className="text-red-400">
              Unable to load mentor data. Please try again.
            </p>
          </div>
        )}

        {/* DATA */}
        {!isLoading && !isError && (
          <div className="space-y-8">

            {/* RECOMMENDATIONS */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-yellow-500/20 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Lightbulb className="h-6 w-6 text-yellow-400" />
                <h2 className="text-2xl font-black text-white">
                  Personalized Recommendations
                </h2>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {recommendations}
              </p>
            </div>

            {/* WEAK TOPICS */}
            {weakTopics.length > 0 && (
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-red-500/20 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="h-6 w-6 text-red-400" />
                  <h2 className="text-2xl font-black text-white">
                    Weak Topics to Focus On
                  </h2>
                </div>

                <div className="flex flex-wrap gap-3">
                  {weakTopics.map((topic: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 font-semibold text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* UNIT SUMMARIES */}
            {unitSummaries.length > 0 && (
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-blue-500/20 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <BookOpen className="h-6 w-6 text-blue-400" />
                  <h2 className="text-2xl font-black text-white">
                    Unit Summaries
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {unitSummaries.map((unit: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 bg-black/50 rounded-lg border border-blue-500/20 hover:bg-blue-500/5 transition"
                    >
                      <h3 className="font-bold text-white mb-1">
                        {unit?.title ?? 'Untitled Unit'}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Unit {unit?.unit ?? '-'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EMPTY STATE */}
            {!weakTopics.length &&
              !unitSummaries.length &&
              recommendations === 'No recommendations available yet.' && (
                <div className="bg-black/40 rounded-xl border border-gray-700 p-6 text-gray-400 text-center">
                  No mentor data available yet. Complete activities to generate
                  insights.
                </div>
              )}
          </div>
        )}
      </div>
    </Layout>
  )
}
