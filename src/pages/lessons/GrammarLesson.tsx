import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ArrowRight, BookOpen } from 'lucide-react';
import { useProgress } from '../../contexts/ProgressContext';

const GrammarLesson: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { startLesson, getProgress, addAttempt } = useProgress();
  
  const [currentExercise, setCurrentExercise] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  // Mock grammar lesson data
  const lesson = {
    id: lessonId,
    title: 'Complex Sentence Structures',
    grammarRule: {
      title: 'Complex Sentences with Subordinate Clauses',
      explanation: 'A complex sentence contains one independent clause and one or more dependent (subordinate) clauses. The dependent clause is introduced by subordinating conjunctions like although, because, since, when, while, if, etc.',
      formula: 'Independent Clause + Subordinating Conjunction + Dependent Clause',
      examples: [
        'Although it was raining, we decided to go for a walk.',
        'She studied hard because she wanted to pass the exam.',
        'When the movie ended, everyone applauded.'
      ]
    },
    exercises: [
      {
        type: 'fill-blank',
        instruction: 'Fill in the blank with the appropriate subordinating conjunction.',
        sentence: '_____ she was tired, she continued working on her project.',
        options: ['Although', 'Because', 'When', 'If'],
        correct: 'Although',
        explanation: '"Although" is correct because it shows contrast between being tired and continuing to work.'
      },
      {
        type: 'combine',
        instruction: 'Combine these two sentences using a subordinating conjunction.',
        sentences: ['The weather was bad.', 'We postponed the picnic.'],
        correct: 'Because the weather was bad, we postponed the picnic.',
        explanation: 'We use "because" to show the reason for postponing the picnic.'
      },
      {
        type: 'identify',
        instruction: 'Identify the dependent clause in this sentence.',
        sentence: 'While I was cooking dinner, my friend called me.',
        correct: 'While I was cooking dinner',
        explanation: 'The dependent clause starts with "While" and cannot stand alone as a complete sentence.'
      },
      {
        type: 'correct',
        instruction: 'Choose the grammatically correct sentence.',
        options: [
          'Because was raining, we stayed inside.',
          'Because it was raining, we stayed inside.',
          'Because raining, we stayed inside.',
          'It was raining because, we stayed inside.'
        ],
        correct: 'Because it was raining, we stayed inside.',
        explanation: 'The dependent clause must have a subject (it) and verb (was raining).'
      }
    ]
  };

  const progress = getProgress(lessonId!);

  useEffect(() => {
    if (!progress) {
      startLesson(lessonId!, 'grammar', lesson.exercises.length);
    } else {
      setCurrentExercise(progress.currentSentence);
    }
  }, [progress, lessonId, startLesson]);

  const handleAnswerSubmit = () => {
    const currentExerciseData = lesson.exercises[currentExercise];
    const isCorrect = userAnswer.trim().toLowerCase() === currentExerciseData.correct.toLowerCase();
    const score = isCorrect ? 1 : 0; // Thay đổi: 1 điểm cho mỗi câu hoàn thành đúng

    const aiFeedback = {
      score,
      correct: isCorrect,
      explanation: currentExerciseData.explanation,
      correctAnswer: currentExerciseData.correct
    };

    setFeedback(aiFeedback);
    setShowFeedback(true);

    addAttempt(lessonId!, {
      sentenceIndex: currentExercise,
      userAnswer,
      correctAnswer: currentExerciseData.correct,
      aiFeedback,
      score,
      attemptNumber: 1,
      createdAt: new Date()
    });
  };

  const handleNext = () => {
    if (currentExercise < lesson.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setUserAnswer('');
      setShowFeedback(false);
      setFeedback(null);
    } else {
      navigate('/lessons/grammar');
    }
  };

  const currentExerciseData = lesson.exercises[currentExercise];
  const progressPercentage = ((currentExercise + 1) / lesson.exercises.length) * 100;

  const renderExercise = () => {
    switch (currentExerciseData.type) {
      case 'fill-blank':
        return (
          <div className="space-y-4">
            <p className="text-slate-700">{currentExerciseData.instruction}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-lg font-medium text-slate-800">
                {currentExerciseData.sentence?.replace('_____', '________')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {currentExerciseData.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setUserAnswer(option)}
                  className={`p-3 text-left border rounded-lg transition-all ${
                    userAnswer === option
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-800'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                  disabled={showFeedback}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 'combine':
        return (
          <div className="space-y-4">
            <p className="text-slate-700">{currentExerciseData.instruction}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              {currentExerciseData.sentences?.map((sentence, index) => (
                <p key={index} className="text-slate-800 font-medium">• {sentence}</p>
              ))}
            </div>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Write your combined sentence here..."
              className="w-full h-24 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              disabled={showFeedback}
            />
          </div>
        );

      case 'identify':
        return (
          <div className="space-y-4">
            <p className="text-slate-700">{currentExerciseData.instruction}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-lg font-medium text-slate-800">{currentExerciseData.sentence}</p>
            </div>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type the dependent clause here..."
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={showFeedback}
            />
          </div>
        );

      case 'correct':
        return (
          <div className="space-y-4">
            <p className="text-slate-700">{currentExerciseData.instruction}</p>
            <div className="space-y-3">
              {currentExerciseData.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setUserAnswer(option)}
                  className={`w-full p-4 text-left border rounded-lg transition-all ${
                    userAnswer === option
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-800'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                  disabled={showFeedback}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/lessons/grammar')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">{lesson.title}</h1>
              <p className="text-sm text-slate-600">Grammar Practice</p>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            Exercise {currentExercise + 1} / {lesson.exercises.length}
          </div>
        </div>
        
        <div className="mt-4">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grammar Rule Explanation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-slate-800">Grammar Rule</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-slate-800 mb-2">{lesson.grammarRule.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{lesson.grammarRule.explanation}</p>
                </div>
                
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <h5 className="text-sm font-medium text-indigo-800 mb-1">Formula:</h5>
                  <p className="text-sm text-indigo-700 font-mono">{lesson.grammarRule.formula}</p>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-slate-700 mb-2">Examples:</h5>
                  <div className="space-y-2">
                    {lesson.grammarRule.examples.map((example, index) => (
                      <div key={index} className="bg-slate-50 border border-slate-200 rounded p-2">
                        <p className="text-sm text-slate-700 italic">"{example}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Exercise Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Exercise {currentExercise + 1}
                </h3>
                <div className="w-full bg-slate-200 rounded-full h-1">
                  <div 
                    className="bg-indigo-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${((currentExercise + 1) / lesson.exercises.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {renderExercise()}

              <div className="mt-6">
                {!showFeedback ? (
                  <button
                    onClick={handleAnswerSubmit}
                    disabled={!userAnswer.trim()}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Check Answer</span>
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>{currentExercise < lesson.exercises.length - 1 ? 'Next Exercise' : 'Complete Lesson'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Feedback */}
              {showFeedback && feedback && (
                <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-800">Feedback</h4>
                    <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                      feedback.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {feedback.correct ? 'Correct!' : 'Incorrect'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {!feedback.correct && (
                      <div className="bg-white border border-slate-200 rounded p-3">
                        <span className="text-sm font-medium text-slate-600">Correct Answer: </span>
                        <span className="text-sm text-slate-800 font-medium">{feedback.correctAnswer}</span>
                      </div>
                    )}
                    
                    <p className="text-sm text-slate-700">{feedback.explanation}</p>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-800 mb-2">
                        Score: {feedback.score}/1
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrammarLesson;