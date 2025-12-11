import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Subject {
  _id: string;
  name: string;
}

interface Material {
  _id: string;
  title: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  subjectId: { name: string };
}

interface GenerateQuizFormProps {
  quizTitle: string;
  setQuizTitle: (title: string) => void;
  quizDescription: string;
  setQuizDescription: (description: string) => void;
  quizMaterialId: string;
  setQuizMaterialId: (materialId: string) => void;
  quizSubjectId: string;
  setQuizSubjectId: (subjectId: string) => void;
  numQuestions: number;
  setNumQuestions: (num: number) => void;
  quizGenerationMode: 'material' | 'general';
  setQuizGenerationMode: (mode: 'material' | 'general') => void;
  generalTopic: string;
  setGeneralTopic: (topic: string) => void;
  mySubjects: Subject[];
  myMaterials: Material[];
  handleGenerateQuiz: (e: React.FormEvent) => void;
  loading: boolean;
  loadingSubjects: boolean;
  loadingMaterials: boolean;
}

const GenerateQuizForm: React.FC<GenerateQuizFormProps> = ({
  quizTitle,
  setQuizTitle,
  quizDescription,
  setQuizDescription,
  quizMaterialId,
  setQuizMaterialId,
  quizSubjectId,
  setQuizSubjectId,
  numQuestions,
  setNumQuestions,
  quizGenerationMode,
  setQuizGenerationMode,
  generalTopic,
  setGeneralTopic,
  mySubjects,
  myMaterials,
  handleGenerateQuiz,
  loading,
  loadingSubjects,
  loadingMaterials,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Quiz</CardTitle>
        <CardDescription>Automatically create quizzes from your uploaded materials or a general topic.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGenerateQuiz} className="space-y-4">
          <div>
            <Label htmlFor="quizTitle">Quiz Title</Label>
            <Input
              id="quizTitle"
              type="text"
              placeholder="e.g., Algebra Chapter 1 Quiz"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="quizDescription">Description (Optional)</Label>
            <Textarea
              id="quizDescription"
              placeholder="Brief description of the quiz"
              value={quizDescription}
              onChange={(e) => setQuizDescription(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="quizSubject">Subject for Quiz</Label>
            <Select
              value={quizSubjectId}
              onValueChange={setQuizSubjectId}
              required
              disabled={loadingSubjects || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subject for quiz" />
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

          <div>
            <Label htmlFor="quizMode">Generate from:</Label>
            <Select
              value={quizGenerationMode}
              onValueChange={(value: 'material' | 'general') => setQuizGenerationMode(value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select generation mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="material">Material</SelectItem>
                <SelectItem value="general">General Topic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {quizGenerationMode === 'material' && (
            <div>
              <Label htmlFor="quizMaterial">Select Material</Label>
              <Select
                value={quizMaterialId}
                onValueChange={setQuizMaterialId}
                required={quizGenerationMode === 'material'}
                disabled={loadingMaterials || loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an approved material" />
                </SelectTrigger>
                <SelectContent>
                  {myMaterials.filter(m => m.status === 'APPROVED').map((material) => (
                    <SelectItem key={material._id} value={material._id}>
                      {material.title} ({material.subjectId.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {quizGenerationMode === 'general' && (
            <div>
              <Label htmlFor="generalTopic">General Topic</Label>
              <Input
                id="generalTopic"
                type="text"
                placeholder="e.g., Photosynthesis, World War II"
                value={generalTopic}
                onChange={(e) => setGeneralTopic(e.target.value)}
                required={quizGenerationMode === 'general'}
                disabled={loading}
              />
            </div>
          )}

          <div>
            <Label htmlFor="numQuestions">Number of Questions</Label>
            <Input
              id="numQuestions"
              type="number"
              min="1"
              max="20"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !quizSubjectId || (quizGenerationMode === 'material' && !quizMaterialId) || (quizGenerationMode === 'general' && !generalTopic.trim())}>
            {loading ? 'Generating Quiz...' : 'Generate Quiz'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GenerateQuizForm;