import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface Material {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  subjectId: { name: string };
}

interface TeacherMaterialsTableProps {
  myMaterials: Material[];
  loadingMaterials: boolean;
}

const TeacherMaterialsTable: React.FC<TeacherMaterialsTableProps> = ({ myMaterials, loadingMaterials }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Uploaded Materials</CardTitle>
        <CardDescription>Manage your uploaded educational content.</CardDescription>
      </CardHeader>
      <CardContent>
        {loadingMaterials ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2">Loading materials...</p>
          </div>
        ) : myMaterials.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>File Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myMaterials.map((material) => (
                <TableRow key={material._id}>
                  <TableCell className="font-medium">{material.title}</TableCell>
                  <TableCell>{material.subjectId.name}</TableCell>
                  <TableCell>{material.fileType.split('/')[1]}</TableCell>
                  <TableCell>
                    <Badge
                      className={`${
                        material.status === 'APPROVED'
                          ? 'bg-green-500'
                          : material.status === 'PENDING'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      } text-white`}
                    >
                      {material.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">View</Button>
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No materials uploaded yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherMaterialsTable;