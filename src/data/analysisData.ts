export interface WordAnalysis {
  word: string;
  totalOccurrences: number;
  correctOnFirstTry: number;
  correctOnSecondTry: number;
  correctOnThirdTry: number;
  correctAfterMultipleTries: number;
  averageTriesToCorrect: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  lastEncountered: Date;
  improvementTrend: 'improving' | 'stable' | 'declining';
  phonetic?: string;
  definition?: string;
}

export interface LessonAnalysis {
  lessonId: string;
  lessonTitle: string;
  category: string;
  completedAt: Date;
  totalWords: number;
  correctWords: number;
  accuracy: number;
  averageTriesPerWord: number;
  timeSpent: number;
  difficulty: string;
}

export interface OverallStats {
  totalWordsEncountered: number;
  totalLessonsCompleted: number;
  overallAccuracy: number;
  averageTriesPerWord: number;
  totalStudyTime: number;
  improvingWords: number;
  strugglingWords: number;
  masteredWords: number;
  streakDays: number;
  lastStudyDate: Date;
}

// Mock data for demonstration
export const mockWordAnalysis: WordAnalysis[] = [
  {
    word: "the",
    totalOccurrences: 45,
    correctOnFirstTry: 35,
    correctOnSecondTry: 7,
    correctOnThirdTry: 2,
    correctAfterMultipleTries: 1,
    averageTriesToCorrect: 1.2,
    difficulty: 'easy',
    category: 'articles',
    lastEncountered: new Date('2024-01-15'),
    improvementTrend: 'stable',
    phonetic: '/ðə/',
    definition: 'Used to point forward to a following qualifying or defining clause or phrase'
  },
  {
    word: "beautiful",
    totalOccurrences: 12,
    correctOnFirstTry: 3,
    correctOnSecondTry: 4,
    correctOnThirdTry: 3,
    correctAfterMultipleTries: 2,
    averageTriesToCorrect: 2.8,
    difficulty: 'hard',
    category: 'adjectives',
    lastEncountered: new Date('2024-01-14'),
    improvementTrend: 'improving',
    phonetic: '/ˈbjuːtɪfʊl/',
    definition: 'Pleasing the senses or mind aesthetically'
  },
  {
    word: "environment",
    totalOccurrences: 18,
    correctOnFirstTry: 8,
    correctOnSecondTry: 6,
    correctOnThirdTry: 3,
    correctAfterMultipleTries: 1,
    averageTriesToCorrect: 1.9,
    difficulty: 'medium',
    category: 'academic',
    lastEncountered: new Date('2024-01-13'),
    improvementTrend: 'improving',
    phonetic: '/ɪnˈvaɪrənmənt/',
    definition: 'The surroundings or conditions in which a person, animal, or plant lives or operates'
  },
  {
    word: "necessary",
    totalOccurrences: 15,
    correctOnFirstTry: 2,
    correctOnSecondTry: 5,
    correctOnThirdTry: 4,
    correctAfterMultipleTries: 4,
    averageTriesToCorrect: 3.2,
    difficulty: 'hard',
    category: 'academic',
    lastEncountered: new Date('2024-01-12'),
    improvementTrend: 'declining',
    phonetic: '/ˈnesəsəri/',
    definition: 'Required to be done, achieved, or present; needed; essential'
  },
  {
    word: "important",
    totalOccurrences: 25,
    correctOnFirstTry: 18,
    correctOnSecondTry: 5,
    correctOnThirdTry: 2,
    correctAfterMultipleTries: 0,
    averageTriesToCorrect: 1.4,
    difficulty: 'easy',
    category: 'academic',
    lastEncountered: new Date('2024-01-15'),
    improvementTrend: 'stable',
    phonetic: '/ɪmˈpɔːtənt/',
    definition: 'Of great significance or value; likely to have a profound effect on success, survival, or well-being'
  },
  {
    word: "development",
    totalOccurrences: 20,
    correctOnFirstTry: 10,
    correctOnSecondTry: 7,
    correctOnThirdTry: 2,
    correctAfterMultipleTries: 1,
    averageTriesToCorrect: 1.7,
    difficulty: 'medium',
    category: 'academic',
    lastEncountered: new Date('2024-01-14'),
    improvementTrend: 'improving',
    phonetic: '/dɪˈveləpmənt/',
    definition: 'The process of developing or being developed'
  },
  {
    word: "government",
    totalOccurrences: 22,
    correctOnFirstTry: 12,
    correctOnSecondTry: 6,
    correctOnThirdTry: 3,
    correctAfterMultipleTries: 1,
    averageTriesToCorrect: 1.6,
    difficulty: 'medium',
    category: 'politics',
    lastEncountered: new Date('2024-01-13'),
    improvementTrend: 'stable',
    phonetic: '/ˈɡʌvənmənt/',
    definition: 'The governing body of a nation, state, or community'
  },
  {
    word: "technology",
    totalOccurrences: 16,
    correctOnFirstTry: 9,
    correctOnSecondTry: 4,
    correctOnThirdTry: 2,
    correctAfterMultipleTries: 1,
    averageTriesToCorrect: 1.8,
    difficulty: 'medium',
    category: 'technology',
    lastEncountered: new Date('2024-01-15'),
    improvementTrend: 'improving',
    phonetic: '/tekˈnɒlədʒi/',
    definition: 'The application of scientific knowledge for practical purposes'
  }
];

export const mockLessonAnalysis: LessonAnalysis[] = [
  {
    lessonId: 'story-1',
    lessonTitle: 'The History of Coffee',
    category: 'Short Stories',
    completedAt: new Date('2024-01-15'),
    totalWords: 45,
    correctWords: 38,
    accuracy: 84.4,
    averageTriesPerWord: 1.6,
    timeSpent: 420,
    difficulty: 'intermediate'
  },
  {
    lessonId: 'conv-1',
    lessonTitle: 'At the Restaurant',
    category: 'Daily Conversations',
    completedAt: new Date('2024-01-14'),
    totalWords: 32,
    correctWords: 29,
    accuracy: 90.6,
    averageTriesPerWord: 1.3,
    timeSpent: 280,
    difficulty: 'beginner'
  },
  {
    lessonId: 'toeic-1',
    lessonTitle: 'Office Meeting',
    category: 'TOEIC Listening',
    completedAt: new Date('2024-01-13'),
    totalWords: 38,
    correctWords: 31,
    accuracy: 81.6,
    averageTriesPerWord: 1.8,
    timeSpent: 380,
    difficulty: 'intermediate'
  }
];

export const mockOverallStats: OverallStats = {
  totalWordsEncountered: 1247,
  totalLessonsCompleted: 28,
  overallAccuracy: 82.3,
  averageTriesPerWord: 1.7,
  totalStudyTime: 8640, // in seconds
  improvingWords: 156,
  strugglingWords: 43,
  masteredWords: 89,
  streakDays: 7,
  lastStudyDate: new Date('2024-01-15')
};