import React from "react";
import { Mic, Square } from "lucide-react";
import type { Challenge } from "../../types/dictationTypes";
import PronunciationFeedback from "./PronunciationFeedback";

type Props = {
    showPronunciationSection: boolean;
    isRecording: boolean;
    pronunciationFeedbackData: { word: string; chars: { char: string; isCorrect: boolean }[] }[];
    startPronunciationRecording: () => void;
    currentDictation: Challenge;
};

const DictationPronunciation: React.FC<Props> = ({
    showPronunciationSection,
    isRecording,
    pronunciationFeedbackData,
    startPronunciationRecording,
    currentDictation,
}) => {
    if (!showPronunciationSection) return null;
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Pronunciation Check</h4>
            <div className="text-center space-y-4">
                <p className="text-slate-600">
                    Great job on the dictation! Now let's check your pronunciation.
                </p>
                <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-blue-800 font-medium text-lg mb-2">Read this sentence:</p>
                    <p className="text-blue-900 text-xl font-semibold">{currentDictation?.content ?? ""}</p>
                </div>
                {!isRecording && !pronunciationFeedbackData ? (
                    <button
                        onClick={startPronunciationRecording}
                        className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center hover:from-blue-700 hover:to-indigo-700 transition-all mx-auto"
                    >
                        <Mic className="w-6 h-6" />
                    </button>
                ) : isRecording ? (
                    <div className="flex flex-col items-center space-y-2">
                        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                            <Square className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-red-600 font-medium">Recording... Speak clearly</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h5 className="font-medium text-slate-700">Pronunciation Analysis:</h5>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <PronunciationFeedback data={pronunciationFeedbackData} />
                        </div>
                        <div className="flex justify-center space-x-4 text-xs">
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-green-100 rounded"></div>
                                <span>Correct pronunciation</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-red-100 rounded"></div>
                                <span>Needs improvement</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DictationPronunciation; 