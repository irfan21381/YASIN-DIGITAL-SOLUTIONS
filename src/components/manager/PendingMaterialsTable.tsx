import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface Material {
  _id: string;
  title: string;
  fileType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  teacherId: { email: string };
  subjectId: { name: string };
}

interface PendingMaterialsTableProps {
  pendingMaterials: Material[];
  loadingMaterials: boolean;
  handleApproveRejectMaterial: (materialId: string, status: 'APPROVED' | 'REJECTED') => void;
  loading: boolean;
}

const PendingMaterialsTable: React.FC<PendingMaterialsTableProps> = ({
  pendingMaterials,
  loadingMaterials,
  handleApproveRejectMaterial,
  loading,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Approve Teacher Uploads</CardTitle>
        <CardDescription>Review and approve materials uploaded by teachers.</CardDescription>
      </CardHeader>
      <CardContent>
        {loadingMaterials ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2">Loading pending materials...</p>
          </div>
        ) : pendingMaterials.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>File Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingMaterials.map((material) => (
                <TableRow key={material._id}>
                  <TableCell className="font-medium">{material.title}</TableCell>
                  <TableCell>{material.subjectId.name}</TableCell>
                  <TableCell>{material.teacherId.email}</TableCell>
                  <TableCell>{material.fileType.split('/')[1]}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApproveRejectMaterial(material._id, 'APPROVED')}
                      disabled={loading}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleApproveRejectMaterial(material._id, 'REJECTED')}
                      disabled={loading}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No pending materials for approval.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingMaterialsTable;