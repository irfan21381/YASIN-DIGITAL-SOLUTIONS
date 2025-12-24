import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface AnalyticsData {
  totalColleges: number;
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalMaterials: number;
  totalQuizzes: number;
  totalQuizAttempts: number;
  aiUsage: {
    totalQueries: number;
    totalEmbeddings: number;
  };
}

interface GlobalAnalyticsCardProps {
  analytics: AnalyticsData | null;
  loadingAnalytics: boolean;
}

const GlobalAnalyticsCard: React.FC<GlobalAnalyticsCardProps> = ({ analytics, loadingAnalytics }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Analytics</CardTitle>
        <CardDescription>Overview of the entire YDS EDUAI platform.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loadingAnalytics ? (
          <div className="col-span-full text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2">Loading analytics...</p>
          </div>
        ) : analytics ? (
          <>
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold">Total Colleges</h3>
              <p className="text-2xl">{analytics.totalColleges}</p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold">Total Users</h3>
              <p className="text-2xl">{analytics.totalUsers}</p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold">Total Teachers</h3>
              <p className="text-2xl">{analytics.totalTeachers}</p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold">Total Students</h3>
              <p className="text-2xl">{analytics.totalStudents}</p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold">Approved Materials</h3>
              <p className="text-2xl">{analytics.totalMaterials}</p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold">Total Quizzes</h3>
              <p className="text-2xl">{analytics.totalQuizzes}</p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold">Total Quiz Attempts</h3>
              <p className="text-2xl">{analytics.totalQuizAttempts}</p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold">AI Queries</h3>
              <p className="text-2xl">{analytics.aiUsage.totalQueries}</p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold">AI Embeddings</h3>
              <p className="text-2xl">{analytics.aiUsage.totalEmbeddings}</p>
            </div>
          </>
        ) : (
          <p className="col-span-full text-center">No analytics data available.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default GlobalAnalyticsCard;