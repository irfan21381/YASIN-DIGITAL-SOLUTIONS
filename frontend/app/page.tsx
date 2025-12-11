"use client";

import Link from "next/link";
import {
  Brain,
  BookOpen,
  Users,
  Award,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
  Code,
  BarChart3,
  Video,
  FileText,
  CheckCircle2,
  Rocket,
} from "lucide-react";

export default function Home() {
  const services = [
    { icon: Brain, title: "AI Doubt Solving", desc: "Teacher-controlled intelligent answers" },
    { icon: BookOpen, title: "AI Quiz Generator", desc: "Auto-generate unique question papers" },
    { icon: Shield, title: "Anti-Cheat System", desc: "Advanced exam monitoring" },
    { icon: Users, title: "AI Mentor", desc: "Personalized learning guidance" },
    { icon: FileText, title: "Content Management", desc: "Digital library system" },
    { icon: BarChart3, title: "Analytics Dashboard", desc: "Performance insights" },
    { icon: Zap, title: "Notes Generator", desc: "AI-powered study materials" },
    { icon: Code, title: "Coding Lab", desc: "Practice with AI assistance" },
    { icon: Video, title: "Video Generator", desc: "AI teaching videos" },
    { icon: Award, title: "Classroom Manager", desc: "Smart class management" },
  ];

  const extraServices = [
    { title: "Manager Portal", desc: "Complete college management" },
    { title: "Multi-Role Login", desc: "One email, all roles" },
    { title: "Data Safety", desc: "Enterprise-grade security" },
    { title: "Public Student Mode", desc: "Free access for growth" },
    { title: "College Integration", desc: "Full support & training" },
  ];

  const serviceColors = [
    "from-purple-500 to-pink-500",
    "from-blue-500 to-cyan-500",
    "from-pink-500 to-red-500",
    "from-green-500 to-emerald-500",
    "from-yellow-500 to-orange-500",
    "from-indigo-500 to-purple-500",
    "from-red-500 to-pink-500",
    "from-cyan-500 to-blue-500",
    "from-orange-500 to-red-500",
    "from-emerald-500 to-teal-500",
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-full h-full bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-black/80 backdrop-blur-xl border-b border-purple-500/20 sticky top-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-75 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
                  <Brain className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  YDS EduAI
                </span>
                <p className="text-xs text-purple-400">AI Learning Suite</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="/public"
                className="text-purple-400 hover:text-pink-400 font-semibold transition"
              >
                Free Mode
              </Link>
              <Link
                href="/auth/login"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all font-bold"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 px-6 py-3 rounded-full mb-8 backdrop-blur-sm">
            <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
            <span className="text-yellow-400 font-bold">
              India's #1 AI-Powered Learning Platform
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight">
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
              Transform Education
            </span>
            <span className="block text-white mt-2">With AI Power</span>
          </h1>

          <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            15 Powerful AI Services. One Complete Platform.
            <span className="block text-purple-400 mt-2 font-semibold">
              For Colleges. For Students. For Excellence.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/auth/login"
              className="group px-10 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl hover:scale-110 transition-all font-black text-lg flex items-center space-x-3"
            >
              <Rocket className="h-6 w-6 group-hover:rotate-12 transition-transform" />
              <span>Get Started Now</span>
              <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Link>

            <Link
              href="/public"
              className="px-10 py-5 bg-white/10 border-2 border-purple-500/50 rounded-2xl hover:bg-white/20 hover:scale-110 transition-all font-bold text-lg"
            >
              Try Free Mode
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              15 Powerful Services
            </span>
          </h2>
          <p className="text-2xl text-gray-400 max-w-3xl mx-auto">
            Everything you need for modern AI-powered education
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, i) => {
            const Icon = service.icon;
            const color = serviceColors[i % serviceColors.length];

            return (
              <div
                key={service.title}
                className="group relative bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-purple-500/20 hover:scale-105 hover:border-purple-500/50 hover:shadow-purple-500/20 hover:shadow-2xl transition-all"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition`} />

                <div
                  className={`relative bg-gradient-to-br ${color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform`}
                >
                  <Icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition">
                  {service.title}
                </h3>

                <p className="text-gray-400">{service.desc}</p>

                <div className="flex items-center text-purple-400 mt-4 opacity-0 group-hover:opacity-100 transition">
                  <span className="text-sm font-semibold">Learn more</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {extraServices.map((item) => (
            <div
              key={item.title}
              className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-blue-500/20 hover:border-blue-500/50 transition-all"
            >
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
                <h4 className="text-xl font-bold text-white">{item.title}</h4>
              </div>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

            <div className="relative z-10">
              <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
                Ready to Transform Your College?
              </h2>

              <p className="text-2xl text-white/90 mb-10 max-w-3xl mx-auto">
                Join the AI Education Revolution.  
                No LMS offers this many AI services in one place.
              </p>

              <Link
                href="/auth/login"
                className="inline-flex items-center space-x-3 px-10 py-5 bg-white text-purple-600 rounded-2xl hover:scale-110 transition-all font-black text-lg"
              >
                <Rocket className="h-6 w-6" />
                <span>Start Your Journey</span>
                <ArrowRight className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black border-t border-purple-500/20 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              YDS EduAI
            </span>
          </div>

          <p className="text-gray-400">© 2025 YDS EduAI. All rights reserved.</p>
          <p className="text-purple-400 font-semibold">
            India’s #1 AI-Powered College Learning Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
