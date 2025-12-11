'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import {
  Users,
  Search,
  Filter,
  Loader2,
  Shield,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

/* ---------------------------------------------------------------- */
/*         PostgreSQL-Friendly Interface (Removed _id)              */
/* ---------------------------------------------------------------- */

interface User {
  id: string                     // ← replaced _id
  name: string
  email: string
  roles: string[]
  activeRole: string
  isActive: boolean
  college?: { name: string; code: string }   // ← cleaned from collegeId._
}

/* ---------------------------------------------------------------- */

const ALL_ROLES = [
  'SUPER_ADMIN',
  'COLLEGE_MANAGER',
  'TEACHER',
  'STUDENT',
  'EMPLOYEE',
  'CLIENT'
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('')
  const [search, setSearch] = useState('')

  /* ----------------- Fetch Users ----------------- */

  const fetchUsers = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      if (roleFilter) params.append('role', roleFilter)
      if (search.trim()) params.append('search', search.trim())

      const res = await api.get(`/api/admin/users?${params.toString()}`)
      setUsers(res.data.data || [])

    } catch (err: any) {
      console.error('Fetch users error:', err)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  /* ----------------- Update Role ----------------- */

  const handleRoleChange = async (userId: string, newRole: string) => {
    const ok = confirm(`Switch this user's active role to ${newRole}?`)
    if (!ok) return

    try {
      await api.patch(`/api/admin/users/${userId}/roles`, {
        activeRole: newRole
      })

      toast.success('Role updated')
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, activeRole: newRole } : u))
      )

    } catch (err: any) {
      console.error(err)
      toast.error('Failed to update role')
    }
  }

  /* ----------------- Update Status ----------------- */

  const handleToggleActive = async (user: User) => {
    const action = user.isActive ? 'BLOCK' : 'ACTIVATE'
    const ok = confirm(`Are you sure you want to ${action} this user?`)
    if (!ok) return

    try {
      const res = await api.patch(`/api/admin/users/${user.id}/status`, {
        isActive: !user.isActive
      })

      toast.success(`User ${action === 'ACTIVATE' ? 'activated' : 'blocked'}`)
      setUsers(prev =>
        prev.map(u =>
          u.id === user.id ? { ...u, isActive: res.data.data.isActive } : u
        )
      )

    } catch (err) {
      console.error(err)
      toast.error('Failed to update status')
    }
  }

  /* ----------------- UI ----------------- */

  return (
    <div className="px-4 py-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-500" />
            Users
          </h1>
          <p className="text-gray-400 text-sm">
            Manage roles, permissions, and account status.
          </p>
        </div>
        
        <button
          onClick={fetchUsers}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center"
        >
          <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh List
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex flex-col md:flex-row gap-4">
        
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search name or email..."
            className="w-full bg-black border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
          />
        </div>

        {/* Role Filter */}
        <div className="w-full md:w-48 relative">
          <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
          <select
            className="w-full bg-black border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white appearance-none"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            {ALL_ROLES.map(role => (
              <option key={role} value={role}>
                {role.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchUsers}
          className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold"
        >
          Apply
        </button>
      </div>

      {/* User Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/50 text-gray-400 text-xs uppercase border-b border-gray-800">
                <th className="p-4">User Details</th>
                <th className="p-4">College</th>
                <th className="p-4">Active Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="text-sm divide-y divide-gray-800">

              {/* Loading */}
              {loading && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400">
                    <Loader2 className="h-8 w-8 animate-spin mb-2 text-blue-500" />
                    Loading users...
                  </td>
                </tr>
              )}

              {/* No users */}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400">
                    <AlertCircle className="h-8 w-8 mb-2 text-gray-600" />
                    No users found.
                  </td>
                </tr>
              )}

              {/* User Rows */}
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/30">

                  {/* Name & Email */}
                  <td className="p-4">
                    <div className="font-bold text-white">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>

                    {/* Roles */}
                    <div className="flex gap-1 mt-1">
                      {user.roles.map(role => (
                        <span
                          key={role}
                          className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-400 border border-gray-700"
                        >
                          {role.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* College */}
                  <td className="p-4 text-gray-300">
                    {user.college ? (
                      <div>
                        <span className="text-sm text-gray-200">{user.college.name}</span>
                        <br />
                        <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded text-[10px] font-mono">
                          {user.college.code}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-600 italic text-xs">N/A</span>
                    )}
                  </td>

                  {/* Active Role */}
                  <td className="p-4">
                    <select
                      value={user.activeRole}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="bg-black border border-gray-700 text-white text-xs rounded px-2 py-1.5 cursor-pointer"
                    >
                      {ALL_ROLES.map(role => (
                        <option key={role} value={role}>
                          {role.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    {user.isActive ? (
                      <span className="inline-flex items-center text-green-400 text-xs font-bold bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-full">
                        Blocked
                      </span>
                    )}
                  </td>

                  {/* Action Button */}
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleActive(user)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        user.isActive
                          ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                          : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                      }`}
                    >
                      {user.isActive ? 'Block User' : 'Activate User'}
                    </button>
                  </td>

                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
