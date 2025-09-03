import React, { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
    ArrowLeft,
    Volume2,
    ArrowRight,
    ArrowLeftCircle,
    ArrowRightCircle,
    RotateCcw,
    Shuffle,
} from "lucide-react"
import { flashcardDecks } from "../../data/vocabulary"
import type { FlashcardTerm } from "../../types/vocabulary"

const FlashcardDeck: React.FC = () => {
    const { deckId } = useParams<{ deckId: string }>()
    const navigate = useNavigate()
    const deck = flashcardDecks.find(d => d.id === deckId)

    const [currentIndex, setCurrentIndex] = useState(0)
    const [showBack, setShowBack] = useState(false)
    const [terms, setTerms] = useState<FlashcardTerm[]>([])
    const [isShuffled, setIsShuffled] = useState(false)

    useEffect(() => {
        if (deck) {
            setTerms([...deck.terms])
            setCurrentIndex(0)
            setShowBack(false)
        }
    }, [deck])

    if (!deck) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-semibold text-slate-800">
                    Deck not found
                </h2>
                <Link
                    to="/dashboard/vocabulary/flashcards"
                    className="text-orange-600 hover:text-orange-700 mt-4 inline-block"
                >
                    Back to Flashcards
                </Link>
            </div>
        )
    }

    const currentTerm = terms[currentIndex]

    const speakText = (text: string) => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.rate = 0.8
            speechSynthesis.speak(utterance)
        }
    }

    const handleNext = () => {
        if (currentIndex < terms.length - 1) {
            setCurrentIndex(currentIndex + 1)
            setShowBack(false)
        }
    }

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
            setShowBack(false)
        }
    }

    const handleShuffle = () => {
        const shuffled = [...terms].sort(() => Math.random() - 0.5)
        setTerms(shuffled)
        setCurrentIndex(0)
        setShowBack(false)
        setIsShuffled(true)
    }

    const handleReset = () => {
        if (deck) {
            setTerms([...deck.terms])
            setCurrentIndex(0)
            setShowBack(false)
            setIsShuffled(false)
        }
    }

    const getLevelColor = (level: string) => {
        switch (level.toLowerCase()) {
            case "beginner":
                return "bg-green-100 text-green-800"
            case "intermediate":
                return "bg-yellow-100 text-yellow-800"
            case "advanced":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() =>
                            navigate("/dashboard/vocabulary/flashcards")
                        }
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            {deck.title}
                        </h1>
                        <p className="text-slate-600 mt-1">
                            {deck.description}
                        </p>
                    </div>
                </div>
                <div>
                    <span
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${getLevelColor(
                            deck.level
                        )}`}
                    >
                        {deck.level}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                    <span>Progress</span>
                    <span>
                        {currentIndex + 1} / {terms.length}
                    </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                        style={{
                            width: `${
                                ((currentIndex + 1) / terms.length) * 100
                            }%`,
                        }}
                    ></div>
                </div>
            </div>

            {/* Flashcard */}
            <div className="max-w-3xl mx-auto mb-8">
                <div
                    className="bg-white rounded-xl shadow-md border border-slate-200 p-8 min-h-[400px] cursor-pointer"
                    onClick={() => setShowBack(!showBack)}
                >
                    <div className="flex flex-col items-center justify-center h-full">
                        {!showBack ? (
                            <>
                                <h2 className="text-4xl font-bold text-slate-800 mb-4">
                                    {currentTerm.term}
                                </h2>
                                {currentTerm.phonetic && (
                                    <div className="flex items-center space-x-3 mb-4">
                                        <span className="text-lg text-slate-500">
                                            {currentTerm.phonetic}
                                        </span>
                                        <button
                                            onClick={e => {
                                                e.stopPropagation()
                                                speakText(currentTerm.term)
                                            }}
                                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                        >
                                            <Volume2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                                <p className="text-slate-600 text-center">
                                    Click to see definition
                                </p>
                            </>
                        ) : (
                            <div className="text-center">
                                <h3 className="text-2xl font-semibold text-slate-800 mb-6">
                                    {currentTerm.definition}
                                </h3>
                                {currentTerm.examples.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-slate-700">
                                            Examples:
                                        </h4>
                                        {currentTerm.examples.map(
                                            (example, index) => (
                                                <p
                                                    key={index}
                                                    className="text-slate-600 italic"
                                                >
                                                    "{example}"
                                                </p>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-6">
                <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="p-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowLeftCircle className="w-6 h-6" />
                </button>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleShuffle}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                            isShuffled
                                ? "bg-orange-100 text-orange-700"
                                : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                        }`}
                    >
                        <Shuffle className="w-5 h-5" />
                        <span>Shuffle</span>
                    </button>

                    <button
                        onClick={handleReset}
                        className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <RotateCcw className="w-5 h-5" />
                        <span>Reset</span>
                    </button>
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentIndex === terms.length - 1}
                    className="p-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowRightCircle className="w-6 h-6" />
                </button>
            </div>
        </div>
    )
}

export default FlashcardDeck
