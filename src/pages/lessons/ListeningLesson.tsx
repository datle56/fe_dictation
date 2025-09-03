import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Volume2, Check, ArrowRight } from 'lucide-react';
import { useProgress } from '../../contexts/ProgressContext';

const ListeningLesson: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { startLesson, getProgress, addAttempt } = useProgress();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // 3 minutes
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  // Mock listening data
  const lesson = {
    id: lessonId,
    title: 'University Lecture: History',
    transcript: `Good morning everyone. Today we're going to discuss the Industrial Revolution, which began in Britain in the late 18th century. This period marked a major turning point in human history. Before the Industrial Revolution, most people lived in rural areas and worked in agriculture. Manufacturing was done by hand in homes or small workshops. However, the introduction of machinery changed everything. Factories were built to house these new machines, and people moved from the countryside to cities to work in them. The textile industry was one of the first to be mechanized. Water wheels and later steam engines provided the power needed to run the machines. This led to increased production and lower costs. Transportation also improved dramatically during this period. Canals, roads, and eventually railways were built to move goods and people more efficiently. The Industrial Revolution had profound social effects as well. It created new social classes and changed the way people lived and worked.`,
    questions: [
      {
        question: "According to the lecture, where did the Industrial Revolution begin?",
        options: ["France", "Germany", "Britain", "United States"],
        correct: 2,
        explanation: "The lecture clearly states that the Industrial Revolution began in Britain in the late 18th century."
      },
      {
        question: "What was one of the first industries to be mechanized?",
        options: ["Transportation", "Textile", "Agriculture", "Mining"],
        correct: 1,
        explanation: "The speaker mentions that the textile industry was one of the first to be mechanized."
      },
      {
        question: "What provided power to run the early machines?",
        options: ["Electricity", "Manual labor", "Water wheels and steam engines", "Wind power"],
        correct: 2,
        explanation: "The lecture mentions that water wheels and later steam engines provided the power needed to run the machines."
      }
    ]
  };

  const progress = getProgress(lessonId!);

  useEffect(() => {
    if (!progress) {
      startLesson(lessonId!, 'listening', lesson.questions.length);
    } else {
      setCurrentQuestion(progress.currentSentence);
    }
  }, [progress, lessonId, startLesson]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time: number) => {
    setCurrentTime(time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSubmit = () => {
    const currentQuestionData = lesson.questions[currentQuestion];
    const isCorrect = userAnswer === currentQuestionData.correct.toString();
    const score = isCorrect ? 1 : 0; // Thay đổi: 1 điểm cho mỗi câu hoàn thành đúng

    const aiFeedback = {
      score,
      correct: isCorrect,
      explanation: currentQuestionData.explanation,
      correctAnswer: currentQuestionData.options[currentQuestionData.correct]
    };

    setFeedback(aiFeedback);
    setShowFeedback(true);

    addAttempt(lessonId!, {
      sentenceIndex: currentQuestion,
      userAnswer: currentQuestionData.options[parseInt(userAnswer)] || userAnswer,
      correctAnswer: currentQuestionData.options[currentQuestionData.correct],
      aiFeedback,
      score,
      attemptNumber: 1,
      createdAt: new Date()
    });
  };

  const handleNext = () => {
    if (currentQuestion < lesson.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setUserAnswer('');
      setShowFeedback(false);
      setFeedback(null);
    } else {
      navigate('/lessons/listening');
    }
  };

  const currentQuestionData = lesson.questions[currentQuestion];
  const progressPercentage = ((currentQuestion + 1) / lesson.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/lessons/listening')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">{lesson.title}</h1>
              <p className="text-sm text-slate-600">Listening Comprehension</p>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            Question {currentQuestion + 1} / {lesson.questions.length}
          </div>
        </div>
        
        <div className="mt-4">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Audio Player */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={togglePlayback}
              className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full flex items-center justify-center hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
            </button>
            
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percentage = x / rect.width;
                seekTo(Math.floor(percentage * duration));
              }}>
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <Volume2 className="w-5 h-5 text-slate-600" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transcript */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Transcript</h3>
            <div className="bg-slate-50 rounded-lg p-4 h-64 overflow-y-auto">
              <p className="text-slate-700 leading-relaxed">{lesson.transcript}</p>
            </div>
          </div>

          {/* Question Area */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Question {currentQuestion + 1}</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-slate-800 font-medium">{currentQuestionData.question}</p>
              </div>

              <div className="space-y-2">
                {currentQuestionData.options.map((option, index) => (
                  <label key={index} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="answer"
                      value={index}
                      checked={userAnswer === index.toString()}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="w-4 h-4 text-purple-600"
                      disabled={showFeedback}
                    />
                    <span className="text-slate-700">{option}</span>
                  </label>
                ))}
              </div>

              {!showFeedback ? (
                <button
                  onClick={handleAnswerSubmit}
                  disabled={!userAnswer}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit Answer</span>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>{currentQuestion < lesson.questions.length - 1 ? 'Next Question' : 'Complete Lesson'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Feedback */}
              {showFeedback && feedback && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-800">Result</h4>
                    <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                      feedback.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {feedback.correct ? 'Correct!' : 'Incorrect'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700">
                      <strong>Correct Answer:</strong> {feedback.correctAnswer}
                    </p>
                    <p className="text-sm text-slate-700">{feedback.explanation}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800 mb-2">
                      Score: {feedback.score}/1
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

export default ListeningLesson;