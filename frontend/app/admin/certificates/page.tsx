'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Award, Check, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

/* ---------------------------------------------------------------- */
/*    PostgreSQL-Ready Interface (Removed MongoDB _id Dependency)   */
/* ---------------------------------------------------------------- */

interface CertRequest {
  id: string                     // replaced _id
  student: { name: string; email: string }
  course: { title: string; code: string }
  createdAt: string
}

/* ---------------------------------------------------------------- */

export default function AdminCertificatesPage() {
  const [requests, setRequests] = useState<CertRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  const fetchRequests = async () => {
    try {
      const res = await api.get('/api/admin/certificates/pending')
      setRequests(res.data.data)
    } catch (e) {
      toast.error('Failed to load certificate requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  /* ------------------ Approve or Reject Action ------------------ */

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessing(id)
    try {
      await api.patch(`/api/admin/certificates/${id}/${action}`)
      toast.success(`Certificate ${action}d successfully!`)
      setRequests((prev) => prev.filter((r) => r.id !== id))
    } catch (e) {
      toast.error(`Failed to ${action} certificate`)
    } finally {
      setProcessing(null)
    }
  }

  /* ------------------------------- UI ------------------------------- */

  return (
    <div className="p-6">
      
      {/* Header */}
      <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
        <Award className="text-yellow-500" />
        Certificate Approvals
      </h1>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl">
        
        {/* Loading */}
        {loading ? (
          <div className="p-8 flex justify-center text-purple-300">
            <Loader2 className="animate-spin h-6 w-6" />
          </div>
        ) : requests.length === 0 ? (

          /* No Requests */
          <div className="p-8 text-center text-gray-500">
            No pending certificate requests.
          </div>

        ) : (

          /* Table */
          <table className="w-full text-left">
            <thead className="bg-black/40 text-gray-400 text-xs uppercase">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Course</th>
                <th className="p-4">Requested On</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800 text-sm">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-800/40 transition">
                  
                  {/* Student Info */}
                  <td className="p-4">
                    <div className="font-bold text-white">{r.student.name}</div>
                    <div className="text-xs text-gray-500">{r.student.email}</div>
                  </td>

                  {/* Course Info */}
                  <td className="p-4 text-gray-300">
                    {r.course.title}{' '}
                    <span className="text-gray-500 text-xs">
                      ({r.course.code})
                    </span>
                  </td>

                  {/* Date */}
                  <td className="p-4 text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>

                  {/* Approve/Reject Buttons */}
                  <td className="p-4 text-right flex justify-end gap-2">
                    
                    {/* Approve */}
                    <button
                      disabled={!!processing}
                      onClick={() => handleAction(r.id, 'approve')}
                      className="bg-green-600/20 text-green-400 hover:bg-green-600/30 
                                 p-2 rounded-lg transition disabled:opacity-50"
                    >
                      {processing === r.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </button>

                    {/* Reject */}
                    <button
                      disabled={!!processing}
                      onClick={() => handleAction(r.id, 'reject')}
                      className="bg-red-600/20 text-red-400 hover:bg-red-600/30 
                                 p-2 rounded-lg transition disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
