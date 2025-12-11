import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface AnalyticsData {
  totalMaterials: number;
  pendingMaterials: number;
  totalQuizzes: number;
  totalQuizAttempts: number;
  studentPerformance: any[]; // Placeholder
}

interface TeacherAnalyticsCardProps {
  analytics: AnalyticsData | null;
  loadingAnalytics: boolean;
}

const TeacherAnalyticsCard: React.FC<TeacherAnalyticsCardProps> = ({ analytics, loadingAnalytics }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Analytics</CardTitle>
        <CardDescription>Overview of your teaching activities.</CardDescription>
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
              <h3 className="text-lg font-semibold">Total Approved Materials</h3>
              <p className="text-2xl">{analytics.totalMaterials}</p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold">Pending Materials</h3>
              <p className="text-2xl">{analytics.pendingMaterials}</p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold">Total Quizzes Created</h3>
              <p className="text-2xl">{analytics.totalQuizzes}</p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold">Total Quiz Attempts</h3>
              <p className="text-2xl">{analytics.totalQuizAttempts}</p>
            </div>
          </>
        ) : (
          <p className="col-span-full text-center">No analytics data available.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherAnalyticsCard;