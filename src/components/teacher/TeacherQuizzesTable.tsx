import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  subjectId: { name: string };
}

interface TeacherQuizzesTableProps {
  myQuizzes: Quiz[];
  loadingQuizzes: boolean;
}

const TeacherQuizzesTable: React.FC<TeacherQuizzesTableProps> = ({ myQuizzes, loadingQuizzes }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Created Quizzes</CardTitle>
        <CardDescription>Manage the quizzes you have generated.</CardDescription>
      </CardHeader>
      <CardContent>
        {loadingQuizzes ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2">Loading quizzes...</p>
          </div>
        ) : myQuizzes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myQuizzes.map((quiz) => (
                <TableRow key={quiz._id}>
                  <TableCell className="font-medium">{quiz.title}</TableCell>
                  <TableCell>{quiz.subjectId.name}</TableCell>
                  <TableCell className="text-right">
                    <Link to={`/quiz/${quiz._id}`}>
                      <Button variant="outline" size="sm">View Quiz</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No quizzes created yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherQuizzesTable;