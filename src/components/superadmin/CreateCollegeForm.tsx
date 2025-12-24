import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface CreateCollegeFormProps {
  collegeName: string;
  setCollegeName: (name: string) => void;
  handleCreateCollege: (e: React.FormEvent) => void;
  loading: boolean;
}

const CreateCollegeForm: React.FC<CreateCollegeFormProps> = ({
  collegeName,
  setCollegeName,
  handleCreateCollege,
  loading,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New College</CardTitle>
        <CardDescription>Establish a new educational institution on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateCollege} className="space-y-4">
          <div>
            <Label htmlFor="collegeName">College Name</Label>
            <Input
              id="collegeName"
              type="text"
              placeholder="e.g., Global Tech Institute"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !collegeName}>
            {loading ? 'Creating...' : 'Create College'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateCollegeForm;