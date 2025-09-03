export interface FlashcardTerm {
    id: string
    term: string
    definition: string
    phonetic?: string
    examples: string[]
    imageUrl?: string
    audioUrl?: string
}

export interface FlashcardDeck {
    id: string
    title: string
    description: string
    category: string
    level: "beginner" | "intermediate" | "advanced"
    terms: FlashcardTerm[]
    createdAt: Date
    updatedAt: Date
    authorId: string
    isPublic: boolean
    tags: string[]
}

export interface VocabularyCategory {
    id: string
    title: string
    description: string
    icon: string
    color: string
    deckCount: number
    level: string
}
