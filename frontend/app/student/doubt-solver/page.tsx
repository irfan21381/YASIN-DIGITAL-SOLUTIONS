'use client'

import Layout from '@/components/AppShell'
import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { Brain, Send, MessageSquare, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

interface ChatMessage {
  role: 'user' | 'assistant' | string
  content: string
}

interface Chat {
  id: string | number
  messages: ChatMessage[]
}

export default function DoubtSolverPage() {
  const [message, setMessage] = useState('')
  const [chatId, setChatId] = useState<string | number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const scrollRef = useRef<HTMLDivElement | null>(null)

  /** ============================
   * Load Chat History
   * ============================ */
  const {
    data: chatsData,
    isLoading: chatsLoading,
  } = useQuery<Chat[]>({
    queryKey: ['ai-chats'],
    queryFn: () =>
      api.get('/api/ai/chat').then(res => res.data?.data || []),
  })

  const chats: Chat[] = chatsData || []

  /** ============================
   * Send Message API
   * ============================ */
  const sendMessage = useMutation({
    mutationFn: async (msg: string) => {
      const res = await api.post('/api/ai/chat', {
        message: msg,
        chatId,
        subjectId: null,
        unit: null,
      })
      return res.data?.data?.chat as Chat | undefined
    },

    onSuccess: (chat) => {
      if (!chat) {
        toast.error('AI failed to respond')
        return
      }

      // ✅ PostgreSQL style: use chat.id
      setChatId(chat.id)
      setMessages(chat.messages || [])
      setMessage('')
    },

    onError: () => {
      toast.error('AI could not process your doubt')
    },
  })

  /** ============================
   * Auto-scroll
   * ============================ */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages, sendMessage.isPending])

  /** ============================
   * Submit Handler
   * ============================ */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    sendMessage.mutate(message)
  }

  /** ============================
   * Load Selected Chat
   * ============================ */
  const loadChat = (chat: Chat) => {
    setChatId(chat.id)
    setMessages(chat.messages || [])
  }

  return (
    <Layout>
      <div className="px-4 py-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">AI Doubt Solver</h1>
              <p className="text-purple-400">
                Ask your doubts and get accurate teacher-based answers
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/20 p-6 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            <span className="text-yellow-400 font-bold">
              Teacher-Controlled Knowledge Base
            </span>
          </div>
          <p className="text-gray-300">
            AI answers only using teacher-uploaded materials.
            If information is missing, AI will say it — no guessing.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">

          {/* LEFT: Chat List */}
          <div className="col-span-12 md:col-span-4">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/20 p-4 h-[500px] overflow-y-auto">

              <h2 className="text-white font-bold mb-4 text-lg">Your Chats</h2>

              {chatsLoading && (
                <p className="text-gray-400 text-center text-sm">Loading chats...</p>
              )}

              {!chatsLoading && chats.length === 0 && (
                <p className="text-gray-500 text-sm text-center">No chats yet</p>
              )}

              <div className="space-y-3">
                {chats.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => loadChat(c)}
                    className={`p-3 rounded-xl cursor-pointer border transition ${
                      chatId === c.id
                        ? 'bg-purple-600 border-purple-400 text-white'
                        : 'bg-black/40 border-purple-500/20 text-gray-300 hover:bg-purple-500/10'
                    }`}
                  >
                    <p className="truncate">
                      {c.messages?.[0]?.content || 'Chat'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Chat Window */}
          <div className="col-span-12 md:col-span-8">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/20 p-6 h-[500px] flex flex-col">

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4">

                {messages.length === 0 && !sendMessage.isPending && (
                  <div className="text-center text-gray-400 py-12">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-40" />
                    <p>Start asking your doubts…</p>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-xl whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-black/50 border border-purple-500/20 text-gray-100'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {sendMessage.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-black/50 border border-purple-500/20 p-4 rounded-xl flex items-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-b-2 border-purple-400 rounded-full"></div>
                      <span className="text-gray-400">AI is thinking…</span>
                    </div>
                  </div>
                )}

              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="flex space-x-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask your doubt..."
                  className="flex-1 px-4 py-3 bg-black/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-600"
                  disabled={sendMessage.isPending}
                />

                <button
                  type="submit"
                  disabled={sendMessage.isPending || !message.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:shadow-lg hover:shadow-purple-500/40 transition-all disabled:opacity-50"
                >
                  <Send className="h-5 w-5 text-white" />
                </button>
              </form>

            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}
