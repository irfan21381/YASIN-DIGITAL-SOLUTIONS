'use client';

export const dynamic = "force-dynamic";

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Award
} from 'lucide-react';

import { Line, Doughnut } from 'react-chartjs-2';
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

  return (
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

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-purple-600 rounded-2xl p-6 text-white">
          <Clock className="h-8 w-8 mb-2" />
          <div className="text-3xl font-black">{streak.streak || 0}</div>
          <p>Day Streak</p>
        </div>

        <div className="bg-blue-600 rounded-2xl p-6 text-white">
          <Target className="h-8 w-8 mb-2" />
          <div className="text-3xl font-black">{usage.total || 0}</div>
          <p>Activities</p>
        </div>

        <div className="bg-green-600 rounded-2xl p-6 text-white">
          <Award className="h-8 w-8 mb-2" />
          <div className="text-3xl font-black">85%</div>
          <p>Avg Score</p>
        </div>

        <div className="bg-yellow-600 rounded-2xl p-6 text-white">
          <TrendingUp className="h-8 w-8 mb-2" />
          <div className="text-3xl font-black">{weakList.length}</div>
          <p>Weak Topics</p>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black p-6 rounded-2xl">
          <Line data={{
            labels: ['W1', 'W2', 'W3', 'W4'],
            datasets: [{
              label: 'Quiz Scores',
              data: [75, 82, 78, 88],
              borderColor: '#9333ea',
            }],
          }} />
        </div>

        <div className="bg-black p-6 rounded-2xl">
          <Doughnut data={{
            labels: ['Math', 'Physics', 'Chemistry'],
            datasets: [{
              data: [45, 52, 48],
              backgroundColor: ['#ef4444', '#f97316', '#facc15'],
            }],
          }} />
        </div>
      </div>

    </div>
  );
}
