'use client'

import { useState, useEffect } from 'react'
import {
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
} from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null)
  const [quizAnswers, setQuizAnswers] = useState<any>({})
  const [quizResult, setQuizResult] = useState<any>(null)
  const [timeStarted, setTimeStarted] = useState<Date | null>(null)

  useEffect(() => {
    loadQuizzes()
  }, [])

  const loadQuizzes = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/public/quizzes')
      const data = res.data || {}

      const quizList =
        data.data?.quizzes ||
        data.data ||
        data.quizzes ||
        []

      setQuizzes(Array.isArray(quizList) ? quizList : [])

      if (quizList.length > 0) toast.success(`${quizList.length} quizzes loaded!`)
    } catch (error: any) {
      const fallback = [
        {
          id: 1,
          title: 'General Knowledge Quiz',
          description: 'Test your general knowledge',
          questions: [
            { id: 1, question: 'What is the capital of India?', options: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'], correct: 1 },
            { id: 2, question: 'Who wrote "Romeo and Juliet"?', options: ['Shakespeare', 'Dickens', 'Tolstoy', 'Hemingway'], correct: 0 },
            { id: 3, question: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correct: 1 },
          ],
        },
        {
          id: 2,
          title: 'Science Quiz',
          description: 'Test your science knowledge',
          questions: [
            { id: 1, question: 'Chemical symbol of water?', options: ['H2O', 'CO2', 'O2', 'NaCl'], correct: 0 },
            { id: 2, question: 'The Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correct: 1 },
            { id: 3, question: 'Speed of light?', options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'], correct: 0 },
          ],
        },
      ]

      setQuizzes(fallback)
      toast.error('Unable to load quizzes. Showing sample quizzes.')
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = (quiz: any) => {
    setSelectedQuiz(quiz)
    setQuizAnswers({})
    setQuizResult(null)
    setTimeStarted(new Date())
  }

  const submitQuiz = () => {
    if (!selectedQuiz) return

    let score = 0
    const total = selectedQuiz.questions.length
    const correctAnswers: any = {}

    selectedQuiz.questions.forEach((q: any) => {
      correctAnswers[q.id] = q.correct
      if (quizAnswers[q.id] === q.correct) score++
    })

    const percentage = Math.round((score / total) * 100)
    const timeTaken = timeStarted
      ? Math.round((new Date().getTime() - timeStarted.getTime()) / 1000)
      : 0

    setQuizResult({
      score,
      total,
      percentage,
      correctAnswers,
      timeTaken,
    })

    let msg = `Score: ${score}/${total} (${percentage}%)`
    if (percentage >= 80) msg += ' 🎉 Excellent!'
    else if (percentage >= 60) msg += ' 👍 Good job!'
    else msg += ' 💪 Keep practicing!'

    toast.success(msg)
  }

  const resetQuiz = () => {
    setSelectedQuiz(null)
    setQuizAnswers({})
    setQuizResult(null)
    setTimeStarted(null)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="bg-black/80 backdrop-blur-xl border-b border-green-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/public" className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur opacity-75 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-xl">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">YDS EduAI</span>
                <p className="text-xs text-green-400">Free Student Mode</p>
              </div>
            </Link>

            <Link href="/auth/login" className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold">
              Login
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/public" className="inline-flex items-center space-x-2 text-green-400 mb-8">
          <ArrowLeft className="h-5 w-5" />
          Back to Services
        </Link>

        <div className="max-w-4xl mx-auto">
          {!selectedQuiz ? (
            <QuizList quizzes={quizzes} loading={loading} startQuiz={startQuiz} />
          ) : quizResult ? (
            <QuizResults quiz={selectedQuiz} quizAnswers={quizAnswers} quizResult={quizResult} resetQuiz={resetQuiz} />
          ) : (
            <QuizTaking selectedQuiz={selectedQuiz} quizAnswers={quizAnswers} setQuizAnswers={setQuizAnswers} submitQuiz={submitQuiz} resetQuiz={resetQuiz} />
          )}
        </div>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------
   QUIZ LIST COMPONENT
---------------------------------------------------------- */
function QuizList({ quizzes, loading, startQuiz }: any) {
  if (loading)
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-10 w-10 border-b-2 border-green-400 mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading quizzes...</p>
      </div>
    )

  if (quizzes.length === 0)
    return (
      <div className="text-center py-12 text-gray-400">
        No quizzes available.
      </div>
    )

  return (
    <div className="space-y-6">
      {quizzes.map((quiz: any) => (
        <div
          key={quiz.id}
          className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-green-500/20 p-6 hover:border-green-500/50 cursor-pointer"
          onClick={() => startQuiz(quiz)}
        >
          <h3 className="text-2xl font-black mb-2">{quiz.title}</h3>
          <p className="text-gray-400 mb-4">{quiz.description}</p>
          <div className="text-sm text-gray-500">{quiz.questions?.length || 0} questions</div>
        </div>
      ))}
    </div>
  )
}

/* ----------------------------------------------------------
   QUIZ TAKING COMPONENT
---------------------------------------------------------- */
function QuizTaking({ selectedQuiz, quizAnswers, setQuizAnswers, submitQuiz, resetQuiz }: any) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-green-500/30 p-8 rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black">{selectedQuiz.title}</h2>
        <button onClick={resetQuiz} className="px-4 py-2 bg-gray-800 rounded-lg text-gray-300">
          Back
        </button>
      </div>

      <div className="space-y-8">
        {selectedQuiz.questions.map((q: any, idx: number) => (
          <div key={q.id} className="p-6 bg-black/50 rounded-xl border border-green-500/20">
            <p className="text-lg font-bold mb-4">
              {idx + 1}. {q.question}
            </p>

            <div className="space-y-2">
              {q.options.map((opt: string, i: number) => (
                <label
                  key={i}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                    quizAnswers[q.id] === i ? 'bg-green-600/20 border border-green-500' : 'bg-gray-800'
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={quizAnswers[q.id] === i}
                    onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: i })}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={submitQuiz}
        disabled={Object.keys(quizAnswers).length < selectedQuiz.questions.length}
        className="mt-8 w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-black disabled:opacity-40"
      >
        Submit Quiz
      </button>
    </div>
  )
}

/* ----------------------------------------------------------
   QUIZ RESULTS COMPONENT
---------------------------------------------------------- */
function QuizResults({ quiz, quizAnswers, quizResult, resetQuiz }: any) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-green-500/30 p-8 rounded-2xl">
      <div className="text-center mb-8">
        <div
          className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center ${
            quizResult.percentage >= 80
              ? 'bg-green-500/20'
              : quizResult.percentage >= 60
              ? 'bg-yellow-500/20'
              : 'bg-red-500/20'
          }`}
        >
          <Trophy className="w-12 h-12 text-yellow-400" />
        </div>

        <h2 className="text-4xl font-black mt-4">{quizResult.percentage}%</h2>
        <p className="text-gray-300 text-xl mt-2">
          {quizResult.score} / {quizResult.total} correct
        </p>

        <p className="text-gray-400 mt-3">
          Time: {Math.floor(quizResult.timeTaken / 60)}m {quizResult.timeTaken % 60}s
        </p>
      </div>

      <div className="space-y-4">
        {quiz.questions.map((q: any) => {
          const isCorrect = quizAnswers[q.id] === q.correct

          return (
            <div
              key={q.id}
              className={`p-4 rounded-xl ${
                isCorrect
                  ? 'bg-green-500/10 border border-green-500/20'
                  : 'bg-red-500/10 border border-red-500/20'
              }`}
            >
              <p className="font-bold mb-2">{q.question}</p>

              {q.options.map((opt: string, idx: number) => (
                <div
                  key={idx}
                  className={`p-2 rounded ${
                    idx === q.correct
                      ? 'bg-green-500/20 text-green-400'
                      : idx === quizAnswers[q.id]
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {opt}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      <button
        onClick={resetQuiz}
        className="mt-8 w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-black"
      >
        <RotateCcw className="inline-block mr-2" />
        Take Another Quiz
      </button>
    </div>
  )
}
