import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
    Trophy,
    Clock,
    Check,
    ArrowRight,
    Zap,
} from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { sampleRooms, sampleLessons } from "../../data/multiplayerSample"
import type { Room, GameState } from "../../types/multiplayer"

const MultiplayerGame: React.FC = () => {
    const params = useParams()
    const roomId = params.roomId as string
    const navigate = useNavigate()
    const { user } = useAuth()
    
    const [room, setRoom] = useState<Room | null>(null)
    const [currentLesson, setCurrentLesson] = useState<any>(null)
    const [gameState, setGameState] = useState<GameState>({
        currentSentence: 0,
        timeRemaining: 60,
        isPlaying: true,
        leaderboard: [],
        totalSentences: 5,
    })
    const [userAnswer, setUserAnswer] = useState("")
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [realTimeScores, setRealTimeScores] = useState<{
        [playerId: string]: number
    }>({})

    useEffect(() => {
        if (!roomId) {
            navigate("/dashboard/multiplayer")
            return
        }

        // Load room from sample data
        const foundRoom = sampleRooms.find(r => r.id === roomId)
        if (!foundRoom) {
            navigate("/dashboard/multiplayer")
            return
        }

        setRoom(foundRoom)

        // Load lesson data
        if (foundRoom.selectedLessonId) {
            const lesson = sampleLessons.find(l => l.lessonId === foundRoom.selectedLessonId)
            if (lesson) {
                setCurrentLesson(lesson)
                setGameState(prev => ({
                    ...prev,
                    totalSentences: lesson.challenges.length,
                    timeRemaining: foundRoom.settings?.timeLimit || 60
                }))
            }
        }

        // Initialize scores
        const initialScores: { [key: string]: number } = {}
        foundRoom.players.forEach(player => {
            initialScores[player.id] = player.score || 0
        })
        setRealTimeScores(initialScores)

        // Start timer
        const timer = setInterval(() => {
            setGameState(prev => {
                if (prev.timeRemaining <= 1) {
                    if (!hasSubmitted) {
                        handleAutoSubmit()
                    }
                    return prev
                }
                return { ...prev, timeRemaining: prev.timeRemaining - 1 }
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [roomId, navigate, hasSubmitted])

    const handleAutoSubmit = () => {
        if (hasSubmitted) return
        submitAnswer()
    }

    const submitAnswer = () => {
        if (hasSubmitted || !currentLesson || !user) return

        const currentChallenge = currentLesson.challenges[gameState.currentSentence]
        const isCorrect = userAnswer.toLowerCase().trim() === currentChallenge.content.toLowerCase().trim()
        const score = isCorrect ? 10 : 0

        setHasSubmitted(true)

        // Update scores
        setRealTimeScores(prev => ({
            ...prev,
            [user.id?.toString() || "me"]: (prev[user.id?.toString() || "me"] || 0) + score
        }))

        // Move to next sentence after 2 seconds
        setTimeout(() => {
            if (gameState.currentSentence >= gameState.totalSentences - 1) {
                setShowResults(true)
            } else {
                setGameState(prev => ({
                    ...prev,
                    currentSentence: prev.currentSentence + 1,
                    timeRemaining: room?.settings?.timeLimit || 60
                }))
                setUserAnswer("")
                setHasSubmitted(false)
            }
        }, 2000)
    }

    if (!room || !currentLesson) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-semibold text-slate-800">
                    Game data not found
                </h2>
                <button
                    onClick={() => navigate("/dashboard/multiplayer")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Back to Lobby
                </button>
            </div>
        )
    }

    if (showResults) {
        const sortedPlayers = room.players
            .map(player => ({
                ...player,
                finalScore: realTimeScores[player.id] || 0
            }))
            .sort((a, b) => b.finalScore - a.finalScore)

        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-slate-800 mb-2">
                        Game Complete!
                    </h1>
                    <p className="text-xl text-slate-600">Final Results</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">
                        Leaderboard
                    </h3>
                    <div className="space-y-4">
                        {sortedPlayers.map((player, index) => (
                            <div
                                key={player.id}
                                className={`flex items-center justify-between p-4 rounded-lg ${
                                    index === 0
                                        ? "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200"
                                        : index === 1
                                        ? "bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200"
                                        : index === 2
                                        ? "bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200"
                                        : "bg-slate-50 border border-slate-200"
                                }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                            index === 0
                                                ? "bg-yellow-500 text-white"
                                                : index === 1
                                                ? "bg-gray-400 text-white"
                                                : index === 2
                                                ? "bg-orange-500 text-white"
                                                : "bg-slate-400 text-white"
                                        }`}
                                    >
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-800">
                                            {player.name}
                                        </div>
                                        <div className="text-sm text-slate-600">
                                            Score: {player.finalScore} points
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-slate-800">
                                        {player.finalScore}
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        points
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => navigate("/dashboard/multiplayer")}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                        >
                            Back to Lobby
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const currentChallenge = currentLesson.challenges[gameState.currentSentence]
    const progress = ((gameState.currentSentence + 1) / gameState.totalSentences) * 100

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-slate-800">
                            {room.name}
                        </h1>
                        <p className="text-sm text-slate-600">
                            Multiplayer Dictation Battle
                        </p>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-slate-600" />
                            <span
                                className={`font-bold text-lg ${
                                    gameState.timeRemaining <= 10
                                        ? "text-red-600"
                                        : "text-slate-800"
                                }`}
                            >
                                {gameState.timeRemaining}s
                            </span>
                        </div>
                        <div className="text-sm text-slate-600">
                            {gameState.currentSentence + 1} / {gameState.totalSentences}
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Live Leaderboard */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                <h3 className="font-semibold text-slate-800">
                                    Live Scores
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {room.players
                                    .sort((a, b) => (realTimeScores[b.id] || 0) - (realTimeScores[a.id] || 0))
                                    .map((player, index) => (
                                        <div
                                            key={player.id}
                                            className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                        index === 0
                                                            ? "bg-yellow-500 text-white"
                                                            : index === 1
                                                            ? "bg-gray-400 text-white"
                                                            : index === 2
                                                            ? "bg-orange-500 text-white"
                                                            : "bg-slate-400 text-white"
                                                    }`}
                                                >
                                                    {index + 1}
                                                </div>
                                                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">
                                                        {player.avatar}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-medium text-slate-800 truncate">
                                                    {player.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <span className="font-bold text-slate-800">
                                                    {realTimeScores[player.id] || 0}
                                                </span>
                                                {hasSubmitted && player.id === (user?.id?.toString() || "me") && (
                                                    <Check className="w-4 h-4 text-green-500" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Game Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            {/* Current Challenge */}
                            <div className="mb-6">
                                <div className="text-center mb-4">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                        Listen and Type
                                    </h3>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-blue-800 font-mono text-lg">
                                            "{currentChallenge.content}"
                                        </p>
                                        <p className="text-blue-600 text-sm mt-2">
                                            🎧 In a real app, you would hear this audio
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Answer Input */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Type what you hear:
                                    </label>
                                    <textarea
                                        value={userAnswer}
                                        onChange={e => setUserAnswer(e.target.value)}
                                        placeholder="Type your answer here..."
                                        disabled={hasSubmitted}
                                        className={`w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg ${
                                            hasSubmitted
                                                ? "bg-gray-50 cursor-not-allowed"
                                                : "border-slate-300"
                                        }`}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        {hasSubmitted && (
                                            <div className="flex items-center space-x-2 text-green-600">
                                                <Check className="w-5 h-5" />
                                                <span className="font-medium">
                                                    Submitted! Moving to next...
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={submitAnswer}
                                        disabled={!userAnswer.trim() || hasSubmitted}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                                    >
                                        <span>Submit Answer</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Activity Feed */}
                            <div className="mt-6 pt-6 border-t border-slate-200">
                                <h4 className="font-medium text-slate-800 mb-3">
                                    Activity Feed
                                </h4>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                                        <Zap className="w-4 h-4 text-blue-500" />
                                        <span>Game in progress...</span>
                                        <span className="text-xs text-slate-400">
                                            Sentence {gameState.currentSentence + 1}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MultiplayerGame