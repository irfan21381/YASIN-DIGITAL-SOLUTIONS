"use client";

import { useState, useRef, useEffect } from "react";
import { Rocket, ArrowLeft, Sparkles, Lightbulb } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function CareerGuidancePage() {
  const [interests, setInterests] = useState("");
  const [skills, setSkills] = useState("");
  const [education, setEducation] = useState("");
  const [guidance, setGuidance] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<
    Array<{ input: string; output: string }>
  >([]);

  const guidanceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (guidance && guidanceRef.current) {
      guidanceRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [guidance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!interests && !skills && !education) {
      toast.error("Please fill at least one field");
      return;
    }

    setLoading(true);

    try {
      // ⭐ FIXED API ROUTE
      const { data } = await api.post("/api/public/career-guidance", {
        interests,
        skills,
        education,
      });

      // ⭐ SAFE OUTPUT FROM AI API
      const guidanceText =
        data?.data?.guidance?.output_text ||
        data?.data?.guidance ||
        data?.guidance ||
        "Guidance generated successfully!";

      setGuidance(guidanceText);

      // Add to history
      setHistory((prev) => [
        { input: `${interests}, ${skills}, ${education}`, output: guidanceText },
        ...prev,
      ]);

      toast.success("Career guidance ready!");
    } catch (error: any) {
      console.error(error);

      const msg =
        error?.response?.data?.message ||
        "AI guidance service unavailable. Please try again.";

      toast.error(msg);

      setGuidance(
        "⚠ Unable to generate guidance at the moment. Please try later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* NAV */}
      <nav className="bg-black/80 backdrop-blur-xl border-b border-yellow-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/public" className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl blur opacity-70 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-yellow-600 to-orange-600 p-3 rounded-xl">
                  <Rocket className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent">
                  YDS EduAI
                </span>
                <p className="text-xs text-yellow-400">Free Student Mode</p>
              </div>
            </Link>

            <Link
              href="/auth/login"
              className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl hover:shadow-yellow-500/40 shadow-lg transition-all font-bold"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/public"
          className="inline-flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Services</span>
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* HEADER */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl mb-6 shadow-lg shadow-yellow-500/30">
              <Rocket className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent">
              Career Guidance
            </h1>
            <p className="text-lg text-gray-300">
              Get personalized AI-based career advice instantly.
            </p>
          </div>

          {/* INPUT FORM */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-yellow-500/20 p-8 mb-12 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                label="Your Interests"
                value={interests}
                setValue={setInterests}
                placeholder="e.g., Engineering, Arts, Business"
              />
              <InputField
                label="Your Skills"
                value={skills}
                setValue={setSkills}
                placeholder="e.g., Programming, Leadership"
              />
              <InputField
                label="Education Level"
                value={education}
                setValue={setEducation}
                placeholder="e.g., B.Tech, Diploma, 12th"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl font-black text-lg flex items-center justify-center shadow-lg shadow-yellow-500/30 hover:scale-[1.02] transition disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center space-x-3">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  <>
                    <Lightbulb className="h-5 w-5 mr-2" />
                    Get Career Guidance
                  </>
                )}
              </button>
            </form>

            {/* OUTPUT */}
            {guidance && (
              <div
                ref={guidanceRef}
                className="mt-10 p-6 bg-yellow-500/10 rounded-xl border border-yellow-500/30 shadow-lg"
              >
                <h3 className="text-xl font-black mb-3 flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-yellow-400" />
                  Your Guidance
                </h3>
                <p className="text-white whitespace-pre-wrap leading-relaxed">
                  {guidance}
                </p>
              </div>
            )}
          </div>

          {/* HISTORY */}
          {history.length > 0 && (
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-yellow-500/20 p-8">
              <h3 className="text-2xl font-black mb-4">Recent Results</h3>
              <div className="space-y-4">
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-black/50 rounded-xl border border-yellow-500/10"
                  >
                    <div className="font-semibold text-yellow-400 mb-1">
                      Input: {item.input}
                    </div>
                    <div className="text-gray-300 text-sm line-clamp-3">
                      {item.output}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------
   Reusable Input Component
------------------------------------ */
function InputField({
  label,
  value,
  setValue,
  placeholder,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-300 mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full px-6 py-4 bg-black/50 border border-yellow-500/30 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-500"
      />
    </div>
  );
}
