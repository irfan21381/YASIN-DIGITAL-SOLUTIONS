import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import FileUpload from '@/components/FileUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Subject {
  _id: string;
  name: string;
}

interface UploadMaterialFormProps {
  materialTitle: string;
  setMaterialTitle: (title: string) => void;
  materialDescription: string;
  setMaterialDescription: (description: string) => void;
  materialSubjectId: string;
  setMaterialSubjectId: (subjectId: string) => void;
  setMaterialFile: (file: File | null) => void;
  mySubjects: Subject[];
  handleUploadMaterial: (e: React.FormEvent) => void;
  loading: boolean;
  loadingSubjects: boolean;
  materialFile: File | null;
}

const UploadMaterialForm: React.FC<UploadMaterialFormProps> = ({
  materialTitle,
  setMaterialTitle,
  materialDescription,
  setMaterialDescription,
  materialSubjectId,
  setMaterialSubjectId,
  setMaterialFile,
  mySubjects,
  handleUploadMaterial,
  loading,
  loadingSubjects,
  materialFile,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload New Material</CardTitle>
        <CardDescription>Upload PDFs, PPTs, or Notes for your subjects.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUploadMaterial} className="space-y-4">
          <div>
            <Label htmlFor="materialTitle">Title</Label>
            <Input
              id="materialTitle"
              type="text"
              placeholder="e.g., Introduction to Algebra"
              value={materialTitle}
              onChange={(e) => setMaterialTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="materialDescription">Description (Optional)</Label>
            <Textarea
              id="materialDescription"
              placeholder="Brief description of the material"
              value={materialDescription}
              onChange={(e) => setMaterialDescription(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="materialSubject">Subject</Label>
            <Select
              value={materialSubjectId}
              onValueChange={setMaterialSubjectId}
              required
              disabled={loadingSubjects || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {mySubjects.map((subject) => (
                  <SelectItem key={subject._id} value={subject._id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <FileUpload
            label="Select Material File (PDF, DOCX, TXT)"
            accept=".pdf,.docx,.txt"
            onFileChange={setMaterialFile}
          />
          <Button type="submit" className="w-full" disabled={loading || !materialFile || !materialSubjectId}>
            {loading ? 'Uploading...' : 'Upload Material'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UploadMaterialForm;