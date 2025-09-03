import React from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { vocabularyCategories, flashcardDecks } from "../../data/vocabulary"

const VocabularyPublic: React.FC = () => {
    const publicDecks = flashcardDecks.filter(deck => deck.isPublic)

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
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">
                    Vocabulary
                </h1>
                <p className="text-slate-600 mt-2">
                    Explore our collection of vocabulary decks and flashcards to
                    enhance your English vocabulary
                </p>
            </div>

            {/* Categories */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-slate-800">
                        Categories
                    </h2>
                    <Link
                        to="/dashboard/vocabulary/flashcards"
                        className="text-orange-600 hover:text-orange-700 font-medium flex items-center"
                    >
                        View All Flashcards
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {vocabularyCategories.map(category => (
                        <Link
                            key={category.id}
                            to={`/dashboard/vocabulary/flashcards?category=${category.id}`}
                            className="block bg-white rounded-xl shadow-sm border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all duration-200"
                        >
                            <div
                                className={`p-6 rounded-t-xl bg-gradient-to-r ${category.color}`}
                            >
                                <span className="text-4xl">
                                    {category.icon}
                                </span>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-slate-800">
                                        {category.title}
                                    </h3>
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(
                                            category.level
                                        )}`}
                                    >
                                        {category.level}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 mb-4">
                                    {category.description}
                                </p>
                                <div className="text-sm text-slate-500">
                                    {category.deckCount}{" "}
                                    {category.deckCount === 1
                                        ? "deck"
                                        : "decks"}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Featured Decks */}
            <div>
                <h2 className="text-2xl font-semibold text-slate-800 mb-6">
                    Featured Decks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {publicDecks.map(deck => (
                        <Link
                            key={deck.id}
                            to={`/dashboard/vocabulary/flashcards/${deck.id}`}
                            className="block bg-white rounded-xl shadow-sm border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 p-6"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-slate-800">
                                    {deck.title}
                                </h3>
                                <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(
                                        deck.level
                                    )}`}
                                >
                                    {deck.level}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 mb-4">
                                {deck.description}
                            </p>
                            <div className="flex items-center justify-between text-sm">
                                <div className="text-slate-500">
                                    {deck.terms.length}{" "}
                                    {deck.terms.length === 1 ? "term" : "terms"}
                                </div>
                                <div className="flex gap-2">
                                    {deck.tags.slice(0, 2).map(tag => (
                                        <span
                                            key={tag}
                                            className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default VocabularyPublic
