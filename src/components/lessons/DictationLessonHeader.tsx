import React from "react"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface DictationLessonHeaderProps {
    lesson: { title: string; accent: string }
    currentSentence: number
    totalSentences: number
}

const DictationLessonHeader: React.FC<DictationLessonHeaderProps> = ({
    lesson,
    currentSentence,
    totalSentences,
}) => {
    const navigate = useNavigate()
    const progressPercentage = ((currentSentence + 1) / totalSentences) * 100
    return (
        <div className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate(`/dashboard/dictation`)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-slate-800 leading-tight">
                            {lesson.title}
                        </h1>
                        <p className="text-xs text-slate-500">
                            Write from Dictation • {lesson.accent} Accent
                        </p>
                    </div>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                    {currentSentence + 1} / {totalSentences}
                </div>
            </div>
            <div className="mt-2">
                <div className="w-full bg-slate-200 rounded-full h-1">
                    <div
                        className="bg-gradient-to-r from-pink-500 to-rose-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>
        </div>
    )
}

export default DictationLessonHeader
