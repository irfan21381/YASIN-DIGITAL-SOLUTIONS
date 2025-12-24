import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FileUpload from '@/components/FileUpload';

interface UploadStudentsCSVFormProps {
  csvFile: File | null;
  setCsvFile: (file: File | null) => void;
  handleUploadCSV: (e: React.FormEvent) => void;
  loading: boolean;
}

const UploadStudentsCSVForm: React.FC<UploadStudentsCSVFormProps> = ({
  csvFile,
  setCsvFile,
  handleUploadCSV,
  loading,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Students via CSV</CardTitle>
        <CardDescription>Upload a CSV file to bulk add students. (Format: email,subjects)</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUploadCSV} className="space-y-4">
          <FileUpload
            label="Select CSV File"
            accept=".csv"
            onFileChange={setCsvFile}
          />
          <Button type="submit" className="w-full" disabled={loading || !csvFile}>
            {loading ? 'Uploading...' : 'Upload CSV'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UploadStudentsCSVForm;