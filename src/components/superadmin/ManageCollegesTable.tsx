import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

interface College {
  _id: string;
  name: string;
  isActive: boolean;
}

interface ManageCollegesTableProps {
  colleges: College[];
  loadingColleges: boolean;
  handleToggleCollegeStatus: (collegeId: string, currentStatus: boolean) => void;
  loading: boolean;
}

const ManageCollegesTable: React.FC<ManageCollegesTableProps> = ({
  colleges,
  loadingColleges,
  handleToggleCollegeStatus,
  loading,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Colleges</CardTitle>
        <CardDescription>Activate or deactivate colleges on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        {loadingColleges ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2">Loading colleges...</p>
          </div>
        ) : colleges.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>College Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colleges.map((college) => (
                <TableRow key={college._id}>
                  <TableCell className="font-medium">{college.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      college.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {college.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={college.isActive}
                      onCheckedChange={() => handleToggleCollegeStatus(college._id, college.isActive)}
                      disabled={loading}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center py-8">No colleges found.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ManageCollegesTable;