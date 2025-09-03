export interface YouTubeVideo {
  id: string;
  title: string;
  youtubeUrl: string;
  videoId: string;
  thumbnail: string;
  duration: string;
  channelName: string;
  addedBy: {
    id: string;
    name: string;
    avatar: string;
  };
  addedAt: Date;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  accent: string;
  views: number;
  likes: number;
  description: string;
  tags: string[];
  segments: {
    start: number;
    end: number;
    text: string;
  }[];
}

// Sample data for recent YouTube videos added by users
export const recentYouTubeVideos: YouTubeVideo[] = [
  {
    id: 'yt-1',
    title: 'English Conversation Practice - Daily Life',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoId: 'dQw4w9WgXcQ',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '10:25',
    channelName: 'English Learning Hub',
    addedBy: {
      id: 'user-1',
      name: 'Sarah Chen',
      avatar: 'SC'
    },
    addedAt: new Date('2024-01-15'),
    difficulty: 'Intermediate',
    accent: 'American',
    views: 1250,
    likes: 89,
    description: 'Practice everyday English conversations with native speakers',
    tags: ['conversation', 'daily life', 'practice'],
    segments: [
      { start: 0, end: 15, text: 'Hello everyone, welcome to our English conversation practice session.' },
      { start: 15, end: 30, text: 'Today we will learn how to talk about daily activities and routines.' },
      { start: 30, end: 45, text: 'Let\'s start with some common phrases you can use every day.' }
    ]
  },
  {
    id: 'yt-2',
    title: 'BBC News Report - Climate Change',
    youtubeUrl: 'https://www.youtube.com/watch?v=abc123def456',
    videoId: 'abc123def456',
    thumbnail: 'https://img.youtube.com/vi/abc123def456/maxresdefault.jpg',
    duration: '8:42',
    channelName: 'BBC News',
    addedBy: {
      id: 'user-2',
      name: 'Michael Rodriguez',
      avatar: 'MR'
    },
    addedAt: new Date('2024-01-14'),
    difficulty: 'Advanced',
    accent: 'British',
    views: 2100,
    likes: 156,
    description: 'Latest news report on climate change impacts worldwide',
    tags: ['news', 'climate', 'environment'],
    segments: [
      { start: 0, end: 20, text: 'Scientists warn that global temperatures continue to rise at an alarming rate.' },
      { start: 20, end: 40, text: 'The latest research shows significant changes in weather patterns across the globe.' }
    ]
  },
  {
    id: 'yt-3',
    title: 'TED Talk - The Power of Mindfulness',
    youtubeUrl: 'https://www.youtube.com/watch?v=xyz789uvw012',
    videoId: 'xyz789uvw012',
    thumbnail: 'https://img.youtube.com/vi/xyz789uvw012/maxresdefault.jpg',
    duration: '15:30',
    channelName: 'TED',
    addedBy: {
      id: 'user-3',
      name: 'Priya Patel',
      avatar: 'PP'
    },
    addedAt: new Date('2024-01-13'),
    difficulty: 'Intermediate',
    accent: 'American',
    views: 3500,
    likes: 298,
    description: 'Discover how mindfulness can transform your daily life and relationships',
    tags: ['mindfulness', 'psychology', 'self-improvement'],
    segments: [
      { start: 0, end: 25, text: 'Mindfulness is the practice of being fully present in the moment.' },
      { start: 25, end: 50, text: 'Research shows that regular mindfulness practice can reduce stress and anxiety.' }
    ]
  },
  {
    id: 'yt-4',
    title: 'Cooking Tutorial - Italian Pasta',
    youtubeUrl: 'https://www.youtube.com/watch?v=cook123pasta',
    videoId: 'cook123pasta',
    thumbnail: 'https://img.youtube.com/vi/cook123pasta/maxresdefault.jpg',
    duration: '12:18',
    channelName: 'Chef\'s Kitchen',
    addedBy: {
      id: 'user-4',
      name: 'Emma Wilson',
      avatar: 'EW'
    },
    addedAt: new Date('2024-01-12'),
    difficulty: 'Beginner',
    accent: 'American',
    views: 890,
    likes: 67,
    description: 'Learn to make authentic Italian pasta from scratch',
    tags: ['cooking', 'italian', 'tutorial'],
    segments: [
      { start: 0, end: 18, text: 'Today we\'re going to learn how to make fresh pasta from scratch.' },
      { start: 18, end: 35, text: 'First, we need to gather all our ingredients: flour, eggs, and salt.' }
    ]
  },
  {
    id: 'yt-5',
    title: 'Travel Vlog - Exploring Tokyo',
    youtubeUrl: 'https://www.youtube.com/watch?v=tokyo2024vlog',
    videoId: 'tokyo2024vlog',
    thumbnail: 'https://img.youtube.com/vi/tokyo2024vlog/maxresdefault.jpg',
    duration: '20:45',
    channelName: 'Travel Adventures',
    addedBy: {
      id: 'user-5',
      name: 'David Kim',
      avatar: 'DK'
    },
    addedAt: new Date('2024-01-11'),
    difficulty: 'Intermediate',
    accent: 'Australian',
    views: 1800,
    likes: 142,
    description: 'Join me as I explore the amazing streets and culture of Tokyo',
    tags: ['travel', 'japan', 'culture'],
    segments: [
      { start: 0, end: 22, text: 'Welcome to Tokyo! I\'m so excited to show you around this incredible city.' },
      { start: 22, end: 45, text: 'Our first stop is the famous Shibuya crossing, one of the busiest intersections in the world.' }
    ]
  },
  {
    id: 'yt-6',
    title: 'Science Explained - Quantum Physics',
    youtubeUrl: 'https://www.youtube.com/watch?v=quantum123sci',
    videoId: 'quantum123sci',
    thumbnail: 'https://img.youtube.com/vi/quantum123sci/maxresdefault.jpg',
    duration: '18:33',
    channelName: 'Science Today',
    addedBy: {
      id: 'user-6',
      name: 'Alex Thompson',
      avatar: 'AT'
    },
    addedAt: new Date('2024-01-10'),
    difficulty: 'Advanced',
    accent: 'British',
    views: 2750,
    likes: 203,
    description: 'Understanding the basics of quantum physics in simple terms',
    tags: ['science', 'physics', 'education'],
    segments: [
      { start: 0, end: 28, text: 'Quantum physics is one of the most fascinating and mysterious areas of science.' },
      { start: 28, end: 55, text: 'At the quantum level, particles behave in ways that seem impossible in our everyday world.' }
    ]
  }
];

export const popularCategories = [
  { name: 'Education', count: 45, color: 'from-blue-400 to-blue-500' },
  { name: 'News', count: 32, color: 'from-red-400 to-red-500' },
  { name: 'Entertainment', count: 28, color: 'from-purple-400 to-purple-500' },
  { name: 'Cooking', count: 24, color: 'from-orange-400 to-orange-500' },
  { name: 'Travel', count: 19, color: 'from-green-400 to-green-500' },
  { name: 'Technology', count: 16, color: 'from-indigo-400 to-indigo-500' }
];