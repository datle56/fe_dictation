export interface Category {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    accent: string;
    duration: number;
    lessonsCount: number;
    icon?: React.ElementType; // FE tự định nghĩa
    color?: string;           // FE tự định nghĩa
} 