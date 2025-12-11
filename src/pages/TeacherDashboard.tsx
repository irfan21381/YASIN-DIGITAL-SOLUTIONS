import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { uploadMaterial, generateQuiz, getTeacherSubjects, getTeacherMaterials, getTeacherAnalytics, getTeacherQuizzes } from '@/api/teacher';

// Import new modular components
import TeacherAnalyticsCard from '@/components/teacher/TeacherAnalyticsCard';
import UploadMaterialForm from '@/components/teacher/UploadMaterialForm';
import GenerateQuizForm from '@/components/teacher/GenerateQuizForm';
import TeacherMaterialsTable from '@/components/teacher/TeacherMaterialsTable';
import TeacherQuizzesTable from '@/components/teacher/TeacherQuizzesTable';

interface Subject {
  _id: string;
  name: string;
}

interface Material {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  subjectId: { name: string }; // Populated subject name
}

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  subjectId: { name: string }; // Populated subject name
}

interface AnalyticsData {
  totalMaterials: number;
  pendingMaterials: number;
  totalQuizzes: number;
  totalQuizAttempts: number;
  studentPerformance: any[]; // Placeholder
}

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [materialTitle, setMaterialTitle] = useState<string>('');
  const [materialDescription, setMaterialDescription] = useState<string>('');
  const [materialSubjectId, setMaterialSubjectId] = useState<string>('');
  const [materialFile, setMaterialFile] = useState<File | null>(null);

  const [quizTitle, setQuizTitle] = useState<string>('');
  const [quizDescription, setQuizDescription] = useState<string>('');
  const [quizMaterialId, setQuizMaterialId] = useState<string>('');
  const [quizSubjectId, setQuizSubjectId] = useState<string>('');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [quizGenerationMode, setQuizGenerationMode] = useState<'material' | 'general'>('material');
  const [generalTopic, setGeneralTopic] = useState<string>('');

  const [mySubjects, setMySubjects] = useState<Subject[]>([]);
  const [myMaterials, setMyMaterials] = useState<Material[]>([]);
  const [myQuizzes, setMyQuizzes] = useState<Quiz[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // General loading for form submissions
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(true);
  const [loadingMaterials, setLoadingMaterials] = useState<boolean>(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState<boolean>(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true);


  useEffect(() => {
    fetchMySubjects();
    fetchMyMaterials();
    fetchMyQuizzes();
    fetchAnalytics();
  }, []);

  const fetchMySubjects = async () => {
    setLoadingSubjects(true);
    try {
      const response = await getTeacherSubjects();
      setMySubjects(response.data);
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch your subjects.');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchMyMaterials = async () => {
    setLoadingMaterials(true);
    try {
      const response = await getTeacherMaterials();
      setMyMaterials(response.data);
    } catch (error: any) {
      console.error('Error fetching materials:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch your materials.');
    } finally {
      setLoadingMaterials(false);
    }
  };

  const fetchMyQuizzes = async () => {
    setLoadingQuizzes(true);
    try {
      const response = await getTeacherQuizzes();
      setMyQuizzes(response.data);
    } catch (error: any) {
      console.error('Error fetching quizzes:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch your quizzes.');
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const response = await getTeacherAnalytics();
      setAnalytics(response.data);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch teacher analytics.');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialFile || !materialSubjectId) {
      toast.error('Please fill all fields and select a file.');
      return;
    }
    setLoading(true);
    try {
      const response = await uploadMaterial(materialTitle, materialDescription, materialSubjectId, materialFile);
      toast.success(response.message);
      setMaterialTitle('');
      setMaterialDescription('');
      setMaterialSubjectId('');
      setMaterialFile(null);
      fetchMyMaterials(); // Refresh materials list
      fetchAnalytics();
    } catch (error: any) {
      console.error('Upload material error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload material.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle || !quizSubjectId || numQuestions < 1) {
      toast.error('Please fill all required quiz fields.');
      return;
    }

    if (quizGenerationMode === 'material' && !quizMaterialId) {
      toast.error('Please select a material for quiz generation.');
      return;
    }
    if (quizGenerationMode === 'general' && !generalTopic.trim()) {
      toast.error('Please enter a general topic for quiz generation.');
      return;
    }

    setLoading(true);
    try {
      const response = await generateQuiz(
        quizGenerationMode === 'material' ? quizMaterialId : undefined,
        quizSubjectId,
        quizTitle,
        quizDescription,
        numQuestions,
        quizGenerationMode === 'general' ? generalTopic : undefined
      );
      toast.success(response.message);
      setQuizTitle('');
      setQuizDescription('');
      setQuizMaterialId('');
      setQuizSubjectId('');
      setNumQuestions(5);
      setGeneralTopic('');
      fetchMyQuizzes(); // Refresh quizzes list
      fetchAnalytics();
    } catch (error: any) {
      console.error('Generate quiz error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-8">Teacher Dashboard</h1>

      <TeacherAnalyticsCard analytics={analytics} loadingAnalytics={loadingAnalytics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UploadMaterialForm
          materialTitle={materialTitle}
          setMaterialTitle={setMaterialTitle}
          materialDescription={materialDescription}
          setMaterialDescription={setMaterialDescription}
          materialSubjectId={materialSubjectId}
          setMaterialSubjectId={setMaterialSubjectId}
          setMaterialFile={setMaterialFile}
          mySubjects={mySubjects}
          handleUploadMaterial={handleUploadMaterial}
          loading={loading}
          loadingSubjects={loadingSubjects}
          materialFile={materialFile}
        />

        <GenerateQuizForm
          quizTitle={quizTitle}
          setQuizTitle={setQuizTitle}
          quizDescription={quizDescription}
          setQuizDescription={setQuizDescription}
          quizMaterialId={quizMaterialId}
          setQuizMaterialId={setQuizMaterialId}
          quizSubjectId={quizSubjectId}
          setQuizSubjectId={setQuizSubjectId}
          numQuestions={numQuestions}
          setNumQuestions={setNumQuestions}
          quizGenerationMode={quizGenerationMode}
          setQuizGenerationMode={setQuizGenerationMode}
          generalTopic={generalTopic}
          setGeneralTopic={setGeneralTopic}
          mySubjects={mySubjects}
          myMaterials={myMaterials}
          handleGenerateQuiz={handleGenerateQuiz}
          loading={loading}
          loadingSubjects={loadingSubjects}
          loadingMaterials={loadingMaterials}
        />
      </div>

      <TeacherMaterialsTable myMaterials={myMaterials} loadingMaterials={loadingMaterials} />

      <TeacherQuizzesTable myQuizzes={myQuizzes} loadingQuizzes={loadingQuizzes} />
    </div>
  );
};

export default TeacherDashboard;