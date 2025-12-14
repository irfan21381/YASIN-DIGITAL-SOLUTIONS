'use client';

export const dynamic = "force-dynamic";

import Layout from '@/components/AppShell';
import Link from 'next/link';
import {
  BookOpen,
  Upload,
  BarChart3,
  Users,
  FileText,
  Zap,
  ArrowRight,
} from 'lucide-react';

export default function TeacherDashboard() {
  const services = [
    {
      icon: Upload,
      title: 'Upload Materials',
      desc: 'Upload PDFs, PPTs, Notes for AI',
      href: '/teacher/upload',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: BookOpen,
      title: 'AI Quiz Generator',
      desc: 'Generate quizzes automatically',
      href: '/teacher/quiz',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: 'Classroom Manager',
      desc: 'Track student activity & behaviour',
      href: '/teacher/classroom',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      desc: 'View student performance insights',
      href: '/teacher/analytics',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Zap,
      title: 'AI Tools',
      desc: 'Generate study materials instantly',
      href: '/teacher/ai-tools',
      gradient: 'from-pink-500 to-red-500',
    },
    {
      icon: FileText,
      title: 'Content Library',
      desc: 'Manage uploaded teaching content',
      href: '/teacher/content',
      gradient: 'from-indigo-500 to-purple-500',
    },
  ];

  return (
    <Layout>
      <div className="px-4 py-6">
        <h1 className="text-4xl font-black text-white mb-6">
          Teacher Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <Link
                key={i}
                href={service.href}
                className="group relative bg-gray-900 p-6 rounded-2xl border border-purple-500/20 hover:scale-105 transition"
              >
                <Icon className="h-8 w-8 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold">{service.title}</h3>
                <p className="text-gray-400 text-sm">{service.desc}</p>
                <ArrowRight className="mt-4 text-purple-400" />
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
