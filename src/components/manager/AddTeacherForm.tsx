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

interface AddTeacherFormProps {
  teacherEmail: string;
  setTeacherEmail: (email: string) => void;
  selectedTeacherSubjects: string[];
  handleSelectTeacherSubject: (subjectId: string) => void;
  allSubjects: Subject[];
  handleAddTeacher: (e: React.FormEvent) => void;
  loading: boolean;
  loadingSubjects: boolean;
}

const AddTeacherForm: React.FC<AddTeacherFormProps> = ({
  teacherEmail,
  setTeacherEmail,
  selectedTeacherSubjects,
  handleSelectTeacherSubject,
  allSubjects,
  handleAddTeacher,
  loading,
  loadingSubjects,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Teacher</CardTitle>
        <CardDescription>Add a new teacher to your college and assign subjects.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddTeacher} className="space-y-4">
          <div>
            <Label htmlFor="teacherEmail">Teacher Email</Label>
            <Input
              id="teacherEmail"
              type="email"
              placeholder="teacher@example.com"
              value={teacherEmail}
              onChange={(e) => setTeacherEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="teacherSubjects">Assign Subjects</Label>
            <Select
              onValueChange={handleSelectTeacherSubject}
              value="" // Keep value empty to allow re-selection
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
              {selectedTeacherSubjects.map((subId) => {
                const subject = allSubjects.find((s) => s._id === subId);
                return subject ? (
                  <Badge key={subId} variant="secondary" className="flex items-center gap-1">
                    {subject.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0.5"
                      onClick={() => handleSelectTeacherSubject(subId)}
                      disabled={loading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading || !teacherEmail || selectedTeacherSubjects.length === 0}>
            {loading ? 'Adding Teacher...' : 'Add Teacher'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddTeacherForm;