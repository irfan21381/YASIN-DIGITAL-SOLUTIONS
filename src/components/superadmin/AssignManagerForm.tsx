import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface College {
  _id: string;
  name: string;
  isActive: boolean;
}

interface AssignManagerFormProps {
  managerEmail: string;
  setManagerEmail: (email: string) => void;
  selectedCollegeId: string;
  setSelectedCollegeId: (id: string) => void;
  colleges: College[];
  handleAssignManager: (e: React.FormEvent) => void;
  loading: boolean;
  loadingColleges: boolean;
}

const AssignManagerForm: React.FC<AssignManagerFormProps> = ({
  managerEmail,
  setManagerEmail,
  selectedCollegeId,
  setSelectedCollegeId,
  colleges,
  handleAssignManager,
  loading,
  loadingColleges,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Manager to College</CardTitle>
        <CardDescription>Assign an existing or new user as a manager for a college.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAssignManager} className="space-y-4">
          <div>
            <Label htmlFor="selectCollege">Select College</Label>
            <select
              id="selectCollege"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedCollegeId}
              onChange={(e) => setSelectedCollegeId(e.target.value)}
              required
              disabled={loadingColleges || loading}
            >
              <option value="">Select a college</option>
              {colleges.map((college) => (
                <option key={college._id} value={college._id}>
                  {college.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="managerEmail">Manager Email</Label>
            <Input
              id="managerEmail"
              type="email"
              placeholder="manager@example.com"
              value={managerEmail}
              onChange={(e) => setManagerEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !selectedCollegeId || !managerEmail}>
            {loading ? 'Assigning...' : 'Assign Manager'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AssignManagerForm;