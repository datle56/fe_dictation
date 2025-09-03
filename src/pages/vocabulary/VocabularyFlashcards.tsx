import React, { useState, useMemo } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { ArrowLeft, Search, Filter } from "lucide-react"
import { flashcardDecks, vocabularyCategories } from "../../data/vocabulary"

const VocabularyFlashcards: React.FC = () => {
    const [searchParams] = useSearchParams()
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedLevel, setSelectedLevel] = useState<string>("")
    const [selectedCategory, setSelectedCategory] = useState<string>(
        searchParams.get("category") || ""
    )

    const filteredDecks = useMemo(() => {
        return flashcardDecks.filter(deck => {
            const matchesSearch =
                searchTerm === "" ||
                deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                deck.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                deck.tags.some(tag =>
                    tag.toLowerCase().includes(searchTerm.toLowerCase())
                )

            const matchesLevel =
                selectedLevel === "" || deck.level === selectedLevel
            const matchesCategory =
                selectedCategory === "" || deck.category === selectedCategory

            return matchesSearch && matchesLevel && matchesCategory
        })
    }, [searchTerm, selectedLevel, selectedCategory])

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
                    <Link
                        to="/dashboard/vocabulary"
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            Flashcards
                        </h1>
                        <p className="text-slate-600 mt-1">
                            Browse and study vocabulary flashcards
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search decks by title, description, or tags..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="w-full md:w-48">
                        <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            <option value="">All Categories</option>
                            {vocabularyCategories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Level Filter */}
                    <div className="w-full md:w-48">
                        <select
                            value={selectedLevel}
                            onChange={e => setSelectedLevel(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            <option value="">All Levels</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Decks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDecks.map(deck => (
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

            {/* Empty State */}
            {filteredDecks.length === 0 && (
                <div className="text-center py-12">
                    <Filter className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-800 mb-2">
                        No matching decks found
                    </h3>
                    <p className="text-slate-600">
                        Try adjusting your filters or search term to find more
                        flashcard decks
                    </p>
                </div>
            )}
        </div>
    )
}

export default VocabularyFlashcards
