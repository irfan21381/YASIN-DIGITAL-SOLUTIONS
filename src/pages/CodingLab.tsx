import React from 'react';
import CodeEditor from '@/components/CodeEditor';

const CodingLab: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8">Coding Lab</h1>
      <CodeEditor />
    </div>
  );
};

export default CodingLab;