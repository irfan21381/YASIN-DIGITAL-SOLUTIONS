export const dynamic = "force-dynamic";

'use client'

import Layout from '@/components/AppShell'
import { useState, DragEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { Upload } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pdf',
    subjectId: '',
    unit: '',
    year: '',
    branch: '',
    semester: '',
  })

  /* =============================
     FILE UPLOAD MUTATION
  ============================= */
  const upload = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post('/api/teacher/upload-material', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    },

    onSuccess: () => {
      toast.success('Material uploaded successfully! AI is processing it...')
      setFile(null)
      setFormData({
        title: '',
        description: '',
        type: 'pdf',
        subjectId: '',
        unit: '',
        year: '',
        branch: '',
        semester: '',
      })
    },

    onError: () => toast.error('Upload failed — please try again'),
  })

  /* =============================
     HANDLE SUBMIT
  ============================= */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) return toast.error('Please select a file')

    const data = new FormData()
    data.append('file', file)

    for (const [key, value] of Object.entries(formData)) {
      data.append(key, value || '')
    }

    upload.mutate(data)
  }

  /* =============================
     DRAG & DROP SUPPORT
  ============================= */
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      setFile(droppedFile)
    }
  }

  return (
    <Layout>
      <div className="px-4 py-6 max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">Upload Material</h1>
          <p className="text-purple-400">Upload materials for AI Doubt Solver & Notes Generator</p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/20 p-8 space-y-6"
        >
          {/* FILE UPLOAD */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              File Upload
            </label>

            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="
                border-2 border-dashed border-purple-500/30
                rounded-xl p-8 text-center
                hover:border-purple-400 transition cursor-pointer
              "
            >
              <input
                type="file"
                accept=".pdf,.ppt,.pptx,.doc,.docx,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                id="file-upload"
                className="hidden"
              />

              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 text-purple-400 mx-auto mb-4" />

                <p className="text-gray-300 mb-2 font-semibold">
                  {file ? file.name : 'Click to upload or drag & drop file here'}
                </p>

                <p className="text-sm text-gray-500">
                  Supported: PDF, PPT, DOC, TXT
                </p>
              </label>
            </div>
          </div>

          {/* TITLE */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-xl text-white"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Description
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-xl text-white"
            />
          </div>

          {/* TYPE */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Material Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-xl text-white"
            >
              <option value="pdf">PDF</option>
              <option value="ppt">PPT</option>
              <option value="notes">Notes</option>
              <option value="video">Video</option>
            </select>
          </div>

          {/* SUBJECT */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Subject ID
            </label>
            <input
              type="text"
              required
              value={formData.subjectId}
              onChange={(e) =>
                setFormData({ ...formData, subjectId: e.target.value })
              }
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-xl text-white"
            />
          </div>

          {/* UNIT */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">
              Unit Number
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.unit}
              onChange={(e) =>
                setFormData({ ...formData, unit: e.target.value })
              }
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-xl text-white"
            />
          </div>

          {/* GRID: Year – Branch – Semester */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* YEAR */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Year
              </label>
              <input
                type="text"
                required
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
                className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-xl text-white"
              />
            </div>

            {/* BRANCH */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Branch
              </label>
              <input
                type="text"
                required
                value={formData.branch}
                onChange={(e) =>
                  setFormData({ ...formData, branch: e.target.value })
                }
                className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-xl text-white"
              />
            </div>

            {/* SEMESTER */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Semester
              </label>
              <input
                type="text"
                required
                value={formData.semester}
                onChange={(e) =>
                  setFormData({ ...formData, semester: e.target.value })
                }
                className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-xl text-white"
              />
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={upload.isPending || !file}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold disabled:opacity-50"
          >
            {upload.isPending ? 'Uploading...' : 'Upload & Process for AI'}
          </button>
        </form>
      </div>
    </Layout>
  )
}
