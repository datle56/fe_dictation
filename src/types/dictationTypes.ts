// Các interface/type cho Dictation Lesson

export interface Character {
    char: string;
    status: "correct" | "incorrect" | "extra" | "missing";
    isCorrect: boolean;
    correctChar?: string;
}

export interface WordComparison {
    userWord: string;
    correctWord: string;
    status: "correct" | "partial" | "extra" | "missing";
    characters: Character[];
}

export interface Challenge {
    id: number;
    position: number;
    content: string;
    audioSrc: string; // Empty string means use YouTube
    timeStart: number;
    timeEnd: number;
    hint: string;
    explanation: string;
}

export interface LessonData {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    accent: string;
    duration: number;
    youtubeUrl: string;
    youtubeEmbedUrl: string;
    videoId: string;
    audioSrc: string; // Empty string means use YouTube
    challenges: Challenge[];
} 