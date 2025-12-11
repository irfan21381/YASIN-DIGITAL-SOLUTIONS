export const dynamic = "force-dynamic"; // Required for React Query pages

'use client';

import Layout from '../../layout';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Award
} from 'lucide-react';

import {
  Line,
  Doughnut
} from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function StudentAnalyticsPage() {

  /* -----------------------------
     LOAD ANALYTICS DATA
  ------------------------------ */

  const { data: usage = {} } = useQuery({
    queryKey: ['student-usage'],
    queryFn: async () => {
      const res = await api.get('/analytics/student-usage');
      return res.data?.data || { total: 0 };
    },
  });

  const { data: streak = {} } = useQuery({
    queryKey: ['study-streak'],
    queryFn: async () => {
      const res = await api.get('/analytics/study-streak');
      return res.data?.data || { streak: 0 };
    },
  });

  const { data: weakSubjects = {} } = useQuery({
    queryKey: ['weak-subjects'],
    queryFn: async () => {
      const res = await api.get('/analytics/weak-subjects');
      return res.data?.data || { weakSubjects: [] };
    },
  });

  const weakList = weakSubjects?.weakSubjects || [];

  /* -----------------------------
     FAKE PERFORMANCE DATA
  ------------------------------ */
  const performanceData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Quiz Scores',
        data: [75, 82, 78, 88],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4,
      },
    ],
  };

  /* -----------------------------
     SUBJECT-WISE PERFORMANCE
  ------------------------------ */
  const subjectData = {
    labels: weakList.length
      ? weakList.map((s: any) => s.subjectName || `Subject ${s.subjectId}`)
      : ['Math', 'Physics', 'Chemistry'],

    datasets: [
      {
        data: weakList.length
          ? weakList.map((s: any) => s.percentage)
          : [45, 52, 48],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 101, 101, 0.8)',
          'rgba(251, 146, 60, 0.8)',
        ],
      },
    ],
  };

  return (
    <Layout>
      <div className="px-4 py-6">

        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">My Analytics</h1>
              <p className="text-purple-400">Track your learning progress</p>
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
            <Clock className="h-8 w-8 mb-2 opacity-80" />
            <div className="text-3xl font-black mb-1">{streak.streak || 0}</div>
            <p className="text-purple-100 font-semibold">Day Streak</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
            <Target className="h-8 w-8 mb-2 opacity-80" />
            <div className="text-3xl font-black mb-1">{usage.total || 0}</div>
            <p className="text-blue-100 font-semibold">Activities</p>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
            <Award className="h-8 w-8 mb-2 opacity-80" />
            <div className="text-3xl font-black mb-1">85%</div>
            <p className="text-green-100 font-semibold">Avg Score</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl p-6 text-white">
            <TrendingUp className="h-8 w-8 mb-2 opacity-80" />
            <div className="text-3xl font-black mb-1">{weakList.length}</div>
            <p className="text-yellow-100 font-semibold">Weak Topics</p>
          </div>

        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* PERFORMANCE TREND */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/20 p-6">
            <h2 className="text-xl font-black text-white mb-4">Performance Trend</h2>

            <Line
              data={performanceData}
              options={{
                responsive: true,
                plugins: { 
                  legend: { labels: { color: '#fff' } } 
                },
                scales: {
                  x: {
                    ticks: { color: '#9ca3af' },
                    grid: { color: 'rgba(147, 51, 234, 0.1)' }
                  },
                  y: {
                    ticks: { color: '#9ca3af' },
                    grid: { color: 'rgba(147, 51, 234, 0.1)' }
                  }
                }
              }}
            />
          </div>

          {/* SUBJECT PERFORMANCE */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-red-500/20 p-6">
            <h2 className="text-xl font-black text-white mb-4">Subject Performance</h2>

            <Doughnut
              data={subjectData}
              options={{
                responsive: true,
                plugins: { 
                  legend: { labels: { color: '#fff' } } 
                }
              }}
            />
          </div>

        </div>

      </div>
    </Layout>
  );
}
