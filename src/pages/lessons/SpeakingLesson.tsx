import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, Square, Play, ArrowRight } from 'lucide-react';
import { useProgress } from '../../contexts/ProgressContext';

const SpeakingLesson: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { startLesson, getProgress, addAttempt } = useProgress();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [transcript, setTranscript] = useState('');

  // Mock speaking lesson data
  const lesson = {
    id: lessonId,
    title: 'Personal Introduction',
    questions: [
      {
        question: "Tell me about yourself and your background.",
        timeLimit: 60,
        sampleAnswer: "My name is Sarah, and I'm from Vietnam. I'm currently studying English to improve my communication skills for my career in international business. In my free time, I enjoy reading books and traveling to learn about different cultures.",
        tips: ["Speak clearly and at a moderate pace", "Include personal details like name, origin, and interests", "Mention your goals or aspirations"]
      },
      {
        question: "Describe your hometown and what makes it special.",
        timeLimit: 90,
        sampleAnswer: "I come from Ho Chi Minh City, which is the largest city in Vietnam. It's a vibrant metropolis with a rich history and delicious street food. What makes it special is the blend of traditional Vietnamese culture with modern development. The people are very friendly and welcoming to visitors.",
        tips: ["Describe the location and size", "Mention unique features or attractions", "Talk about the people and culture"]
      },
      {
        question: "What are your future plans and goals?",
        timeLimit: 75,
        sampleAnswer: "In the near future, I plan to complete my IELTS preparation and achieve a band score of 7.0. My long-term goal is to pursue a master's degree abroad, preferably in Australia or Canada. I'm particularly interested in studying international business management to advance my career in the global market.",
        tips: ["Mention both short-term and long-term goals", "Be specific about your plans", "Explain why these goals are important to you"]
      }
    ]
  };

  const progress = getProgress(lessonId!);

  useEffect(() => {
    if (!progress) {
      startLesson(lessonId!, 'speaking', lesson.questions.length);
    } else {
      setCurrentQuestion(progress.currentSentence);
    }
  }, [progress, lessonId, startLesson]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setTranscript('');
    setHasRecording(false);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setHasRecording(true);
    
    // Simulate speech-to-text conversion
    setTimeout(() => {
      const mockTranscript = "Hello, my name is John and I'm from Vietnam. I'm currently studying English to improve my communication skills for my future career. I enjoy learning about different cultures and meeting new people.";
      setTranscript(mockTranscript);
    }, 1500);
  };

  const analyzeRecording = () => {
    // Simulate AI analysis
    const mockFeedback = {
      score: 7.5,
      fluency: 7.0,
      pronunciation: 8.0,
      vocabulary: 7.5,
      grammar: 7.0,
      feedback: "Good overall performance! Your pronunciation is clear and vocabulary usage is appropriate. Work on reducing hesitations to improve fluency.",
      suggestions: [
        "Practice speaking more smoothly without long pauses",
        "Use more varied sentence structures",
        "Include more specific details in your responses"
      ]
    };

    setFeedback(mockFeedback);
    setShowFeedback(true);

    addAttempt(lessonId!, {
      sentenceIndex: currentQuestion,
      userAnswer: transcript,
      correctAnswer: lesson.questions[currentQuestion].sampleAnswer,
      aiFeedback: mockFeedback,
      score: mockFeedback.score,
      attemptNumber: 1,
      createdAt: new Date()
    });
  };

  const handleNext = () => {
    if (currentQuestion < lesson.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setIsRecording(false);
      setRecordingTime(0);
      setHasRecording(false);
      setShowFeedback(false);
      setFeedback(null);
      setTranscript('');
    } else {
      navigate('/lessons/speaking');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestionData = lesson.questions[currentQuestion];
  const progressPercentage = ((currentQuestion + 1) / lesson.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/lessons/speaking')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">{lesson.title}</h1>
              <p className="text-sm text-slate-600">Speaking Practice</p>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            Question {currentQuestion + 1} / {lesson.questions.length}
          </div>
        </div>
        
        <div className="mt-4">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Question and Instructions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Question {currentQuestion + 1}</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-slate-800 font-medium text-lg leading-relaxed">
                  {currentQuestionData.question}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Time limit: {currentQuestionData.timeLimit} seconds</span>
                <span>Think before you speak</span>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h4 className="font-semibold text-slate-800 mb-3">Speaking Tips</h4>
              <ul className="space-y-2">
                {currentQuestionData.tips.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-slate-700">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sample Answer */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h4 className="font-semibold text-slate-800 mb-3">Sample Answer</h4>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-700 italic leading-relaxed">
                  "{currentQuestionData.sampleAnswer}"
                </p>
              </div>
            </div>
          </div>

          {/* Recording Area */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Your Recording</h3>
              
              {/* Recording Controls */}
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                    isRecording 
                      ? 'bg-red-500 animate-pulse' 
                      : hasRecording 
                      ? 'bg-green-500' 
                      : 'bg-slate-300'
                  }`}>
                    {isRecording ? (
                      <button
                        onClick={stopRecording}
                        className="w-16 h-16 bg-white rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
                      >
                        <Square className="w-8 h-8 text-red-500" />
                      </button>
                    ) : (
                      <button
                        onClick={startRecording}
                        className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
                      >
                        <Mic className="w-8 h-8 text-slate-600" />
                      </button>
                    )}
                  </div>
                  
                  {isRecording && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {formatTime(recordingTime)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  {isRecording ? (
                    <p className="text-red-600 font-medium">Recording... Click the square to stop</p>
                  ) : hasRecording ? (
                    <p className="text-green-600 font-medium">Recording complete!</p>
                  ) : (
                    <p className="text-slate-600">Click the microphone to start recording</p>
                  )}
                </div>

                {hasRecording && !showFeedback && (
                  <button
                    onClick={analyzeRecording}
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-6 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200"
                  >
                    Analyze Recording
                  </button>
                )}

                {showFeedback && (
                  <button
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>{currentQuestion < lesson.questions.length - 1 ? 'Next Question' : 'Complete Lesson'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h4 className="font-semibold text-slate-800 mb-3">Your Speech (Transcript)</h4>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-sm text-slate-700 leading-relaxed">{transcript}</p>
                </div>
              </div>
            )}

            {/* Feedback */}
            {showFeedback && feedback && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-800">AI Analysis</h4>
                  <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold">
                    {feedback.score}/9.0
                  </span>
                </div>
                
                {/* Detailed Scores */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Fluency</div>
                    <div className="font-bold text-blue-600">{feedback.fluency}</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Pronunciation</div>
                    <div className="font-bold text-green-600">{feedback.pronunciation}</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Vocabulary</div>
                    <div className="font-bold text-purple-600">{feedback.vocabulary}</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Grammar</div>
                    <div className="font-bold text-orange-600">{feedback.grammar}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm text-slate-700">{feedback.feedback}</p>
                  
                  <div>
                    <span className="text-sm font-medium text-slate-600 block mb-2">Suggestions for improvement:</span>
                    <ul className="text-sm text-slate-700 space-y-1">
                      {feedback.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="flex items-start space-x-1">
                          <span className="text-red-500 mt-1">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakingLesson;