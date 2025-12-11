'use client'

import { useEffect, useState } from 'react'
import { Settings, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'

/* ---------------------------------------------------------------- */
/*   PostgreSQL / Prisma Friendly Interfaces (clean, no MongoDB)    */
/* ---------------------------------------------------------------- */

interface GlobalSettings {
  platformName: string
  defaultLanguage: string
  aiApiCostPerToken: number
  aiFeaturesEnabled: boolean
  registrationOpen: boolean
}

/* ---------------------------------------------------------------- */

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<GlobalSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  /* ------------------------ Fetch Settings ------------------------ */

  const fetchSettings = async () => {
    try {
      setLoading(true)

      const res = await api.get('/api/admin/settings')
      setSettings(res.data.data as GlobalSettings)
      
    } catch (err: any) {
      console.error('Failed to load settings:', err)
      toast.error(err?.response?.data?.message || 'Failed to load settings.')

      // Safe fallback to avoid UI crash
      setSettings({
        platformName: 'YDS EduAI',
        defaultLanguage: 'en',
        aiApiCostPerToken: 0.000001,
        aiFeaturesEnabled: false,
        registrationOpen: false,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSettings() }, [])

  /* ------------------------ Input Handler ------------------------ */

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target

    let processed: string | number | boolean

    if (type === 'checkbox') {
      processed = (e.target as HTMLInputElement).checked
    } else if (type === 'number') {
      processed = parseFloat(value) || 0
    } else {
      processed = value
    }

    setSettings(prev => prev ? { ...prev, [name]: processed } : prev)
  }

  /* ------------------------ Save Settings ------------------------ */

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return

    try {
      setSaving(true)
      await api.patch('/api/admin/settings', settings)

      toast.success('Global settings updated!')
    } catch (err: any) {
      console.error('Save settings error:', err)
      toast.error(err?.response?.data?.message || 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  /* ----------------------------- UI ----------------------------- */

  return (
    <div className="px-4 py-6 space-y-6">

      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-xl shadow-md">
          <Settings className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">Platform Settings</h1>
          <p className="text-purple-300 text-sm">
            Configure global platform parameters and AI features.
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center text-indigo-300 p-4">
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Loading settings...
        </div>
      )}

      {/* FORM */}
      {settings && (
        <form onSubmit={handleSave} className="space-y-6">

          {/* GENERAL SETTINGS */}
          <div className="bg-gray-900 border border-indigo-500/30 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">
              General
            </h2>

            {/* Platform Name */}
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-1">Platform Name</label>
              <input
                type="text"
                name="platformName"
                value={settings.platformName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-xl bg-black/50 border border-indigo-500/30 text-white outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* Registration Toggle */}
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm text-gray-300">Public Registration Open</label>
              <input
                type="checkbox"
                name="registrationOpen"
                checked={settings.registrationOpen}
                onChange={handleInputChange}
                className="h-5 w-5 rounded text-indigo-600 border-gray-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

          </div>

          {/* AI SETTINGS */}
          <div className="bg-gray-900 border border-purple-500/30 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">
              AI Configuration
            </h2>

            {/* AI Toggle */}
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm text-gray-300">AI Features Enabled</label>
              <input
                type="checkbox"
                name="aiFeaturesEnabled"
                checked={settings.aiFeaturesEnabled}
                onChange={handleInputChange}
                className="h-5 w-5 rounded text-purple-600 border-gray-600 focus:ring-purple-500 cursor-pointer"
              />
            </div>

            {/* Cost per Token */}
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-1">API Cost Per Token ($)</label>
              <input
                type="number"
                name="aiApiCostPerToken"
                step="0.000001"
                value={settings.aiApiCostPerToken}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-xl bg-black/50 border border-purple-500/30 text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold disabled:opacity-50 hover:opacity-90 transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  )
}
