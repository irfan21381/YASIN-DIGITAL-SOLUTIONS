'use client';

export const dynamic = "force-dynamic";

import Layout from '@/components/AppShell';
import { useState, DragEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);

  const upload = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await api.post('/api/teacher/upload-material', data);
      return res.data;
    },
    onSuccess: () => toast.success('Upload successful'),
    onError: () => toast.error('Upload failed'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error('Select a file');

    const data = new FormData();
    data.append('file', file);
    upload.mutate(data);
  };

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="p-6 max-w-xl mx-auto">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button className="mt-4 bg-purple-600 px-4 py-2 rounded">
          Upload
        </button>
      </form>
    </Layout>
  );
}
