import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface AnalyticsData {
  totalTeachers: number;
  totalStudents: number;
  totalSubjects: number;
  totalMaterials: number;
  pendingMaterials: number;
  totalQuizzes: number;
  totalQuizAttempts: number;
  aiUsage: {
    totalQueries: number;
    totalEmbeddings: number;
  };
}

interface ManagerAnalyticsCardProps {
  analytics: AnalyticsData | null;
  loadingAnalytics: boolean;
}

const ManagerAnalyticsCard: React.FC<ManagerAnalyticsCardProps> = ({ analytics, loadingAnalytics }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>College Analytics</CardTitle>
        <CardDescription>Overview of your college's performance and usage.</CardDescription>
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
              <h3 className="text-lg font-semibold">Total Teachers</h3>
              <p className="text-2xl">{analytics.totalTeachers}</p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold">Total Students</h3>
              <p className="text-2xl">{analytics.totalStudents}</p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold">Total Subjects</h3>
              <p className="text-2xl">{analytics.totalSubjects}</p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold">Approved Materials</h3>
              <p className="text-2xl">{analytics.totalMaterials}</p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold">Pending Materials</h3>
              <p className="text-2xl">{analytics.pendingMaterials}</p>
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

export default ManagerAnalyticsCard;