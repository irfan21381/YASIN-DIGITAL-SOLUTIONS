import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { getStudentMaterials, getAvailableQuizzes } from '@/api/student';

// Import new modular components
import StudentMaterialsTable from '@/components/student/StudentMaterialsTable';
import StudentQuizzesTable from '@/components/student/StudentQuizzesTable';
import StudentChatbotCard from '@/components/student/StudentChatbotCard';

interface Material {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  subjectId: { name: string };
}

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  subjectId: { name: string };
  teacherId: { email: string };
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedMaterialForChat, setSelectedMaterialForChat] = useState<string | undefined>(undefined);
  const [loadingMaterials, setLoadingMaterials] = useState<boolean>(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState<boolean>(true);


  useEffect(() => {
    fetchMaterials();
    fetchQuizzes();
  }, []);

  const fetchMaterials = async () => {
    setLoadingMaterials(true);
    try {
      const response = await getStudentMaterials();
      setMaterials(response.data);
    } catch (error: any) {
      console.error('Error fetching materials:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch materials.');
    } finally {
      setLoadingMaterials(false);
    }
  };

  const fetchQuizzes = async () => {
    setLoadingQuizzes(true);
    try {
      const response = await getAvailableQuizzes();
      setQuizzes(response.data);
    } catch (error: any) {
      console.error('Error fetching quizzes:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch quizzes.');
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const handleSelectMaterialForChat = (materialId: string) => {
    setSelectedMaterialForChat(materialId);
  };

  const handleSwitchToGeneralChat = () => {
    setSelectedMaterialForChat(undefined);
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-8">Student Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StudentMaterialsTable
          materials={materials}
          loadingMaterials={loadingMaterials}
          onSelectMaterialForChat={handleSelectMaterialForChat}
        />

        <StudentQuizzesTable
          quizzes={quizzes}
          loadingQuizzes={loadingQuizzes}
        />
      </div>

      <StudentChatbotCard
        selectedMaterialForChat={selectedMaterialForChat}
        onSwitchToGeneralChat={handleSwitchToGeneralChat}
      />
    </div>
  );
};

export default StudentDashboard;