export interface DictationSentence {
  index: number;
  audio: string;
  text: string;
  duration: number;
}

export interface DictationLesson {
  id: string;
  title: string;
  category: string;
  level: string;
  description: string;
  accent: string;
  topics: string[];
  dictationSentences: DictationSentence[];
}

export const dictationLessonsData: { [key: string]: DictationLesson } = {
  'story-1': {
    id: 'story-1',
    title: 'The History of Coffee',
    category: 'short-stories',
    level: 'intermediate',
    description: 'Learn about the fascinating journey of coffee from Ethiopia to the world',
    accent: 'American',
    topics: ['History', 'Culture', 'Food'],
    dictationSentences: [
      {
        index: 0,
        audio: 'coffee-history-1.mp3',
        text: 'Coffee is one of the most popular beverages in the world today.',
        duration: 4.2
      },
      {
        index: 1,
        audio: 'coffee-history-2.mp3',
        text: 'The story of coffee begins in ancient Ethiopia, where legend says a goat herder discovered the energizing effects of coffee beans.',
        duration: 6.8
      },
      {
        index: 2,
        audio: 'coffee-history-3.mp3',
        text: 'From Ethiopia, coffee spread to Yemen and then throughout the Ottoman Empire.',
        duration: 5.1
      },
      {
        index: 3,
        audio: 'coffee-history-4.mp3',
        text: 'European traders brought coffee to Venice in the early 17th century.',
        duration: 4.5
      },
      {
        index: 4,
        audio: 'coffee-history-5.mp3',
        text: 'The first coffeehouse in London opened in 1652 and became a center for intellectual discussion.',
        duration: 5.9
      },
      {
        index: 5,
        audio: 'coffee-history-6.mp3',
        text: 'Coffee cultivation spread to the Americas through European colonization.',
        duration: 4.7
      },
      {
        index: 6,
        audio: 'coffee-history-7.mp3',
        text: 'Brazil became the largest coffee producer in the world by the 1850s.',
        duration: 4.3
      },
      {
        index: 7,
        audio: 'coffee-history-8.mp3',
        text: 'The invention of instant coffee in 1901 revolutionized coffee consumption.',
        duration: 4.8
      },
      {
        index: 8,
        audio: 'coffee-history-9.mp3',
        text: 'Today, coffee is the second most traded commodity in the world after oil.',
        duration: 5.2
      },
      {
        index: 9,
        audio: 'coffee-history-10.mp3',
        text: 'Specialty coffee culture has grown significantly in recent decades.',
        duration: 4.1
      }
    ]
  },
  'conv-1': {
    id: 'conv-1',
    title: 'At the Restaurant',
    category: 'daily-conversations',
    level: 'beginner',
    description: 'Ordering food and drinks in a restaurant setting',
    accent: 'American',
    topics: ['Food', 'Service', 'Social'],
    dictationSentences: [
      {
        index: 0,
        audio: 'restaurant-1.mp3',
        text: 'Good evening! Welcome to Mario\'s Italian Restaurant.',
        duration: 3.5
      },
      {
        index: 1,
        audio: 'restaurant-2.mp3',
        text: 'Thank you. We have a reservation for two under the name Johnson.',
        duration: 4.2
      },
      {
        index: 2,
        audio: 'restaurant-3.mp3',
        text: 'Perfect! Right this way please. Here are your menus.',
        duration: 3.8
      },
      {
        index: 3,
        audio: 'restaurant-4.mp3',
        text: 'Can I start you off with something to drink?',
        duration: 3.1
      },
      {
        index: 4,
        audio: 'restaurant-5.mp3',
        text: 'I\'ll have a glass of red wine, and she\'ll have sparkling water.',
        duration: 4.5
      },
      {
        index: 5,
        audio: 'restaurant-6.mp3',
        text: 'Excellent choice. Are you ready to order, or do you need a few more minutes?',
        duration: 5.2
      },
      {
        index: 6,
        audio: 'restaurant-7.mp3',
        text: 'We\'re ready. I\'ll have the chicken parmesan with a side salad.',
        duration: 4.7
      },
      {
        index: 7,
        audio: 'restaurant-8.mp3',
        text: 'And I\'ll have the seafood pasta, please.',
        duration: 3.3
      }
    ]
  },
  'toeic-1': {
    id: 'toeic-1',
    title: 'Office Meeting',
    category: 'toeic-listening',
    level: 'intermediate',
    description: 'A typical business meeting discussing quarterly results',
    accent: 'American',
    topics: ['Business', 'Meetings', 'Finance'],
    dictationSentences: [
      {
        index: 0,
        audio: 'meeting-1.mp3',
        text: 'Good morning everyone, thank you for joining today\'s quarterly review meeting.',
        duration: 4.8
      },
      {
        index: 1,
        audio: 'meeting-2.mp3',
        text: 'Let\'s begin by reviewing our sales performance for the third quarter.',
        duration: 4.5
      },
      {
        index: 2,
        audio: 'meeting-3.mp3',
        text: 'Our revenue increased by fifteen percent compared to the same period last year.',
        duration: 5.1
      },
      {
        index: 3,
        audio: 'meeting-4.mp3',
        text: 'The marketing department\'s new campaign has been particularly successful.',
        duration: 4.7
      },
      {
        index: 4,
        audio: 'meeting-5.mp3',
        text: 'However, we need to address the rising costs in our supply chain.',
        duration: 4.9
      },
      {
        index: 5,
        audio: 'meeting-6.mp3',
        text: 'I suggest we schedule a follow-up meeting to discuss cost reduction strategies.',
        duration: 5.3
      }
    ]
  },
  'ielts-1': {
    id: 'ielts-1',
    title: 'University Lecture: Psychology',
    category: 'ielts-listening',
    level: 'advanced',
    description: 'An academic lecture about cognitive psychology',
    accent: 'British',
    topics: ['Academic', 'Psychology', 'Science'],
    dictationSentences: [
      {
        index: 0,
        audio: 'psychology-1.mp3',
        text: 'Today we\'ll be examining the fundamental principles of cognitive psychology.',
        duration: 4.9
      },
      {
        index: 1,
        audio: 'psychology-2.mp3',
        text: 'Cognitive psychology focuses on mental processes such as perception, memory, and problem-solving.',
        duration: 6.2
      },
      {
        index: 2,
        audio: 'psychology-3.mp3',
        text: 'One of the key concepts is the information processing model of human cognition.',
        duration: 5.5
      },
      {
        index: 3,
        audio: 'psychology-4.mp3',
        text: 'This model suggests that the mind works similarly to a computer, processing information in stages.',
        duration: 6.1
      },
      {
        index: 4,
        audio: 'psychology-5.mp3',
        text: 'Research in this field has significant implications for education and artificial intelligence.',
        duration: 5.8
      }
    ]
  }
};