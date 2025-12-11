'use client'

import { useState, useEffect } from 'react'
import { Code, ArrowLeft, Play, CheckCircle2, Copy } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function CodingLabPage() {
  const [code, setCode] = useState('print("Hello, World!")')
  const [language, setLanguage] = useState('python')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isHtml, setIsHtml] = useState(false)

  const [codeHistory, setCodeHistory] = useState<
    Array<{ code: string; language: string; output: string }>
  >([])

  const templates: Record<string, string> = {
    python: 'print("Hello, World!")\n\n# Write your Python code here',
    javascript: 'console.log("Hello World!")',
    node: 'console.log("Hello World!")',
    java:
      'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello World!");\n  }\n}',
    c: '#include <stdio.h>\nint main(){ printf("Hello World"); return 0; }',
    cpp:
      '#include <iostream>\nusing namespace std;\nint main(){ cout<<"Hello"; return 0;}',
    html:
      '<html>\n<body>\n<h1>Hello World</h1>\n</body>\n</html>',
    sql: 'SELECT * FROM users;',
    jquery: '$("#app").text("Hello World");'
  }

  // ==================================================
  // ⭐ FULLY FIXED EXECUTION HANDLER WITH /api PREFIX
  // ==================================================
  const handleRunCode = async () => {
    if (!code.trim()) return toast.error('Please write some code')

    setLoading(true)
    setOutput('')
    setIsHtml(false)

    try {
      const res = await api.post('/api/public/coding-lab', {
        code,
        language,
        input: ''
      })

      const data = res.data || {}
      console.log('Execution Response →', data)

      let result = ''
      let errorDetected = false

      // ⭐ HTML MODE
      if (data.output_type === 'html' || data.html || language === 'html') {
        setIsHtml(true)
        result = data.html || data.stdout || data.output || ''
        toast.success('HTML Preview Generated')
      }

      // ⭐ ERROR MODE
      else if (
        (data.stderr && data.stderr.trim()) ||
        (data.error && data.error.trim()) ||
        (data.data?.error && data.data.error.trim())
      ) {
        errorDetected = true
        result =
          `Error:\n${
            data.stderr || data.error || data.data?.error || 'Unknown error'
          }`

        toast.error('Execution Error')
      }

      // ⭐ NORMAL STDOUT MODE
      else {
        result =
          data.stdout ||
          data.output ||
          data.data?.output ||
          data.data?.stdout ||
          data.data?.output_text ||
          'Execution completed (no output).'

        toast.success('Code Executed Successfully')
      }

      setOutput(result)

      // ⭐ Save History (latest 5)
      setCodeHistory(prev => {
        const item = { code, language, output: result }
        return [item, ...prev].slice(0, 5)
      })
    } catch (err: any) {
      console.log('Execution Error → ', err)

      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Execution failed'

      setOutput(`Error:\n${msg}`)
      toast.error('Execution Failed')
    } finally {
      setLoading(false)
    }
  }

  const handleTemplate = () => setCode(templates[language] || '')
  const copyCode = () => {
    navigator.clipboard.writeText(code)
    toast.success('Code Copied!')
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* NAVBAR */}
      <nav className="bg-black/80 backdrop-blur-xl border-b border-blue-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/public" className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-75 animate-pulse"/>
                <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl">
                  <Code className="h-7 w-7 text-white"/>
                </div>
              </div>

              <div>
                <span className="text-2xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
                  YDS EduAI
                </span>
                <p className="text-xs text-blue-400">Free Student Mode</p>
              </div>
            </Link>

            <Link
              href="/auth/login"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold hover:scale-105 transition shadow-lg"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/public"
          className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 mb-8"
        >
          <ArrowLeft className="h-5 w-5"/>
          <span>Back to Services</span>
        </Link>

        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl mb-6">
              <Code className="h-10 w-10 text-white"/>
            </div>

            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
              Coding Lab
            </h1>

            <p className="text-gray-300 text-lg">
              Run Python, Java, C, C++, JS, HTML, SQL and more — instantly with AI!
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Code Editor */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-blue-500/20 p-6">

              <div className="flex items-center justify-between mb-4">
                <select
                  value={language}
                  onChange={e => {
                    setLanguage(e.target.value)
                    setCode(templates[e.target.value] || '')
                  }}
                  className="px-4 py-2 bg-black/50 border border-blue-500/30 rounded-lg font-bold"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="node">Node.js</option>
                  <option value="java">Java</option>
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                  <option value="html">HTML/CSS/JS</option>
                  <option value="sql">SQL</option>
                  <option value="jquery">jQuery</option>
                </select>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleTemplate}
                    className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 font-bold hover:bg-blue-500/30"
                  >
                    Template
                  </button>

                  <button className="p-2" onClick={copyCode}>
                    <Copy className="h-5 w-5 text-blue-400"/>
                  </button>
                </div>
              </div>

              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full h-96 font-mono bg-black/50 border border-blue-500/30 rounded-xl p-4 text-sm"
              />

              <button
                onClick={handleRunCode}
                disabled={loading || !code.trim()}
                className="mt-4 w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-black flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"/>
                    <span>Running...</span>
                  </div>
                ) : (
                  <>
                    <Play className="h-5 w-5"/>
                    <span>Run Code</span>
                  </>
                )}
              </button>
            </div>

            {/* OUTPUT */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-green-500/20 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-400"/>
                <h3 className="text-xl font-black">Output</h3>
              </div>

              <div className="h-96 bg-black/50 border border-green-500/20 p-4 rounded-xl overflow-auto">

                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-b-2 border-green-400 rounded-full"/>
                  </div>
                ) : isHtml ? (
                  <iframe srcDoc={output} className="w-full h-full bg-white rounded"/>
                ) : (
                  <pre
                    className={`text-sm font-mono whitespace-pre-wrap ${
                      output.startsWith('Error:') ? 'text-red-400' : 'text-green-400'
                    }`}
                  >
                    {output || 'Run code to see output...'}
                  </pre>
                )}

              </div>
            </div>

          </div>

          {/* Execution History */}
          {codeHistory.length > 0 && (
            <div className="mt-10 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-blue-500/20 p-6">
              <h3 className="text-xl font-black mb-4">Recent Executions</h3>

              <div className="space-y-3">
                {codeHistory.map((item, i) => (
                  <div key={i} className="p-4 bg-black/50 border border-blue-500/10 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-blue-400 font-bold text-sm">
                        {item.language.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-gray-300 text-sm font-mono line-clamp-2 mb-2">
                      {item.code}
                    </p>

                    <p className="text-green-500 text-xs line-clamp-1">
                      {item.output}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  )
}
