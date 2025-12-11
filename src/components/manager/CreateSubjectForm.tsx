import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface CreateSubjectFormProps {
  newSubjectName: string;
  setNewSubjectName: (name: string) => void;
  handleCreateSubject: (e: React.FormEvent) => void;
  loading: boolean;
}

const CreateSubjectForm: React.FC<CreateSubjectFormProps> = ({
  newSubjectName,
  setNewSubjectName,
  handleCreateSubject,
  loading,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Subject</CardTitle>
        <CardDescription>Add a new subject to your college.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div>
            <Label htmlFor="newSubjectName">Subject Name</Label>
            <Input
              id="newSubjectName"
              type="text"
              placeholder="e.g., Advanced Calculus"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !newSubjectName}>
            {loading ? 'Creating Subject...' : 'Create Subject'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateSubjectForm;