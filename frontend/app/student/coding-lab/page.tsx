
'use client';

export const dynamic = "force-dynamic"; // REQUIRED for /student dynamic pages



import Layout from '../layout';
import { useState } from 'react';
import { Code, Play, FileCode, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CodingLabPage() {
  const [code, setCode] = useState('print("Hello, World!")');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  /* ----------------------------------------
     AUTO TEMPLATE PER LANGUAGE
  ---------------------------------------- */
  const templates: Record<string, string> = {
    python: `print("Hello, Python!")`,
    javascript: `console.log("Hello, JavaScript!")`,
    java: `public class Main {
  public static void main(String[] args) {
      System.out.println("Hello, Java!");
  }
}`,
    c: `#include <stdio.h>

int main() {
    printf("Hello, C!");
    return 0;
}`,
    sql: `SELECT "Hello SQL";`,
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    setCode(templates[value] || '');
  };

  /* ----------------------------------------
     💥 REAL BACKEND CODE RUN (Judge0)
  ---------------------------------------- */
  const handleRun = async () => {
    if (!code.trim()) {
      return toast.error("Please write some code!");
    }

    setLoading(true);
    setOutput("⏳ Executing code...");

    try {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });

      const data = await res.json();

      setOutput(data.output || "⚠ No output");
    } catch (err) {
      setOutput("❌ Failed to run code.");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div className="px-4 py-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-xl">
              <Code className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">AI Coding Lab</h1>
              <p className="text-purple-400">Run real code with live output</p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Code Editor */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-green-500/20 p-6">
            <div className="flex items-center justify-between mb-4">

              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-4 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white outline-none"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="c">C</option>
                <option value="sql">SQL</option>
              </select>

              {/* Run Button */}
              <button
                onClick={handleRun}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:shadow-lg font-bold flex items-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span>{loading ? "Running..." : "Run"}</span>
              </button>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-96 px-4 py-3 bg-black/50 border border-green-500/30 rounded-xl text-white font-mono text-sm outline-none"
              placeholder="Write your code here..."
            />
          </div>

          {/* Output */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-blue-500/20 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileCode className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-black text-white">Output</h2>
            </div>

            <div className="bg-black/50 rounded-xl p-4 h-96 overflow-auto border border-blue-500/10">
              <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                {output || 'Output will appear here...'}
              </pre>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
