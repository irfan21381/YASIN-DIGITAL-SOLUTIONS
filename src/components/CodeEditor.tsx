import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// Declare pyodide globally
declare global {
  interface Window {
    loadPyodide: () => Promise<any>;
    pyodide: any;
  }
}

const CodeEditor: React.FC = () => {
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
  const [code, setCode] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [loadingPyodide, setLoadingPyodide] = useState<boolean>(false);

  useEffect(() => {
    if (language === 'python' && !window.pyodide) {
      loadPyodideOnce();
    }
  }, [language]);

  const loadPyodideOnce = async () => {
    if (window.pyodide) return; // Already loaded

    setLoadingPyodide(true);
    setOutput('Loading Python interpreter (Pyodide)... This may take a moment.');
    try {
      // Dynamically import Pyodide script
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js';
      script.onload = async () => {
        window.pyodide = await window.loadPyodide();
        setOutput('Python interpreter loaded. You can now run Python code.');
        setLoadingPyodide(false);
      };
      script.onerror = (e) => {
        console.error('Failed to load Pyodide:', e);
        setOutput('Error: Failed to load Python interpreter.');
        setLoadingPyodide(false);
        toast.error('Failed to load Python interpreter.');
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error loading Pyodide:', error);
      setOutput('Error: Failed to load Python interpreter.');
      setLoadingPyodide(false);
      toast.error('Failed to load Python interpreter.');
    }
  };

  const runCode = async () => {
    setOutput('');
    try {
      if (language === 'javascript') {
        // Simple JavaScript sandbox (be cautious with eval in production)
        const result = eval(code);
        setOutput(String(result));
      } else if (language === 'python') {
        if (!window.pyodide) {
          setOutput('Python interpreter not loaded. Please wait or try again.');
          return;
        }
        const pyodideOutput = await window.pyodide.runPythonAsync(code);
        setOutput(String(pyodideOutput));
      }
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
      toast.error('Code execution failed.');
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto h-[700px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Coding Lab</CardTitle>
        <Select value={language} onValueChange={(value: 'javascript' | 'python') => setLanguage(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4 p-4">
        <Textarea
          placeholder={`Write your ${language} code here...`}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 font-mono text-sm resize-none"
        />
        <div className="bg-muted p-3 rounded-md h-40 overflow-auto font-mono text-sm text-muted-foreground">
          <h3 className="font-semibold mb-2">Output:</h3>
          <pre>{output}</pre>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button onClick={runCode} disabled={loadingPyodide || (language === 'python' && !window.pyodide)} className="w-full">
          {loadingPyodide ? 'Loading Interpreter...' : 'Run Code'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CodeEditor;