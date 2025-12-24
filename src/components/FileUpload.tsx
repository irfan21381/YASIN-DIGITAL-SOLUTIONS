import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  label: string;
  accept?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, label, accept = '*' }) => {
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setFileName(file ? file.name : '');
    onFileChange(file);
  };

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="file-upload">{label}</Label>
      <Input
        id="file-upload"
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="cursor-pointer"
      />
      {fileName && <p className="text-sm text-muted-foreground">Selected: {fileName}</p>}
    </div>
  );
};

export default FileUpload;