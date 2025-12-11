import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getQuizById, submitQuizAttempt } from '@/api/student';
import { Loader2 } from 'lucide-react';

interface Question {
  questionText: string;
  options: string[];
}

interface QuizData {
  _id: string;
  title: string;
  description?: string;
  questions: Question[];
  totalQuestions: number;
}

const QuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (quizId) {
      fetchQuiz(quizId);
    }
  }, [quizId]);

  const fetchQuiz = async (id: string) => {
    setLoading(true);
    try {
      const response = await getQuizById(id);
      setQuiz(response.data);
    } catch (error: any) {
      console.error('Error fetching quiz:', error);
      toast.error(error.response?.data?.message || 'Failed to load quiz.');
      navigate('/student-dashboard'); // Redirect if quiz not found or unauthorized
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (questionText: string, selectedOption: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionText]: selectedOption,
    }));
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !quizId) return;

    setSubmitting(true);
    try {
      const answersToSubmit = quiz.questions.map((q) => ({
        questionText: q.questionText,
        selectedAnswer: selectedAnswers[q.questionText] || '', // Send empty string if not answered
      }));

      const response = await submitQuizAttempt(quizId, answersToSubmit);
      toast.success('Quiz submitted successfully! Your score: ' + response.data.score);
      navigate('/student-dashboard'); // Redirect after submission
    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      toast.error(error.response?.data?.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return <div className="text-center p-8">Quiz not found or you are not authorized to view it.</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{quiz.title}</CardTitle>
          <CardDescription>{quiz.description}</CardDescription>
          <p className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <h3 className="text-lg font-semibold">{currentQuestion.questionText}</h3>
          <RadioGroup
            value={selectedAnswers[currentQuestion.questionText] || ''}
            onValueChange={(value) => handleOptionChange(currentQuestion.questionText, value)}
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0 || submitting}>
            Previous
          </Button>
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <Button onClick={handleNextQuestion} disabled={submitting}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmitQuiz} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Quiz'
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizPage;