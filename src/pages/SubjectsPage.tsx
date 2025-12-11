import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { getTeacherSubjects } from '@/api/teacher';
import { getSubjectsForCollege } from '@/api/manager';
import { getStudentEnrolledSubjects } from '@/api/student';
import { Loader2 } from 'lucide-react';

interface Subject {
  _id: string;
  name: string;
  teacherIds?: { email: string }[]; // Populated teachers (only for manager/teacher views)
}

const SubjectsPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSubjects();
  }, [user]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      let fetchedSubjects: Subject[] = [];
      if (hasRole(['TEACHER'])) {
        const response = await getTeacherSubjects();
        fetchedSubjects = response.data;
      } else if (hasRole(['MANAGER'])) {
        const response = await getSubjectsForCollege();
        fetchedSubjects = response.data;
      } else if (hasRole(['STUDENT'])) {
        const response = await getStudentEnrolledSubjects();
        fetchedSubjects = response.data;
      }
      // Super Admin might have a separate endpoint or view all colleges' subjects
      // For now, Super Admin won't see anything specific here unless implemented.

      setSubjects(fetchedSubjects);
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch subjects.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2">Loading subjects...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8">Subjects</h1>

      <Card>
        <CardHeader>
          <CardTitle>Available Subjects</CardTitle>
          <CardDescription>Browse the subjects offered on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject Name</TableHead>
                {hasRole(['TEACHER', 'MANAGER']) && <TableHead>Assigned Teachers</TableHead>}
                {/* Add more columns if needed, e.g., number of materials */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.length > 0 ? (
                subjects.map((subject) => (
                  <TableRow key={subject._id}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    {hasRole(['TEACHER', 'MANAGER']) && (
                      <TableCell>
                        {subject.teacherIds && subject.teacherIds.length > 0
                          ? subject.teacherIds.map(t => t.email).join(', ')
                          : 'N/A'}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={hasRole(['TEACHER', 'MANAGER']) ? 2 : 1} className="text-center py-8">
                    <p className="text-muted-foreground">No subjects available.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectsPage;