'use client';

import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicName: string;
  description?: string;
  courseId: string;
  weekNumber?: number;
}

export default function QuizModal({ isOpen, onClose, topicName, description, courseId, weekNumber }: QuizModalProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const startQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicName, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate quiz');
      }

      const data = await response.json();
      console.log('Received quiz data from API:', data);
      console.log('Questions array:', data.questions);
      console.log('Questions length:', data.questions?.length);

      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        console.error('Invalid or empty questions array:', data);
        throw new Error('No questions were generated. Please try again.');
      }

      console.log('Setting questions:', data.questions);
      setQuestions(data.questions);
      setQuizStarted(true);
      setCurrentQuestion(0);
      setUserAnswers([]);
      setShowResults(false);
      setSelectedAnswer(null);
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = async () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...userAnswers, selectedAnswer];
    setUserAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Quiz finished, save results
      await saveQuizResults(newAnswers);
      setShowResults(true);
    }
  };

  const saveQuizResults = async (answers: number[]) => {
    setSaving(true);
    try {
      const score = answers.filter((answer, index) => answer === questions[index].correctAnswer).length;

      const response = await fetch('/api/quiz-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          topicName,
          weekNumber,
          score,
          totalQuestions: questions.length,
          quizData: {
            questions,
            userAnswers: answers
          }
        }),
      });

      if (!response.ok) {
        console.error('Failed to save quiz results');
      }
    } catch (error) {
      console.error('Error saving quiz results:', error);
    } finally {
      setSaving(false);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    userAnswers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setUserAnswers([]);
    setShowResults(false);
    setQuizStarted(false);
    setError(null);
  };

  const handleClose = () => {
    resetQuiz();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {!quizStarted ? 'Test Quiz' : showResults ? 'Quiz Results' : `Question ${currentQuestion + 1}/${questions.length}`}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {!quizStarted ? (
            <div className="text-center space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{topicName}</h3>
                {description && (
                  <p className="text-gray-600 text-sm">{description}</p>
                )}
              </div>
              <p className="text-gray-700">
                This quiz contains 5 multiple choice questions to test your understanding of this topic.
              </p>
              <button
                onClick={startQuiz}
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Generating Quiz...
                  </>
                ) : (
                  'Start Quiz'
                )}
              </button>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
          ) : showResults ? (
            <div className="space-y-6">
              <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  {calculateScore()} / {questions.length}
                </h3>
                <p className="text-gray-600">
                  You got {calculateScore()} out of {questions.length} questions correct
                </p>
                <div className="mt-4">
                  <div className="text-lg font-semibold text-gray-700">
                    Score: {Math.round((calculateScore() / questions.length) * 100)}%
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">Review Your Answers:</h4>
                {questions.map((q, qIndex) => {
                  const userAnswer = userAnswers[qIndex];
                  const isCorrect = userAnswer === q.correctAnswer;

                  return (
                    <div key={qIndex} className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                      <div className="flex items-start gap-2 mb-2">
                        {isCorrect ? (
                          <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                        ) : (
                          <XCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 mb-2">
                            {qIndex + 1}. {q.question}
                          </p>
                          <p className="text-sm text-gray-600">
                            Your answer: <span className={isCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                              {q.options[userAnswer]}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p className="text-sm text-green-700 font-medium">
                              Correct answer: {q.options[q.correctAnswer]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={resetQuiz}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Take Quiz Again
                </button>
                <button
                  onClick={handleClose}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-lg font-medium text-gray-800 mb-4">
                  {questions[currentQuestion]?.question}
                </p>
                <div className="space-y-3">
                  {questions[currentQuestion]?.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedAnswer === index
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Progress: {currentQuestion + 1} of {questions.length}
                </div>
                <button
                  onClick={handleNextQuestion}
                  disabled={selectedAnswer === null}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
