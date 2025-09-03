import React from "react"
import { Check, ArrowRight, Mic, Square } from "lucide-react"
import type { LessonData } from "../../types/dictationTypes"
import PronunciationFeedback from "./PronunciationFeedback"

type Props = {
    userTranscript: string
    setUserTranscript: (val: string) => void
    showFeedback: boolean
    setShowFeedback: (val: boolean) => void
    feedback: any
    canProceed: boolean
    handleCheck: () => void
    handleNext: () => void
    currentSentence: number
    lesson: LessonData
    pronunciationEnabled: boolean
    isRecording: boolean
    showText: boolean
    setPronunciationFeedback: (val: string) => void
    startPronunciationRecording: () => void
    pronunciationFeedbackData: {
        word: string
        chars: { char: string; isCorrect: boolean }[]
    }[]
    pronunciationFeedback: string
    setShowText: (val: boolean) => void
}

const DictationWritingArea: React.FC<Props> = ({
    userTranscript,
    setUserTranscript,
    showFeedback,
    setShowFeedback,
    feedback,
    canProceed,
    handleCheck,
    handleNext,
    currentSentence,
    lesson,
    pronunciationEnabled,
    isRecording,
    showText,
    setPronunciationFeedback,
    startPronunciationRecording,
    pronunciationFeedbackData,
    pronunciationFeedback,
    setShowText,
}) => {
    const currentDictation = lesson.challenges[currentSentence]
    return (
        <div className="space-y-4">
            {!feedback?.allCorrect || !pronunciationEnabled ? (
                <textarea
                    value={userTranscript}
                    onChange={e => {
                        setUserTranscript(e.target.value)
                        setPronunciationFeedback("")
                    }}
                    placeholder="Type what you hear from the audio..."
                    className={`w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-lg ${
                        showFeedback
                            ? feedback?.allCorrect
                                ? "border-green-500 bg-green-50"
                                : "border-red-500 bg-red-50"
                            : "border-slate-300"
                    }`}
                />
            ) : pronunciationEnabled && showText ? (
                <div className="space-y-6">
                    <div className="bg-slate-50 rounded-lg p-8">
                        <div className="text-center mb-8">
                            <PronunciationFeedback
                                data={pronunciationFeedbackData}
                            />
                        </div>
                        <div className="flex justify-center">
                            <button
                                onClick={() => {
                                    setPronunciationFeedback("")
                                    startPronunciationRecording()
                                }}
                                disabled={isRecording}
                                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                                    isRecording
                                        ? "bg-red-500 animate-pulse"
                                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                } text-white`}
                            >
                                {isRecording ? (
                                    <Square className="w-6 h-6" />
                                ) : (
                                    <Mic className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                        {isRecording && (
                            <p className="text-red-600 font-medium text-center mt-4">
                                Recording... Speak clearly
                            </p>
                        )}
                    </div>
                </div>
            ) : null}
            <div className="flex space-x-3">
                {!feedback?.allCorrect && (
                    <button
                        onClick={handleCheck}
                        disabled={!userTranscript.trim()}
                        className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 text-white py-3 px-6 rounded-lg hover:from-pink-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                        <Check className="w-5 h-5" />
                        <span>Check Transcript</span>
                    </button>
                )}
                {canProceed && (
                    <button
                        onClick={handleNext}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                        <span>
                            {currentSentence < lesson.challenges.length - 1
                                ? "Next"
                                : "Complete"}
                        </span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    )
}

export default DictationWritingArea
