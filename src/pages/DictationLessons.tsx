import React from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Star, Volume2, CheckCircle } from 'lucide-react';
import { useProgress } from '../contexts/ProgressContext';
import { api } from '../utils/api';

const DictationLessons: React.FC = () => {
  const { getProgress } = useProgress();
  const { category } = useParams<{ category?: string }>();
  const [searchParams] = useSearchParams();
  const [lessons, setLessons] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  // Audio playback state (chỉ 1 audio player hoạt động)
  const [playingLessonId, setPlayingLessonId] = React.useState<string | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [currentAudioURL, setCurrentAudioURL] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchLessons = async () => {
      const categoryId = searchParams.get('category_id');
      if (!categoryId) {
        setError('Category ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('=== Fetching lessons for category ID ===', categoryId);
        
        // Use the working endpoint: /categories/{categoryId}/lessons
        const response = await api.getLessonsByCategory(categoryId);
        console.log('=== Lessons response ===', response);
        
        if (response.success && response.data) {
          console.log('API call successful, mapping lessons...');
          // Map lessons with proper field names for the UI
          const mappedLessons = response.data.map((lesson: any) => ({
            ...lesson,
            lessonId: lesson.id,
            title: lesson.lesson_name || lesson.video_title,
            level: lesson.vocab_level || 'Intermediate',
            description: lesson.category_description || `Practice with ${lesson.lesson_name}`,
            duration: lesson.duration || 120, // Default duration in seconds
            accent: lesson.speech_to_text_lang_code === 'en-US' ? 'American' : 'International',
            audioURL: lesson.audio_src || lesson.youtube_embed_url,
            topics: lesson.skill_name || 'Dictation'
          }));
          setLessons(mappedLessons);
          console.log('Lessons mapped successfully:', mappedLessons);
        } else {
          console.error('Lessons API failed:', response);
          setError(response.message || 'Failed to load lessons');
          setLessons([]);
        }
      } catch (error) {
        console.error('Error fetching lessons:', error);
        setError('Failed to connect to server. Please try again.');
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [searchParams]);

  // Khi đổi bài hoặc dừng, cập nhật audio src
  React.useEffect(() => {
    if (audioRef.current && currentAudioURL) {
      audioRef.current.src = currentAudioURL;
      audioRef.current.play();
    }
  }, [currentAudioURL]);

  // Xử lý khi audio kết thúc
  React.useEffect(() => {
    if (!audioRef.current) return;
    const handleEnded = () => {
      setIsPlaying(false);
      setPlayingLessonId(null);
    };
    audioRef.current.addEventListener('ended', handleEnded);
    return () => {
      audioRef.current?.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handlePlayAudio = (lessonId: string, audioURL: string | undefined) => {
    if (!audioURL) return;
    if (playingLessonId === lessonId && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      setPlayingLessonId(null);
    } else {
      setCurrentAudioURL(audioURL);
      setPlayingLessonId(lessonId);
      setIsPlaying(true);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <div className="text-lg text-slate-600">Loading lessons...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard/dictation"
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Categories</span>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-slate-800">
          {lessons.length > 0 ? lessons[0].category_name || 'Lessons' : 'All Lessons'}
        </h1>
      </div>
      {/* Lessons List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-800">Available Lessons</h2>
        <div className="grid gap-6">
          {lessons.map((lesson: any) => {
            const progress = getProgress(lesson.lessonId);
            const completionPercentage = progress 
              ? Math.round((progress.completedSentences / progress.totalSentences) * 100)
              : 0;
            // Log audioURL for debugging
            console.log('Lesson', lesson.lessonId, 'audioURL:', lesson.audioURL);
            return (
              <div key={lesson.lessonId} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-slate-800">{lesson.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.level)}`}>
                          {lesson.level}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-4">{lesson.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {lesson.topics?.split(',').map((topic: string, topicIndex: number) => (
                          <span key={topicIndex} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg">
                            {topic.trim()}
                          </span>
                        ))}
                      </div>
                      {/* Audio playback button */}
                      {lesson.audioURL && (
                        <div className="flex items-center space-x-2 mb-2">
                          <button
                            onClick={() => handlePlayAudio(lesson.lessonId, lesson.audioURL)}
                            className={`px-3 py-1 rounded bg-pink-500 text-white hover:bg-pink-600 transition ${(playingLessonId === lesson.lessonId && isPlaying) ? 'opacity-70' : ''}`}
                            type="button"
                          >
                            {(playingLessonId === lesson.lessonId && isPlaying) ? 'Đang phát...' : 'Phát audio'}
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center space-x-1 text-sm text-slate-500 mb-1">
                        <Clock className="w-4 h-4" />
                        <span>{lesson.duration} sec</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-slate-500 mb-1">
                        <Volume2 className="w-4 h-4" />
                        <span>{lesson.accent}</span>
                      </div>
                    </div>
                  </div>
                  {progress && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-600">Progress</span>
                        <span className="text-slate-800 font-medium">{completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} 
                          />
                        ))}
                        <span className="text-sm text-slate-600 ml-1">4.8</span>
                      </div>
                      {progress?.status === 'completed' && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                      )}
                    </div>
                    <Link
                      to={`/dashboard/lesson/dictation/${lesson.lessonId}?category=${category}`}
                      className="px-6 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:from-pink-700 hover:to-rose-700 transition-all duration-200 font-medium flex items-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>
                        {progress?.status === 'completed' ? 'Review' : 
                         progress?.status === 'in_progress' ? 'Continue' : 'Start'}
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Tips Section */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">Dictation Tips</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Before You Start:</h4>
            <ul className="space-y-1 text-pink-100">
              <li>• Find a quiet environment</li>
              <li>• Use good quality headphones</li>
              <li>• Have a notepad ready for practice</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">During Practice:</h4>
            <ul className="space-y-1 text-pink-100">
              <li>• Listen multiple times if needed</li>
              <li>• Focus on individual words</li>
              <li>• Pay attention to punctuation</li>
            </ul>
          </div>
        </div>
      </div>
      {/* Audio element dùng chung */}
      <audio
        ref={audioRef}
        style={{ display: 'none' }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default DictationLessons;