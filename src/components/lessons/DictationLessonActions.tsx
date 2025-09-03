import React from "react"
import { Mic, Eye, EyeOff, Settings, SkipForward } from "lucide-react"

interface DictationLessonActionsProps {
    useYoutube: boolean
    onReplay: () => void
    onSkip: () => void
    onToggleHint: () => void
    hintEnabled: boolean
    onTogglePronunciation: () => void
    pronunciationEnabled: boolean
    onToggleShowAnswer: () => void
    showCorrectAnswer: boolean
    onToggleSettings: () => void
    showSettings: boolean
}

const DictationLessonActions: React.FC<DictationLessonActionsProps> = ({
    useYoutube,
    onReplay,
    onSkip,
    onToggleHint,
    hintEnabled,
    onTogglePronunciation,
    pronunciationEnabled,
    onToggleShowAnswer,
    showCorrectAnswer,
    onToggleSettings,
    showSettings,
}) => {
    return (
        <>
            <button
                onClick={onReplay}
                className="px-3 py-1 rounded-full flex items-center space-x-2 text-xs transition-all bg-slate-100 text-slate-600 hover:bg-slate-200"
                type="button"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582M20 20v-5h-.581M5.582 9A7.974 7.974 0 0112 4c4.418 0 8 3.582 8 8m0 0h-5m5 0l-5 5"
                    />
                </svg>
                <span>Replay</span>
            </button>
            <button
                onClick={onSkip}
                className="px-3 py-1 rounded-full flex items-center space-x-2 text-xs transition-all bg-slate-100 text-slate-600 hover:bg-slate-200"
                type="button"
            >
                <SkipForward className="w-4 h-4" />
                <span>Skip</span>
            </button>
            <button
                onClick={onToggleHint}
                className={`px-3 py-1 rounded-full flex items-center space-x-2 text-xs transition-all ${
                    hintEnabled
                        ? "bg-blue-100 text-blue-800"
                        : "bg-slate-100 text-slate-600"
                }`}
                type="button"
            >
                <span>Hint</span>
            </button>
            <button
                onClick={onTogglePronunciation}
                className={`px-3 py-1 rounded-full flex items-center space-x-2 text-xs transition-all ${
                    pronunciationEnabled
                        ? "bg-pink-100 text-pink-800"
                        : "bg-slate-100 text-slate-600"
                }`}
            >
                <Mic className="w-4 h-4" />
                <span>Pronunciation Check</span>
            </button>
            <button
                onClick={onToggleShowAnswer}
                className={`px-3 py-1 rounded-full flex items-center space-x-2 text-xs transition-all ${
                    showCorrectAnswer
                        ? "bg-pink-100 text-pink-800"
                        : "bg-slate-100 text-slate-600"
                }`}
            >
                {showCorrectAnswer ? (
                    <EyeOff className="w-4 h-4" />
                ) : (
                    <Eye className="w-4 h-4" />
                )}
                <span>Show Answer</span>
            </button>
            <button
                onClick={onToggleSettings}
                className="px-3 py-1 rounded-full flex items-center space-x-2 text-xs transition-all bg-slate-100 text-slate-600 hover:bg-slate-200"
                type="button"
            >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
            </button>
        </>
    )
}

export default DictationLessonActions
