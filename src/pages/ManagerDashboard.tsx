import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { addTeacher, addStudent, uploadStudentsCSV, approveMaterial, getCollegeAnalytics, getSubjectsForCollege, getPendingMaterialsForCollege, createSubject } from '@/api/manager';

// Import new modular components
import ManagerAnalyticsCard from '@/components/manager/ManagerAnalyticsCard';
import AddTeacherForm from '@/components/manager/AddTeacherForm';
import AddStudentForm from '@/components/manager/AddStudentForm';
import CreateSubjectForm from '@/components/manager/CreateSubjectForm';
import UploadStudentsCSVForm from '@/components/manager/UploadStudentsCSVForm';
import PendingMaterialsTable from '@/components/manager/PendingMaterialsTable';

interface Subject {
  _id: string;
  name: string;
}

interface Material {
  _id: string;
  title: string;
  fileType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  teacherId: { email: string };
  subjectId: { name: string };
}

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

const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [teacherEmail, setTeacherEmail] = useState<string>('');
  const [studentEmail, setStudentEmail] = useState<string>('');
  const [selectedTeacherSubjects, setSelectedTeacherSubjects] = useState<string[]>([]);
  const [selectedStudentSubjects, setSelectedStudentSubjects] = useState<string[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [pendingMaterials, setPendingMaterials] = useState<Material[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // General loading for form submissions
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(true);
  const [loadingMaterials, setLoadingMaterials] = useState<boolean>(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true);
  const [newSubjectName, setNewSubjectName] = useState<string>('');


  useEffect(() => {
    fetchSubjects();
    fetchPendingMaterials();
    fetchAnalytics();
  }, []);

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const response = await getSubjectsForCollege();
      setAllSubjects(response.data);
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch subjects.');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchPendingMaterials = async () => {
    setLoadingMaterials(true);
    try {
      const response = await getPendingMaterialsForCollege();
      setPendingMaterials(response.data);
    } catch (error: any) {
      console.error('Error fetching pending materials:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch pending materials.');
    } finally {
      setLoadingMaterials(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const response = await getCollegeAnalytics();
      setAnalytics(response.data);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch college analytics.');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await addTeacher(teacherEmail, selectedTeacherSubjects);
      toast.success(response.message);
      setTeacherEmail('');
      setSelectedTeacherSubjects([]);
      fetchAnalytics();
    } catch (error: any) {
      console.error('Add teacher error:', error);
      toast.error(error.response?.data?.message || 'Failed to add teacher.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await addStudent(studentEmail, false, selectedStudentSubjects); // isPublic is false for college students
      toast.success(response.message);
      setStudentEmail('');
      setSelectedStudentSubjects([]);
      fetchAnalytics();
    } catch (error: any) {
      console.error('Add student error:', error);
      toast.error(error.response?.data?.message || 'Failed to add student.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      toast.error('Please select a CSV file.');
      return;
    }
    setLoading(true);
    try {
      const response = await uploadStudentsCSV(csvFile);
      toast.success('Student CSV uploaded and processed!');
      console.log('CSV upload results:', response.results);
      setCsvFile(null);
      fetchAnalytics();
    } catch (error: any) {
      console.error('Upload CSV error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload student CSV.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRejectMaterial = async (materialId: string, status: 'APPROVED' | 'REJECTED') => {
    setLoading(true);
    try {
      const response = await approveMaterial(materialId, status);
      toast.success(response.message);
      fetchPendingMaterials(); // Refresh list
      fetchAnalytics();
    } catch (error: any) {
      console.error('Approve/reject material error:', error);
      toast.error(error.response?.data?.message || `Failed to ${status.toLowerCase()} material.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeacherSubject = (subjectId: string) => {
    setSelectedTeacherSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((s) => s !== subjectId) : [...prev, subjectId]
    );
  };

  const handleSelectStudentSubject = (subjectId: string) => {
    setSelectedStudentSubjects((prev) =>
      prev.includes(subjectId) ? prev.filter((s) => s !== subjectId) : [...prev, subjectId]
    );
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await createSubject(newSubjectName);
      toast.success(response.message);
      setNewSubjectName('');
      fetchSubjects(); // Refresh subjects list
      fetchAnalytics();
    } catch (error: any) {
      console.error('Create subject error:', error);
      toast.error(error.response?.data?.message || 'Failed to create subject.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-8">Manager Dashboard</h1>

      <ManagerAnalyticsCard analytics={analytics} loadingAnalytics={loadingAnalytics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AddTeacherForm
          teacherEmail={teacherEmail}
          setTeacherEmail={setTeacherEmail}
          selectedTeacherSubjects={selectedTeacherSubjects}
          handleSelectTeacherSubject={handleSelectTeacherSubject}
          allSubjects={allSubjects}
          handleAddTeacher={handleAddTeacher}
          loading={loading}
          loadingSubjects={loadingSubjects}
        />

        <AddStudentForm
          studentEmail={studentEmail}
          setStudentEmail={setStudentEmail}
          selectedStudentSubjects={selectedStudentSubjects}
          handleSelectStudentSubject={handleSelectStudentSubject}
          allSubjects={allSubjects}
          handleAddStudent={handleAddStudent}
          loading={loading}
          loadingSubjects={loadingSubjects}
        />
      </div>

      <CreateSubjectForm
        newSubjectName={newSubjectName}
        setNewSubjectName={setNewSubjectName}
        handleCreateSubject={handleCreateSubject}
        loading={loading}
      />

      <UploadStudentsCSVForm
        csvFile={csvFile}
        setCsvFile={setCsvFile}
        handleUploadCSV={handleUploadCSV}
        loading={loading}
      />

      <PendingMaterialsTable
        pendingMaterials={pendingMaterials}
        loadingMaterials={loadingMaterials}
        handleApproveRejectMaterial={handleApproveRejectMaterial}
        loading={loading}
      />
    </div>
  );
};

export default ManagerDashboard;