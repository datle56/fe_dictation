import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { getProgressesByUser, createProgress, updateProgress as updateProgressApi } from '../utils/api';

interface LessonProgress {
  lessonId: string;
  skillType: string;
  currentSentence: number;
  completedSentences: number;
  totalSentences: number;
  score: number;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  attempts: SentenceAttempt[];
}

interface SentenceAttempt {
  sentenceIndex: number;
  userAnswer: string;
  correctAnswer: string;
  aiFeedback: any;
  score: number;
  attemptNumber: number;
  createdAt: Date;
}

interface ProgressContextType {
  progress: { [lessonId: string]: LessonProgress };
  startLesson: (lessonId: string, skillType: string, totalSentences: number) => void;
  updateProgress: (lessonId: string, updates: Partial<LessonProgress>) => void;
  addAttempt: (lessonId: string, attempt: SentenceAttempt) => void;
  getProgress: (lessonId: string) => LessonProgress | null;
  getOverallStats: () => {
    totalLessons: number;
    completedLessons: number;
    averageScore: number;
    totalSentences: number;
  };
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

// Export the hook after its implementation
export { useProgress };

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<{ [lessonId: string]: LessonProgress }>({});

  useEffect(() => {
    const savedProgress = localStorage.getItem('ielts_progress');
    if (savedProgress) {
      try {
        const progressMap = JSON.parse(savedProgress);
        setProgress(progressMap);
      } catch (error) {
        console.error('Error parsing saved progress:', error);
      }
    }
  }, []);

  const startLesson = async (lessonId: string, skillType: string, totalSentences: number) => {
    const newProgress = {
      lessonId,
      skillType,
      currentSentence: 0,
      completedSentences: 0,
      totalSentences,
      score: 0,
      status: 'in_progress' as const,
      startedAt: new Date(),
      attempts: []
    };
    
    setProgress(prev => {
      const updated = {
        ...prev,
        [lessonId]: newProgress
      };
      localStorage.setItem('ielts_progress', JSON.stringify(updated));
      return updated;
    });
  };

  const updateProgress = async (lessonId: string, updates: Partial<LessonProgress>) => {
    setProgress(prev => {
      const updated = {
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          ...updates
        }
      };
      localStorage.setItem('ielts_progress', JSON.stringify(updated));
      return updated;
    });
  };

  const addAttempt = (lessonId: string, attempt: SentenceAttempt) => {
    const lessonProgress = progress[lessonId];
    if (lessonProgress) {
      const newAttempts = [...lessonProgress.attempts, attempt];
      const avgScore = newAttempts.reduce((sum, att) => sum + att.score, 0) / newAttempts.length;

      updateProgress(lessonId, {
        attempts: newAttempts,
        score: avgScore,
        completedSentences: lessonProgress.completedSentences + 1,
        currentSentence: Math.min(lessonProgress.currentSentence + 1, lessonProgress.totalSentences),
        status: lessonProgress.completedSentences + 1 >= lessonProgress.totalSentences ? 'completed' : 'in_progress',
        completedAt: lessonProgress.completedSentences + 1 >= lessonProgress.totalSentences ? new Date() : undefined
      });
    }
  };

  const getProgress = (lessonId: string): LessonProgress | null => {
    return progress[lessonId] || null;
  };

  const getOverallStats = () => {
    const lessons = Object.values(progress);
    const completedLessons = lessons.filter(l => l.status === 'completed');
    const totalScore = lessons.reduce((sum, l) => sum + l.score, 0);
    const totalSentences = lessons.reduce((sum, l) => sum + l.completedSentences, 0);

    return {
      totalLessons: lessons.length,
      completedLessons: completedLessons.length,
      averageScore: lessons.length > 0 ? totalScore / lessons.length : 0,
      totalSentences
    };
  };

  return (
    <ProgressContext.Provider value={{
      progress,
      startLesson,
      updateProgress,
      addAttempt,
      getProgress,
      getOverallStats
    }}>
      {children}
    </ProgressContext.Provider>
  );
};