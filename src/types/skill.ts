export interface Skill {
    id: string;
    name: string;
    path: string;
    icon: string;
    color: string;
    description: string;
    lessonsCount?: number; // Số lượng bài học thuộc skill này
    iconComponent?: React.ElementType; // FE tự map icon component
} 