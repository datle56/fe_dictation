import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, SkipBack as Skip, Lightbulb, ArrowRight } from 'lucide-react';
import { useProgress } from '../../contexts/ProgressContext';
import { lessonsData } from '../../data/lessons';

const ReadingLesson: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { startLesson, getProgress, addAttempt } = useProgress();
  
  const lesson = lessonsData[lessonId!];
  const progress = getProgress(lessonId!);
  
  const [currentSentence, setCurrentSentence] = useState(0);
  const [userTranslation, setUserTranslation] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (lesson && !progress) {
      startLesson(lessonId!, 'reading', lesson.sentences.length);
    } else if (progress) {
      setCurrentSentence(progress.currentSentence);
    }
  }, [lesson, progress, lessonId, startLesson]);

  const simulateAIFeedback = (userAnswer: string, correctAnswer: string) => {
    // Simulate AI feedback with scoring
    const similarity = calculateSimilarity(userAnswer.toLowerCase(), correctAnswer.toLowerCase());
    const score = Math.max(3, Math.min(10, 4 + similarity * 6));
    
    return {
      score: score,
      accuracy: similarity > 0.7 ? 'Excellent' : similarity > 0.5 ? 'Good' : 'Needs Improvement',
      feedback: similarity > 0.7 
        ? 'Great translation! You captured the meaning very well.'
        : similarity > 0.5
        ? 'Good attempt. Consider reviewing some key phrases for accuracy.'
        : 'The general idea is there, but work on capturing more specific details.',
      suggestions: similarity < 0.7 ? ['Pay attention to key vocabulary', 'Consider sentence structure', 'Review the reference translation'] : []
    };
  };

  const calculateSimilarity = (str1: string, str2: string) => {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  };

  const handleCheck = async () => {
    if (!userTranslation.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const currentSentenceData = lesson.sentences[currentSentence];
      const aiFeedback = simulateAIFeedback(userTranslation, currentSentenceData.referenceTranslation);
      
      setFeedback(aiFeedback);
      setShowFeedback(true);
      
      // Add attempt to progress
      addAttempt(lessonId!, {
        sentenceIndex: currentSentence,
        userAnswer: userTranslation,
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
      setUserTranslation('');
      setShowFeedback(false);
      setFeedback(null);
    } else {
      // Lesson completed
      navigate('/lessons/reading');
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const showHint = () => {
    const hint = lesson.sentences[currentSentence].referenceTranslation.split(' ').slice(0, 3).join(' ') + '...';
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
              onClick={() => navigate('/lessons/reading')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">{lesson.title}</h1>
              <p className="text-sm text-slate-600">Reading Comprehension</p>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            {currentSentence + 1} / {lesson.sentences.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Column - Full Article */}
        <div className="w-2/3 p-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full p-6 overflow-y-auto">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Reading Passage</h2>
            <div className="prose prose-slate max-w-none">
              {lesson.sentences.map((sentence, index) => {
                let className = "mb-4 p-3 rounded-lg transition-all duration-200 cursor-pointer ";
                
                if (index === currentSentence) {
                  className += "bg-yellow-100 border-2 border-yellow-300 shadow-sm";
                } else if (index < currentSentence) {
                  className += "bg-green-50 border border-green-200 text-slate-600";
                } else {
                  className += "bg-slate-50 border border-slate-200 text-slate-500";
                }

                return (
                  <div
                    key={index}
                    className={className}
                    onClick={() => index <= currentSentence && setCurrentSentence(index)}
                  >
                    <span className="text-xs font-medium text-slate-400 mr-2">
                      [{index + 1}]
                    </span>
                    {sentence.text}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Translation Area */}
        <div className="w-1/3 p-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="p-6 flex-1">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Translate to Vietnamese
              </h3>
              
              {/* Current Sentence */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-slate-800 font-medium leading-relaxed">
                  {currentSentenceData.text}
                </p>
              </div>

              {/* Translation Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Translation:
                </label>
                <textarea
                  value={userTranslation}
                  onChange={(e) => setUserTranslation(e.target.value)}
                  placeholder="Enter your Vietnamese translation here..."
                  className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={showFeedback}
                />
              </div>

              {/* Action Buttons */}
              {!showFeedback ? (
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={handleCheck}
                    disabled={!userTranslation.trim() || isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
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
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2 mb-4"
                >
                  <span>{currentSentence < lesson.sentences.length - 1 ? 'Next Sentence' : 'Complete Lesson'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Feedback Area */}
              {showFeedback && feedback && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-800">AI Feedback</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-slate-600">Score:</span>
                      <span className="bg-blue-600 text-white px-2 py-1 rounded-lg text-sm font-bold">
                        {feedback.score.toFixed(1)}/10
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-slate-600">Accuracy: </span>
                      <span className={`text-sm font-medium ${
                        feedback.accuracy === 'Excellent' ? 'text-green-600' : 
                        feedback.accuracy === 'Good' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {feedback.accuracy}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-700">{feedback.feedback}</p>
                    
                    <div className="bg-white border border-slate-200 rounded p-3">
                      <span className="text-xs font-medium text-slate-500 block mb-1">Reference Translation:</span>
                      <p className="text-sm text-slate-800">{currentSentenceData.referenceTranslation}</p>
                    </div>
                    
                    {feedback.suggestions.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-slate-500 block mb-1">Suggestions:</span>
                        <ul className="text-sm text-slate-700 space-y-1">
                          {feedback.suggestions.map((suggestion: string, index: number) => (
                            <li key={index} className="flex items-start space-x-1">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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

export default ReadingLesson;