import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, SkipBack as Skip, Lightbulb, ArrowRight } from 'lucide-react';
import { useProgress } from '../../contexts/ProgressContext';
import { lessonsData } from '../../data/lessons';

const WritingLesson: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { startLesson, getProgress, addAttempt } = useProgress();
  
  const lesson = lessonsData[lessonId!];
  const progress = getProgress(lessonId!);
  
  const [currentSentence, setCurrentSentence] = useState(0);
  const [userWriting, setUserWriting] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [completedSentences, setCompletedSentences] = useState<string[]>([]);

  useEffect(() => {
    if (lesson && !progress) {
      startLesson(lessonId!, 'writing', lesson.sentences.length);
    } else if (progress) {
      setCurrentSentence(progress.currentSentence);
      // Load completed sentences from progress
      const completed = progress.attempts.map(attempt => attempt.userAnswer);
      setCompletedSentences(completed);
    }
  }, [lesson, progress, lessonId, startLesson]);

  const simulateAIFeedback = (userAnswer: string, referenceAnswer: string) => {
    // Simulate comprehensive writing feedback
    const grammarScore = Math.random() * 3 + 7; // 7-10
    const vocabularyScore = Math.random() * 3 + 6; // 6-9
    const structureScore = Math.random() * 3 + 6; // 6-9
    const overallScore = (grammarScore * 0.4 + vocabularyScore * 0.3 + structureScore * 0.3);
    
    return {
      score: overallScore,
      grammar: {
        score: grammarScore,
        feedback: grammarScore > 8 ? 'Excellent grammar usage!' : grammarScore > 6 ? 'Good grammar with minor issues.' : 'Grammar needs improvement.'
      },
      vocabulary: {
        score: vocabularyScore,
        feedback: vocabularyScore > 8 ? 'Rich vocabulary choices!' : vocabularyScore > 6 ? 'Good vocabulary usage.' : 'Consider using more varied vocabulary.'
      },
      structure: {
        score: structureScore,
        feedback: structureScore > 8 ? 'Well-structured sentence!' : structureScore > 6 ? 'Good sentence structure.' : 'Work on sentence structure.'
      },
      suggestions: [
        'Consider using more complex sentence structures',
        'Add transition words for better flow',
        'Use more specific vocabulary'
      ].slice(0, Math.floor(Math.random() * 3) + 1)
    };
  };

  const handleCheck = async () => {
    if (!userWriting.trim()) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      const currentSentenceData = lesson.sentences[currentSentence];
      const aiFeedback = simulateAIFeedback(userWriting, currentSentenceData.referenceTranslation);
      
      setFeedback(aiFeedback);
      setShowFeedback(true);
      
      // Add completed sentence
      const newCompleted = [...completedSentences];
      newCompleted[currentSentence] = userWriting;
      setCompletedSentences(newCompleted);
      
      addAttempt(lessonId!, {
        sentenceIndex: currentSentence,
        userAnswer: userWriting,
        correctAnswer: currentSentenceData.referenceTranslation,
        aiFeedback,
        score: aiFeedback.score,
        attemptNumber: 1,
        createdAt: new Date()
      });
      
      setIsLoading(false);
    }, 1500);
  };

  const handleNext = () => {
    if (currentSentence < lesson.sentences.length - 1) {
      setCurrentSentence(currentSentence + 1);
      setUserWriting('');
      setShowFeedback(false);
      setFeedback(null);
    } else {
      navigate('/lessons/writing');
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const showHint = () => {
    const hint = lesson.sentences[currentSentence].referenceTranslation.split(' ').slice(0, 4).join(' ') + '...';
    alert(`Hint: ${hint}`);
  };

  if (!lesson) {
    return <div>Lesson not found</div>;
  }

  const currentSentenceData = lesson.sentences[currentSentence];
  const progressPercentage = ((currentSentence + 1) / lesson.sentences.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/lessons/writing')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">{lesson.title}</h1>
              <p className="text-sm text-slate-600">Writing Practice</p>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            {currentSentence + 1} / {lesson.sentences.length}
          </div>
        </div>
        
        <div className="mt-4">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Column - Vietnamese Text */}
        <div className="w-2/3 p-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full p-6 overflow-y-auto">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Vietnamese Text</h2>
            <div className="space-y-4">
              {lesson.sentences.map((sentence, index) => {
                let className = "p-4 rounded-lg transition-all duration-200 cursor-pointer border-2 ";
                
                if (index === currentSentence) {
                  className += "bg-yellow-100 border-yellow-300 shadow-sm";
                } else if (index < currentSentence && completedSentences[index]) {
                  className += "bg-green-50 border-green-200";
                } else {
                  className += "bg-slate-50 border-slate-200 text-slate-500";
                }

                return (
                  <div key={index} className={className} onClick={() => index <= currentSentence && setCurrentSentence(index)}>
                    <div className="flex items-start space-x-3">
                      <span className="text-xs font-medium text-slate-400 mt-1">
                        [{index + 1}]
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 mb-2">{sentence.text}</p>
                        {completedSentences[index] && (
                          <div className="bg-white border border-green-200 rounded p-2 mt-2">
                            <p className="text-sm text-green-800 italic">"{completedSentences[index]}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Writing Area */}
        <div className="w-1/3 p-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="p-6 flex-1">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Write in English
              </h3>
              
              {/* Current Vietnamese Sentence */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-slate-800 font-medium leading-relaxed">
                  {currentSentenceData.text}
                </p>
              </div>

              {/* Writing Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your English sentence:
                </label>
                <textarea
                  value={userWriting}
                  onChange={(e) => setUserWriting(e.target.value)}
                  placeholder="Write your English translation here..."
                  className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  disabled={showFeedback}
                />
              </div>

              {/* Action Buttons */}
              {!showFeedback ? (
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={handleCheck}
                    disabled={!userWriting.trim() || isLoading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Check</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={showHint}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <Lightbulb className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSkip}
                    className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    <Skip className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 mb-4"
                >
                  <span>{currentSentence < lesson.sentences.length - 1 ? 'Next Sentence' : 'Complete Lesson'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Detailed Feedback */}
              {showFeedback && feedback && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-800">AI Writing Analysis</h4>
                    <span className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-bold">
                      {feedback.score.toFixed(1)}/10
                    </span>
                  </div>
                  
                  {/* Detailed Scores */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-xs text-slate-500 mb-1">Grammar</div>
                      <div className="font-bold text-blue-600">{feedback.grammar.score.toFixed(1)}</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-xs text-slate-500 mb-1">Vocabulary</div>
                      <div className="font-bold text-green-600">{feedback.vocabulary.score.toFixed(1)}</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-xs text-slate-500 mb-1">Structure</div>
                      <div className="font-bold text-purple-600">{feedback.structure.score.toFixed(1)}</div>
                    </div>
                  </div>
                  
                  {/* Feedback Details */}
                  <div className="space-y-3">
                    <div className="bg-white border rounded p-3">
                      <span className="text-xs font-medium text-blue-600 block mb-1">Grammar:</span>
                      <p className="text-sm text-slate-700">{feedback.grammar.feedback}</p>
                    </div>
                    
                    <div className="bg-white border rounded p-3">
                      <span className="text-xs font-medium text-green-600 block mb-1">Vocabulary:</span>
                      <p className="text-sm text-slate-700">{feedback.vocabulary.feedback}</p>
                    </div>
                    
                    <div className="bg-white border rounded p-3">
                      <span className="text-xs font-medium text-purple-600 block mb-1">Structure:</span>
                      <p className="text-sm text-slate-700">{feedback.structure.feedback}</p>
                    </div>
                  </div>
                  
                  {/* Reference */}
                  <div className="bg-white border border-slate-200 rounded p-3">
                    <span className="text-xs font-medium text-slate-500 block mb-1">Reference Translation:</span>
                    <p className="text-sm text-slate-800 italic">"{currentSentenceData.referenceTranslation}"</p>
                  </div>
                  
                  {/* Suggestions */}
                  {feedback.suggestions.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded p-3">
                      <span className="text-xs font-medium text-slate-500 block mb-2">Suggestions for improvement:</span>
                      <ul className="text-sm text-slate-700 space-y-1">
                        {feedback.suggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="flex items-start space-x-1">
                            <span className="text-orange-500 mt-1">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingLesson;