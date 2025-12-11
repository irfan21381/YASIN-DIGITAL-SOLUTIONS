import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Material {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  subjectId: { name: string };
}

interface StudentMaterialsTableProps {
  materials: Material[];
  loadingMaterials: boolean;
  onSelectMaterialForChat: (materialId: string) => void;
}

const StudentMaterialsTable: React.FC<StudentMaterialsTableProps> = ({
  materials,
  loadingMaterials,
  onSelectMaterialForChat,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Materials</CardTitle>
        <CardDescription>Access educational materials for your enrolled subjects.</CardDescription>
      </CardHeader>
      <CardContent>
        {loadingMaterials ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2">Loading materials...</p>
          </div>
        ) : materials.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material._id}>
                  <TableCell className="font-medium">{material.title}</TableCell>
                  <TableCell>{material.subjectId.name}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link to={`/material/${material._id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onSelectMaterialForChat(material._id)}
                    >
                      Ask AI
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No materials available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentMaterialsTable;