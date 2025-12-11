'use client'

import Layout from '@/components/AppShell'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { Clock, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function QuizPage() {
  const { id: quizId } = useParams()
  const router = useRouter()

  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [cheatingEvents, setCheatingEvents] = useState<any[]>([])
  const [autoSubmitted, setAutoSubmitted] = useState(false)

  /* =====================================================
      LOAD QUIZ (PostgreSQL-safe)
  ===================================================== */
  const { data: quiz } = useQuery({
    queryKey: ['quiz', quizId],
    enabled: !!quizId,
    queryFn: async () => {
      const res = await api.get(`/api/quiz/${quizId}`)
      const raw = res?.data?.data ?? res?.data ?? {}

      return {
        id: raw.id,
        title: raw.title ?? "Untitled Quiz",
        description: raw.description ?? "",
        settings: raw.settings ?? { duration: 60, totalMarks: 0 },
        questions: Array.isArray(raw.questions) ? raw.questions : [],
      }
    },
  })

  /* =====================================================
      START QUIZ
  ===================================================== */
  const startQuiz = useMutation({
    mutationFn: () => api.post(`/api/quiz/${quizId}/start`),
    onSuccess: (res) => {
      const attempt = res?.data?.data
      if (!attempt?.id) return toast.error("Failed to start quiz")

      setAttemptId(attempt.id)
      setTimeLeft((quiz?.settings?.duration ?? 60) * 60)
      toast.success("Quiz started!")
    },
    onError: () => toast.error("Error starting quiz"),
  })

  /* =====================================================
      ANTI-CHEAT
  ===================================================== */
  useEffect(() => {
    if (!attemptId) return

    const send = (eventType: string, details: string) => {
      const payload = {
        attemptId,
        eventType,
        details,
        time: Date.now(),
      }

      try {
        navigator.sendBeacon(
          `${window.location.origin}/api/quiz/anti-cheat`,
          JSON.stringify(payload)
        )
      } catch (_) {}

      setCheatingEvents((prev) => [...prev, payload])
    }

    const onHidden = () => send("tab_hidden", "User switched tab")
    const onVisible = () => send("tab_visible", "User returned to tab")
    const onBlur = () => send("window_blur", "User left window")

    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      send("copy_attempt", "Copy blocked")
    }

    const preventRightClick = (e: MouseEvent) => {
      e.preventDefault()
      send("right_click", "Right click blocked")
    }

    document.addEventListener("visibilitychange", () => {
      document.hidden ? onHidden() : onVisible()
    })
    window.addEventListener("blur", onBlur)
    document.addEventListener("copy", preventCopy)
    document.addEventListener("contextmenu", preventRightClick)

    return () => {
      document.removeEventListener("visibilitychange", onHidden)
      window.removeEventListener("blur", onBlur)
      document.removeEventListener("copy", preventCopy)
      document.removeEventListener("contextmenu", preventRightClick)
    }
  }, [attemptId])

  /* =====================================================
      TIMER
  ===================================================== */
  useEffect(() => {
    if (!attemptId || autoSubmitted) return
    if (timeLeft <= 0) return handleAutoSubmit()

    const t = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(t)
  }, [attemptId, timeLeft, autoSubmitted])

  const formatTime = (sec: number) => {
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`
  }

  /* =====================================================
      SUBMIT QUIZ
  ===================================================== */
  const submitQuiz = useMutation({
    mutationFn: () =>
      api.post(`/api/quiz/${attemptId}/submit`, {
        answers: Object.entries(answers).map(([qid, ans]) => ({
          questionId: qid,
          answer: ans,
        })),
        cheatingEvents,
      }),

    onSuccess: () => {
      toast.success("Submitted successfully")
      router.push('/student/quiz')
    },

    onError: () => toast.error("Submission failed"),
  })

  const handleAutoSubmit = () => {
    if (autoSubmitted) return
    setAutoSubmitted(true)
    toast.error("⏳ Time is up! Auto-submitting...")
    submitQuiz.mutate()
  }

  /* =====================================================
      LOADING
  ===================================================== */
  if (!quiz)
    return (
      <Layout>
        <div className="p-6 text-white">Loading quiz...</div>
      </Layout>
    )

  /* =====================================================
      START SCREEN
  ===================================================== */
  if (!attemptId)
    return (
      <Layout>
        <div className="px-4 py-6 max-w-4xl mx-auto">
          <div className="bg-black/40 border border-purple-500/30 rounded-xl p-8">
            <h1 className="text-3xl font-black text-white mb-3">{quiz.title}</h1>
            <p className="text-gray-400 mb-6">{quiz.description}</p>

            <p className="text-gray-300 mb-2">
              Duration: <b>{quiz.settings.duration}</b> minutes
            </p>
            <p className="text-gray-300 mb-2">
              Questions: <b>{quiz.questions.length}</b>
            </p>
            <p className="text-gray-300 mb-6">
              Total Marks: <b>{quiz.settings.totalMarks}</b>
            </p>

            <button
              onClick={() => startQuiz.mutate()}
              disabled={startQuiz.isPending}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold"
            >
              {startQuiz.isPending ? "Starting..." : "Start Quiz"}
            </button>
          </div>
        </div>
      </Layout>
    )

  /* =====================================================
      QUIZ SCREEN
  ===================================================== */
  return (
    <Layout>
      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Timer */}
        <div className="flex justify-between mb-6">
          <div className="flex items-center bg-red-600/30 px-6 py-3 rounded-xl">
            <Clock className="h-6 w-6 text-white" />
            <span className="text-2xl ml-3 font-black">{formatTime(timeLeft)}</span>
          </div>

          {cheatingEvents.length > 0 && (
            <div className="flex items-center px-4 py-2 bg-red-500/20 border border-red-300 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span className="ml-2 text-red-400 font-bold">
                {cheatingEvents.length} warnings
              </span>
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {quiz.questions.map((q: any, idx: number) => {
            const qid = q.id

            return (
              <div
                key={qid}
                className="bg-black/40 border border-purple-500/30 rounded-xl p-6"
              >
                <div className="flex justify-between mb-3">
                  <h3 className="text-xl font-bold text-white">
                    Q{idx + 1}. {q.question}
                  </h3>
                  <span className="text-purple-400 font-bold">{q.marks} marks</span>
                </div>

                {q.type === "mcq" ? (
                  <div className="space-y-3">
                    {q.options?.map((opt: string, i: number) => (
                      <label
                        key={i}
                        className="flex items-center p-3 rounded-lg bg-black/30 border border-purple-500/20 cursor-pointer hover:bg-purple-500/10"
                      >
                        <input
                          type="radio"
                          name={qid}
                          value={opt}
                          checked={answers[qid] === opt}
                          onChange={() =>
                            setAnswers((a) => ({ ...a, [qid]: opt }))
                          }
                          className="mr-3"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    rows={4}
                    className="w-full bg-black/30 border border-purple-500/20 rounded-lg p-3 text-white"
                    value={answers[qid] ?? ""}
                    onChange={(e) =>
                      setAnswers((a) => ({ ...a, [qid]: e.target.value }))
                    }
                    placeholder="Write your answer..."
                  />
                )}
              </div>
            )
          })}
        </div>

        <button
          onClick={() => submitQuiz.mutate()}
          disabled={submitQuiz.isPending}
          className="w-full py-4 mt-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold"
        >
          {submitQuiz.isPending ? "Submitting..." : "Submit Quiz"}
        </button>
      </div>
    </Layout>
  )
}
