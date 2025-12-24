import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface Subject {
  _id: string;
  name: string;
}

interface AddStudentFormProps {
  studentEmail: string;
  setStudentEmail: (email: string) => void;
  selectedStudentSubjects: string[];
  handleSelectStudentSubject: (subjectId: string) => void;
  allSubjects: Subject[];
  handleAddStudent: (e: React.FormEvent) => void;
  loading: boolean;
  loadingSubjects: boolean;
}

const AddStudentForm: React.FC<AddStudentFormProps> = ({
  studentEmail,
  setStudentEmail,
  selectedStudentSubjects,
  handleSelectStudentSubject,
  allSubjects,
  handleAddStudent,
  loading,
  loadingSubjects,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Student</CardTitle>
        <CardDescription>Add a new student to your college and enroll them in subjects.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddStudent} className="space-y-4">
          <div>
            <Label htmlFor="studentEmail">Student Email</Label>
            <Input
              id="studentEmail"
              type="email"
              placeholder="student@example.com"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="studentSubjects">Enroll in Subjects</Label>
            <Select
              onValueChange={handleSelectStudentSubject}
              value=""
              disabled={loadingSubjects || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subjects" />
              </SelectTrigger>
              <SelectContent>
                {allSubjects.map((subject) => (
                  <SelectItem key={subject._id} value={subject._id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedStudentSubjects.map((subId) => {
                const subject = allSubjects.find((s) => s._id === subId);
                return subject ? (
                  <Badge key={subId} variant="secondary" className="flex items-center gap-1">
                    {subject.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0.5"
                      onClick={() => handleSelectStudentSubject(subId)}
                      disabled={loading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading || !studentEmail || selectedStudentSubjects.length === 0}>
            {loading ? 'Adding Student...' : 'Add Student'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddStudentForm;