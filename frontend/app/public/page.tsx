'use client'

import { useState, FormEvent } from 'react'
import {
  Brain,
  Code,
  BookOpen,
  ArrowRight,
  Sparkles,
  Rocket,
  Send,
  Play,
  Loader2,
  Trophy,
} from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function PublicPage() {
  /* ----------------------------------------
     STATES
  ---------------------------------------- */

  // Doubt Solver
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [doubtLoading, setDoubtLoading] = useState(false)

  // Coding Lab
  const [code, setCode] = useState('print("Hello, World!")')
  const [language, setLanguage] = useState('python')
  const [output, setOutput] = useState('')
  const [codeLoading, setCodeLoading] = useState(false)

  // Quizzes
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [quizLoading, setQuizLoading] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null)
  const [quizAnswers, setQuizAnswers] = useState<any>({})
  const [quizResult, setQuizResult] = useState<any>(null)

  // Career Guidance
  const [interests, setInterests] = useState('')
  const [skills, setSkills] = useState('')
  const [education, setEducation] = useState('')
  const [guidance, setGuidance] = useState('')
  const [guidanceLoading, setGuidanceLoading] = useState(false)

  /* ----------------------------------------
     AI DOUBT SOLVER
  ---------------------------------------- */

  const handleDoubtSolver = async (e: FormEvent) => {
    e.preventDefault()

    if (!question.trim()) {
      toast.error('Please enter a question')
      return
    }

    setDoubtLoading(true)

    try {
      const res = await api.post('/public/doubt-solver', { question })
      const data = res.data || {}

      const answerText =
        data.data?.answer ||
        data.answer ||
        data.output ||
        'Answer received!'

      setAnswer(answerText)
      toast.success('Answer received!')
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message ||
        'Failed to get answer'

      toast.error(errMsg)
      setAnswer('Sorry, I could not process your question.')
    } finally {
      setDoubtLoading(false)
    }
  }

  /* ----------------------------------------
     CODING LAB
  ---------------------------------------- */

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code')
      return
    }

    setOutput('')
    setCodeLoading(true)

    try {
      const res = await api.post('/public/coding-lab', {
        code,
        language,
        input: '',
      })

      const data = res.data || {}

      const result =
        data.stdout ||
        data.output ||
        data.data?.output ||
        data.data?.stdout ||
        data.message ||
        'Code executed successfully!'

      setOutput(result)
      toast.success('Code executed!')
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || 'Code execution failed'
      toast.error(errMsg)
      setOutput('Error: ' + errMsg)
    } finally {
      setCodeLoading(false)
    }
  }

  /* ----------------------------------------
     QUIZZES - SAMPLE
  ---------------------------------------- */

  const loadQuizzes = () => {
    setQuizLoading(true)

    const sample = [
      {
        id: 1,
        title: 'General Knowledge Quiz',
        questions: [
          {
            id: 1,
            question: 'What is the capital of India?',
            options: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'],
            correct: 1,
          },
          {
            id: 2,
            question: 'Who wrote "Romeo and Juliet"?',
            options: ['Shakespeare', 'Dickens', 'Tolstoy', 'Hemingway'],
            correct: 0,
          },
        ],
      },
      {
        id: 2,
        title: 'Science Quiz',
        questions: [
          {
            id: 1,
            question: 'Chemical symbol for water?',
            options: ['H2O', 'CO2', 'O2', 'NaCl'],
            correct: 0,
          },
        ],
      },
    ]

    setQuizzes(sample)
    setSelectedQuiz(null)
    setQuizAnswers({})
    setQuizResult(null)
    setQuizLoading(false)
    toast.success('Sample quizzes loaded!')
  }

  const startQuiz = (quiz: any) => {
    setSelectedQuiz(quiz)
    setQuizAnswers({})
    setQuizResult(null)
  }

  const submitQuiz = () => {
    if (!selectedQuiz) return

    let score = 0
    const total = selectedQuiz.questions.length

    selectedQuiz.questions.forEach((q: any) => {
      if (quizAnswers[q.id] === q.correct) {
        score++
      }
    })

    const percentage = Math.round((score / total) * 100)
    setQuizResult({ score, total, percentage })

    toast.success(`Score: ${score}/${total} (${percentage}%)`)
  }

  /* ----------------------------------------
     CAREER GUIDANCE
  ---------------------------------------- */

  const handleCareerGuidance = async (e: FormEvent) => {
    e.preventDefault()

    if (!interests.trim() || !skills.trim() || !education.trim()) {
      toast.error('Fill all fields')
      return
    }

    setGuidanceLoading(true)

    try {
      const res = await api.post('/public/career-guidance', {
        interests,
        skills,
        education,
      })

      const data = res.data || {}

      const result =
        data.data?.guidance ||
        data.guidance ||
        data.output ||
        'Guidance received!'

      setGuidance(result)
      toast.success('Career guidance generated!')
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message ||
        'Failed to get career guidance'

      toast.error(errMsg)
      setGuidance('Sorry, I could not generate guidance.')
    } finally {
      setGuidanceLoading(false)
    }
  }

  /* ----------------------------------------
     UI
  ---------------------------------------- */

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Navigation */}
      <nav className="bg-black/80 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            <Link href="/" className="flex items-center space-x-3">
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
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all font-bold"
            >
              Login
            </Link>

          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 px-6 py-3 rounded-full mb-8">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            <span className="text-yellow-400 font-bold">Free Access - No Login Required</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Free Student Mode
            </span>
          </h1>

          <p className="text-2xl text-gray-300 mb-8">
            Access AI-powered learning tools for free. Perfect for students across India.
          </p>
        </div>
      </section>

      {/* SERVICES (LINK CARDS) */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

          {/* AI Doubt Solver */}
          <Link href="/public/doubt-solver" className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/20 p-8 hover:border-purple-500/50 transition group">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-black text-white mb-4">AI Doubt Solver</h3>
            <p className="text-gray-400 mb-6">Get instant answers to your educational questions</p>
            <div className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:shadow-lg font-bold text-center">
              Open Doubt Solver →
            </div>
          </Link>

          {/* Coding Lab */}
          <Link href="/public/coding-lab" className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-blue-500/20 p-8 hover:border-blue-500/50 transition group">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Code className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-black text-white mb-4">Coding Lab</h3>
            <p className="text-gray-400 mb-6">Practice coding with AI assistance</p>
            <div className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl hover:shadow-lg font-bold text-center">
              Open Coding Lab →
            </div>
          </Link>

          {/* Free Quizzes */}
          <Link href="/public/quizzes" className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-green-500/20 p-8 hover:border-green-500/50 transition group">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-black text-white mb-4">Free Quizzes</h3>
            <p className="text-gray-400 mb-6">Test your knowledge with free quizzes</p>
            <div className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:shadow-lg font-bold text-center">
              Open Quizzes →
            </div>
          </Link>

          {/* Career Guidance */}
          <Link href="/public/career-guidance" className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-yellow-500/20 p-8 hover:border-yellow-500/50 transition group">
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Rocket className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-black text-white mb-4">Career Guidance</h3>
            <p className="text-gray-400 mb-6">Get personalized career advice</p>
            <div className="w-full px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl hover:shadow-lg font-bold text-center">
              Open Career Guidance →
            </div>
          </Link>

        </div>
      </section>

      {/* INLINE TOOLS PREVIEW (USES ALL LOGIC) */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/10">
        <h2 className="text-3xl font-black mb-6 text-center">
          Try Tools Directly (Demo Mode)
        </h2>
        <p className="text-center text-gray-400 mb-10 text-sm max-w-2xl mx-auto">
          These are quick demo versions of the tools. For full-screen experience, use the cards above.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Inline Doubt Solver */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/30 p-6">
            <div className="flex items-center mb-4 space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-10 h-10 rounded-xl flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black">Mini Doubt Solver</h3>
                <p className="text-xs text-gray-400">Ask one small doubt and get AI answer.</p>
              </div>
            </div>

            <form onSubmit={handleDoubtSolver} className="space-y-3">
              <textarea
                className="w-full px-3 py-2 bg-black/60 border border-purple-500/40 rounded-lg text-sm"
                placeholder="e.g., Explain cloud computing in simple words..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
              />
              <button
                type="submit"
                disabled={doubtLoading || !question.trim()}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-sm font-bold disabled:opacity-50"
              >
                {doubtLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Getting Answer...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" /> Get Answer
                  </>
                )}
              </button>
            </form>

            {answer && (
              <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg max-h-48 overflow-auto text-sm text-gray-100 whitespace-pre-wrap">
                {answer}
              </div>
            )}
          </div>

          {/* Inline Coding Lab */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-blue-500/30 p-6">
            <div className="flex items-center mb-4 space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 w-10 h-10 rounded-xl flex items-center justify-center">
                <Code className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black">Mini Coding Lab</h3>
                <p className="text-xs text-gray-400">Run small code snippets instantly.</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-1.5 bg-black/60 border border-blue-500/40 rounded-lg text-xs"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="node">Node.js</option>
                <option value="java">Java</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
              </select>

              <button
                onClick={handleRunCode}
                disabled={codeLoading || !code.trim()}
                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-xs font-bold disabled:opacity-50"
              >
                {codeLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" /> Run Code
                  </>
                )}
              </button>
            </div>

            <textarea
              className="w-full h-28 px-3 py-2 bg-black/60 border border-blue-500/40 rounded-lg text-xs font-mono"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <div className="mt-3 text-xs text-gray-300">
              <div className="mb-1 font-semibold">Output:</div>
              <div className="h-20 bg-black/60 border border-blue-500/30 rounded-lg px-3 py-2 overflow-auto font-mono whitespace-pre-wrap">
                {output || <span className="text-gray-500">Run code to see output...</span>}
              </div>
            </div>
          </div>

          {/* Inline Quiz */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-green-500/30 p-6">
            <div className="flex items-center mb-4 space-x-3">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 w-10 h-10 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
            <div>
                <h3 className="text-lg font-black">Mini Quiz</h3>
                <p className="text-xs text-gray-400">Practice with quick sample questions.</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <button
                onClick={loadQuizzes}
                disabled={quizLoading}
                className="px-3 py-1.5 bg-green-600/30 border border-green-500/40 rounded-lg text-xs font-bold"
              >
                {quizLoading ? 'Loading...' : 'Load Sample Quizzes'}
              </button>
              {quizResult && (
                <div className="text-xs text-green-400 font-bold">
                  Score: {quizResult.score}/{quizResult.total} ({quizResult.percentage}%)
                </div>
              )}
            </div>

            {/* Selected quiz or quiz list */}
            {!selectedQuiz ? (
              <div className="space-y-2">
                {quizzes.length === 0 && (
                  <p className="text-xs text-gray-500">
                    No quizzes loaded. Click &quot;Load Sample Quizzes&quot;.
                  </p>
                )}
                {quizzes.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => startQuiz(q)}
                    className="w-full text-left text-xs bg-black/60 border border-green-500/30 rounded-lg px-3 py-2 hover:bg-black/80"
                  >
                    {q.title} ({q.questions.length} questions)
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold">{selectedQuiz.title}</div>
                  <button
                    className="text-[10px] text-gray-400 underline"
                    onClick={() => {
                      setSelectedQuiz(null)
                      setQuizAnswers({})
                      setQuizResult(null)
                    }}
                  >
                    Change quiz
                  </button>
                </div>

                {selectedQuiz.questions.map((q: any, idx: number) => (
                  <div
                    key={q.id}
                    className="bg-black/60 border border-green-500/30 rounded-lg px-3 py-2"
                  >
                    <div className="text-xs font-semibold mb-1">
                      {idx + 1}. {q.question}
                    </div>
                    <div className="space-y-1">
                      {q.options.map((opt: string, i: number) => (
                        <label
                          key={i}
                          className={`flex items-center space-x-2 text-[11px] px-2 py-1 rounded cursor-pointer ${
                            quizAnswers[q.id] === i
                              ? 'bg-green-500/20 border border-green-500/60'
                              : 'bg-gray-900 border border-transparent'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            className="h-3 w-3"
                            checked={quizAnswers[q.id] === i}
                            onChange={() =>
                              setQuizAnswers({
                                ...quizAnswers,
                                [q.id]: i,
                              })
                            }
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={submitQuiz}
                  disabled={
                    !selectedQuiz ||
                    Object.keys(quizAnswers).length < selectedQuiz.questions.length
                  }
                  className="w-full mt-1 text-xs px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-bold disabled:opacity-40"
                >
                  Submit Quiz
                </button>
              </div>
            )}
          </div>

          {/* Inline Career Guidance */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-yellow-500/30 p-6">
            <div className="flex items-center mb-4 space-x-3">
              <div className="bg-gradient-to-r from-yellow-600 to-orange-600 w-10 h-10 rounded-xl flex items-center justify-center">
                <Rocket className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black">Mini Career Guidance</h3>
                <p className="text-xs text-gray-400">Quick AI suggestion based on your info.</p>
              </div>
            </div>

            <form onSubmit={handleCareerGuidance} className="space-y-2 text-xs">
              <input
                className="w-full px-3 py-2 bg-black/60 border border-yellow-500/40 rounded-lg"
                placeholder="Your interests (e.g., coding, design...)"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
              />
              <input
                className="w-full px-3 py-2 bg-black/60 border border-yellow-500/40 rounded-lg"
                placeholder="Your skills (e.g., Java, communication...)"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
              <input
                className="w-full px-3 py-2 bg-black/60 border border-yellow-500/40 rounded-lg"
                placeholder="Education (e.g., 10th, Inter, B.Tech...)"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
              />

              <button
                type="submit"
                disabled={guidanceLoading}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg text-xs font-bold disabled:opacity-50"
              >
                {guidanceLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" /> Get Career Guidance
                  </>
                )}
              </button>
            </form>

            {guidance && (
              <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/40 rounded-lg text-xs text-gray-100 max-h-40 overflow-auto whitespace-pre-wrap">
                {guidance}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-black text-white mb-4">Want Full Access?</h2>
          <p className="text-xl text-white/90 mb-8">Login to access all 15 AI services</p>

          <Link
            href="/auth/login"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-purple-600 rounded-xl hover:shadow-2xl font-black"
          >
            <span>Get Full Access</span>
            <ArrowRight className="h-5 w-5" />
          </Link>

        </div>
      </section>

    </div>
  )
}
