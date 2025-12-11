'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { BookOpen, Plus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

/* ---------------------------------------------------------------- */
/*   PostgreSQL-Ready Interface (Replaced _id with id - UUID style)  */
/* ---------------------------------------------------------------- */

interface Course {
  id: string               // changed from _id
  title: string
  code: string
  createdBy: { name: string }
}

/* ---------------------------------------------------------------- */

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/api/admin/courses')
        setCourses(res.data.data)
      } catch (e) {
        toast.error("Failed to load courses")
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  /* ----------------------------- PRINT ----------------------------- */

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="p-6">
      
      {/* ----------------------- Header ----------------------- */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <BookOpen className="text-purple-500" />
          Courses
        </h1>

        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            Print List
          </button>

          <button className="px-4 py-2 bg-purple-600 text-white rounded flex items-center gap-2 hover:bg-purple-700">
            <Plus size={18} />
            Add Course
          </button>
        </div>
      </div>

      {/* ----------------------- Print Header ----------------------- */}
      <div className="hidden print:block mb-8 text-black">
        <h1 className="text-2xl font-bold">Course List Report</h1>
        <p className="text-sm">Generated from YDS EduAI Admin Panel</p>
      </div>

      {/* ----------------------- List ----------------------- */}
      <div className="bg-gray-900 rounded-xl overflow-hidden print:bg-white print:text-black">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-800 text-gray-400 text-xs uppercase print:bg-gray-100 print:text-black">
            <tr>
              <th className="p-4">Course Title</th>
              <th className="p-4">Code</th>
              <th className="p-4">Created By</th>
            </tr>
          </thead>

          <tbody className="text-sm divide-y divide-gray-800 print:divide-gray-300">

            {loading ? (
              <tr>
                <td colSpan={3} className="p-8 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                  </div>
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-500 print:text-black">
                  No courses found.
                </td>
              </tr>
            ) : (
              courses.map((c) => (
                <tr key={c.id} className="hover:bg-gray-800/50 print:hover:bg-transparent">
                  <td className="p-4 font-medium">{c.title}</td>
                  <td className="p-4 font-mono text-purple-400 print:text-black">
                    {c.code}
                  </td>
                  <td className="p-4 text-gray-400 print:text-black">
                    {c.createdBy?.name}
                  </td>
                </tr>
              ))
            )}

          </tbody>
        </table>
      </div>
    </div>
  )
}
