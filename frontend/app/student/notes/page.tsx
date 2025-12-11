'use client'

import Layout from '@/components/AppShell'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { FileText, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NotesPage() {

  const [formData, setFormData] = useState({
    subjectId: '',
    unit: '',
    noteType: 'summary',
  })

  const [notes, setNotes] = useState<string>('')

  // ============================
  //  GENERATE NOTES API
  // ============================
  const generate = useMutation({
    mutationFn: async () => {
      const payload = {
        noteType: formData.noteType,
        unit: formData.unit,
        subjectId: formData.subjectId || null,
      }

      // ✅ FIXED API route for PostgreSQL
      const res = await api.post('/api/ai/notes/generate', payload)

      return (
        res?.data?.data ||     // normal backend response  
        res?.data ||           // fallback  
        {}                     // always fallback to prevent crash
      )
    },

    onSuccess: (data) => {
      const safeNotes = data?.notes || "No notes generated."
      setNotes(safeNotes)
      toast.success("Notes generated!")
    },

    onError: () => {
      toast.error("Failed to generate notes")
    },
  })

  // ============================
  //  SUBMIT HANDLER
  // ============================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.unit.trim()) {
      toast.error("Unit number is required")
      return
    }

    generate.mutate()
  }

  return (
    <Layout>
      <div className="px-4 py-6 max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-gradient-to-r from-pink-600 to-red-600 p-3 rounded-xl">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">AI Notes Generator</h1>
              <p className="text-pink-400">Generate exam-ready notes instantly</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 p-6 mb-6 space-y-4"
        >
          {/* Note Type */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Note Type
            </label>
            <select
              value={formData.noteType}
              onChange={(e) => setFormData({ ...formData, noteType: e.target.value })}
              className="w-full px-4 py-3 bg-black/50 border border-pink-500/30 rounded-xl text-white"
            >
              <option value="summary">Unit Summary</option>
              <option value="short_answer">Short Answers</option>
              <option value="long_answer">Long Answers</option>
              <option value="2_mark">2-Mark Questions</option>
              <option value="16_mark">16-Mark Questions</option>
              <option value="formula_list">Formula List</option>
            </select>
          </div>

          {/* Unit */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Unit Number
            </label>
            <input
              type="number"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-4 py-3 bg-black/50 border border-pink-500/30 rounded-xl text-white"
              min={1}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={generate.isPending}
            className="w-full px-6 py-4 bg-gradient-to-r from-pink-600 to-red-600 rounded-xl hover:shadow-lg font-bold disabled:opacity-50"
          >
            {generate.isPending ? "Generating..." : "Generate Notes"}
          </button>
        </form>

        {/* Output */}
        {notes && (
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-pink-500/20 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-6 w-6 text-pink-400" />
              <h2 className="text-2xl font-black text-white">Generated Notes</h2>
            </div>

            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {notes}
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
