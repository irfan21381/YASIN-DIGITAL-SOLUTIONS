import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { createCollege, assignManager, activateDeactivateCollege, getGlobalAnalytics, getAllColleges } from '@/api/admin';

// Import new modular components
import GlobalAnalyticsCard from '@/components/superadmin/GlobalAnalyticsCard';
import CreateCollegeForm from '@/components/superadmin/CreateCollegeForm';
import AssignManagerForm from '@/components/superadmin/AssignManagerForm';
import ManageCollegesTable from '@/components/superadmin/ManageCollegesTable';

interface College {
  _id: string;
  name: string;
  isActive: boolean;
}

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

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [collegeName, setCollegeName] = useState<string>('');
  const [managerEmail, setManagerEmail] = useState<string>('');
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('');
  const [colleges, setColleges] = useState<College[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // General loading for form submissions
  const [loadingColleges, setLoadingColleges] = useState<boolean>(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true);


  useEffect(() => {
    fetchColleges();
    fetchAnalytics();
  }, []);

  const fetchColleges = async () => {
    setLoadingColleges(true);
    try {
      const response = await getAllColleges();
      setColleges(response.data);
    } catch (error: any) {
      console.error('Error fetching colleges:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch colleges.');
    } finally {
      setLoadingColleges(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const response = await getGlobalAnalytics();
      setAnalytics(response.data);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch global analytics.');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleCreateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await createCollege(collegeName);
      toast.success(`College "${response.data.name}" created successfully!`);
      setCollegeName('');
      fetchColleges(); // Refresh list
      fetchAnalytics(); // Refresh analytics
    } catch (error: any) {
      console.error('Create college error:', error);
      toast.error(error.response?.data?.message || 'Failed to create college.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await assignManager(selectedCollegeId, managerEmail);
      toast.success(response.message);
      setManagerEmail('');
      setSelectedCollegeId('');
      fetchAnalytics(); // Refresh analytics
    } catch (error: any) {
      console.error('Assign manager error:', error);
      toast.error(error.response?.data?.message || 'Failed to assign manager.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCollegeStatus = async (collegeId: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const response = await activateDeactivateCollege(collegeId, !currentStatus);
      toast.success(response.message);
      fetchColleges(); // Refresh list
      fetchAnalytics(); // Refresh analytics
    } catch (error: any) {
      console.error('Toggle college status error:', error);
      toast.error(error.response?.data?.message || 'Failed to update college status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-8">Super Admin Dashboard</h1>

      <GlobalAnalyticsCard analytics={analytics} loadingAnalytics={loadingAnalytics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CreateCollegeForm
          collegeName={collegeName}
          setCollegeName={setCollegeName}
          handleCreateCollege={handleCreateCollege}
          loading={loading}
        />

        <AssignManagerForm
          managerEmail={managerEmail}
          setManagerEmail={setManagerEmail}
          selectedCollegeId={selectedCollegeId}
          setSelectedCollegeId={setSelectedCollegeId}
          colleges={colleges}
          handleAssignManager={handleAssignManager}
          loading={loading}
          loadingColleges={loadingColleges}
        />
      </div>

      <ManageCollegesTable
        colleges={colleges}
        loadingColleges={loadingColleges}
        handleToggleCollegeStatus={handleToggleCollegeStatus}
        loading={loading}
      />
    </div>
  );
};

export default SuperAdminDashboard;