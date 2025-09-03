import { FlashcardDeck, VocabularyCategory } from "../types/vocabulary"

export const flashcardDecks: FlashcardDeck[] = [
    {
        id: "academic-1",
        title: "Academic Vocabulary - Basic",
        description: "Essential academic words for IELTS and TOEFL success",
        category: "academic",
        level: "intermediate",
        terms: [
            {
                id: "1",
                term: "analyze",
                definition:
                    "to examine something in detail to understand or explain it",
                phonetic: "/ˈænəlaɪz/",
                examples: [
                    "Scientists analyze data to draw conclusions.",
                    "We need to analyze the problem before finding a solution.",
                    "The report analyzes market trends over the past decade.",
                ],
            },
            {
                id: "2",
                term: "significant",
                definition: "important, large, or meaningful",
                phonetic: "/sɪɡˈnɪfɪkənt/",
                examples: [
                    "There was a significant increase in sales.",
                    "Her research made a significant contribution to science.",
                    "The difference between the two groups was statistically significant.",
                ],
            },
            // Add more terms...
        ],
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        authorId: "system",
        isPublic: true,
        tags: ["academic", "IELTS", "TOEFL", "essential"],
    },
    {
        id: "business-1",
        title: "Business English Essentials",
        description: "Common business and professional vocabulary",
        category: "business",
        level: "intermediate",
        terms: [
            {
                id: "1",
                term: "negotiate",
                definition: "to discuss something to reach an agreement",
                phonetic: "/nɪˈɡoʊʃieɪt/",
                examples: [
                    "We need to negotiate the terms of the contract.",
                    "The company is negotiating a merger deal.",
                    "They successfully negotiated a better price.",
                ],
            },
            {
                id: "2",
                term: "deadline",
                definition: "a date or time by which something must be done",
                phonetic: "/ˈdedlaɪn/",
                examples: [
                    "The project deadline is next Friday.",
                    "We must meet the deadline to avoid penalties.",
                    "She always submits her work before the deadline.",
                ],
            },
            // Add more terms...
        ],
        createdAt: new Date("2024-01-02"),
        updatedAt: new Date("2024-01-02"),
        authorId: "system",
        isPublic: true,
        tags: ["business", "professional", "workplace"],
    },
]

export const vocabularyCategories: VocabularyCategory[] = [
    {
        id: "academic",
        title: "Academic Vocabulary",
        description:
            "Essential words for academic success, IELTS, and TOEFL preparation",
        icon: "🎓",
        color: "from-blue-500 to-indigo-600",
        deckCount: 5,
        level: "Intermediate",
    },
    {
        id: "business",
        title: "Business English",
        description:
            "Professional vocabulary for workplace and business contexts",
        icon: "💼",
        color: "from-green-500 to-emerald-600",
        deckCount: 3,
        level: "Intermediate",
    },
    {
        id: "daily",
        title: "Daily Conversations",
        description: "Common words and phrases for everyday situations",
        icon: "💬",
        color: "from-yellow-500 to-amber-600",
        deckCount: 4,
        level: "Beginner",
    },
    {
        id: "idioms",
        title: "Idioms & Expressions",
        description: "Common English idioms and their meanings",
        icon: "🎯",
        color: "from-purple-500 to-violet-600",
        deckCount: 2,
        level: "Advanced",
    },
]
