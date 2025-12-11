'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Building2, Plus, Loader2, Trash2, Edit3 } from 'lucide-react'
import toast from 'react-hot-toast'

/* ---------------------------------------------------------------- */
/*    PostgreSQL / Prisma-Ready Interface (Removed MongoDB _id)     */
/* ---------------------------------------------------------------- */

interface College {
  id: string        // changed from _id
  name: string
  code: string
  location?: string
}

/* ---------------------------------------------------------------- */

export default function AdminCollegesPage() {
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [location, setLocation] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  /* ----------------------- Load all colleges ---------------------- */

  const loadColleges = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/admin/colleges')
      setColleges(res.data.data || [])
    } catch (err: any) {
      console.error('Load colleges error:', err)
      toast.error(err?.response?.data?.message || 'Failed to load colleges')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadColleges()
  }, [])

  /* --------------------------- Form Reset -------------------------- */

  const resetForm = () => {
    setName('')
    setCode('')
    setLocation('')
    setEditingId(null)
  }

  /* ----------------------- Add / Update College ----------------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !code.trim()) {
      toast.error('Name and code are required')
      return
    }

    try {
      setSaving(true)

      if (editingId) {
        // -------- Update -----------
        const res = await api.put(`/api/admin/colleges/${editingId}`, {
          name,
          code,
          location,
        })

        toast.success('College updated')

        setColleges((prev) =>
          prev.map((c) => (c.id === editingId ? res.data.data : c))
        )
      } else {
        // -------- Create ------------
        const res = await api.post('/api/admin/colleges', {
          name,
          code,
          location,
        })

        toast.success('College created')
        setColleges((prev) => [res.data.data, ...prev])
      }

      resetForm()
    } catch (err: any) {
      console.error('Save college error:', err)
      toast.error(err?.response?.data?.message || 'Failed to save college')
    } finally {
      setSaving(false)
    }
  }

  /* ----------------------------- Edit ----------------------------- */

  const handleEdit = (college: College) => {
    setEditingId(college.id)
    setName(college.name)
    setCode(college.code)
    setLocation(college.location || '')
  }

  /* ---------------------------- Delete ---------------------------- */

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this college?')) return

    try {
      await api.delete(`/api/admin/colleges/${id}`)
      toast.success('College deleted')

      setColleges((prev) => prev.filter((c) => c.id !== id))
    } catch (err: any) {
      console.error('Delete college error:', err)
      toast.error(err?.response?.data?.message || 'Failed to delete college')
    }
  }

  /* ---------------------------------------------------------------- */

  return (
    <div className="px-4 py-6 space-y-6">
      
      {/* ----------------------- Header ----------------------- */}
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl shadow-lg">
          <Building2 className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">Colleges</h1>
          <p className="text-purple-300 text-sm">
            Manage integrated colleges connected to YDS EduAI.
          </p>
        </div>
      </div>

      {/* ----------------------- Form ----------------------- */}
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3"
      >
        {/* Name */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-sm text-white"
            placeholder="YDS College of Engineering"
          />
        </div>

        {/* Code */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-sm text-white"
            placeholder="YDS123"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-sm text-white"
            placeholder="City / State"
          />
        </div>

        {/* Button */}
        <div className="flex items-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center w-full px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-sm font-bold disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                {editingId ? 'Update College' : 'Add College'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* ----------------------- List ----------------------- */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/20 rounded-2xl p-4">
        <h2 className="text-lg font-black text-white mb-3">All Colleges</h2>

        {loading ? (
          <div className="flex items-center text-purple-300">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Loading colleges...
          </div>
        ) : colleges.length === 0 ? (
          <p className="text-sm text-gray-400">No colleges added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-white/10">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Code</th>
                  <th className="py-2 pr-4">Location</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {colleges.map((c) => (
                  <tr key={c.id} className="border-b border-white/5">
                    <td className="py-2 pr-4 text-white">{c.name}</td>
                    <td className="py-2 pr-4 text-purple-300 font-mono">{c.code}</td>
                    <td className="py-2 pr-4 text-gray-300">
                      {c.location || '—'}
                    </td>

                    <td className="py-2 pr-4 text-right space-x-2">

                      {/* Edit */}
                      <button
                        onClick={() => handleEdit(c)}
                        className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-white/5 text-gray-200 hover:bg-white/10"
                      >
                        <Edit3 className="h-3 w-3 mr-1" /> Edit
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-red-500/20 text-red-100 hover:bg-red-500/30"
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </button>

                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  )
}
