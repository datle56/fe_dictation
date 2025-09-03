import React, { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useProgress } from "../../contexts/ProgressContext"
import { api } from "../../utils/api"
import type { LessonData, Challenge } from "../../types/dictationTypes"
import {
    compareWordsDetailed,
    simulatePronunciationFeedback,
    renderPronunciationFeedback,
    getCharacterColor,
    getWordBorderColor,
} from "../../utils/dictationUtils"
import DictationLessonHeader from "./DictationLessonHeader"
import DictationLessonSettings from "./DictationLessonSettings"
import DictationLessonActions from "./DictationLessonActions"
import DictationLessonPlayer from "./DictationLessonPlayer"
import DictationWritingArea from "./DictationWritingArea"
import DictationFeedback from "./DictationFeedback"
import DictationPronunciation from "./DictationPronunciation"
import { Clock, Trophy } from "lucide-react"

// Thêm lessonId vào props
interface DictationLessonForPKProps {
    players: Array<{ id: string; name: string; avatar: string; score: number }>
    onScoreChange?: (
        scores: Array<{ id: string; name: string; score: number }>
    ) => void
    lessonId?: string // Thêm dòng này
    lessonData?: any // Add prop để nhận lesson data trực tiếp từ WebSocket
    timeLimit?: number // Thêm dòng này để nhận từ phòng
    submitAnswer?: (roomId: string, data: {
        playerId: string;
        sentenceIndex: number;
        answer: string;
        score: number;
        isCorrect: boolean;
        timeSpent: number;
    }) => void
    roomId?: string
    currentUser?: { id: string; name: string }
    gameFinished?: boolean // Thêm prop để nhận trạng thái game finished từ parent
}

const DictationLessonForPK: React.FC<DictationLessonForPKProps> = ({
    players,
    onScoreChange,
    lessonId: lessonIdProp, // destructure prop
    lessonData: lessonDataProp, // Add lesson data prop
    timeLimit: timeLimitProp,
    submitAnswer,
    roomId,
    currentUser,
    gameFinished,
}) => {
    console.log("[DictationLessonForPK] Component mounted with timeLimitProp:", timeLimitProp);
    // State điểm số real-time - sử dụng players từ props thay vì random
    const [scores, setScores] = useState(players.map(p => ({ ...p })))
    
    // Cập nhật scores khi players thay đổi (nhưng không trigger onScoreChange để tránh loop)
    useEffect(() => {
        console.log("[DictationLessonForPK] Players prop updated:", players);
        const newScores = players.map(p => ({ ...p }));
        console.log("[DictationLessonForPK] Setting new scores:", newScores);
        setScores(newScores);
    }, [players])
    
    // Chỉ trigger onScoreChange khi scores thay đổi từ local action (không phải từ props)
    const [localScoreUpdate, setLocalScoreUpdate] = useState(false)
    
    useEffect(() => {
        if (localScoreUpdate && onScoreChange) {
            onScoreChange([...scores].sort((a, b) => b.score - a.score))
            setLocalScoreUpdate(false) // Reset flag
        }
    }, [localScoreUpdate, scores, onScoreChange])

    // Lấy lessonId từ prop, nếu không có thì lấy từ useParams
    const urlParams = useParams<{ lessonId: string }>()
    const lessonId = lessonIdProp || urlParams.lessonId
    const navigate = useNavigate()
    const { startLesson, getProgress, addAttempt } = useProgress()

    const [lesson, setLesson] = useState<LessonData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const progress = getProgress(lessonId!)

    const [currentSentence, setCurrentSentence] = useState(0)
    const [userTranscript, setUserTranscript] = useState("")
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [showFeedback, setShowFeedback] = useState(false)
    const [feedback, setFeedback] = useState<any>(null)
    const [playCount, setPlayCount] = useState(0)
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false)
    const [pronunciationEnabled, setPronunciationEnabled] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [pronunciationFeedback, setPronunciationFeedback] =
        useState<string>("")
    const [showPronunciationSection, setShowPronunciationSection] =
        useState(false)
    const [canProceed, setCanProceed] = useState(false)
    const [showText, setShowText] = useState(true)
    const [pendingAutoPlay, setPendingAutoPlay] = useState(false)
    const [hintEnabled, setHintEnabled] = useState(true)
    const [hintWordCount, setHintWordCount] = useState(0)

    // Timer state
    const [timeLeft, setTimeLeft] = useState<number>(timeLimitProp || 600) // Default 10 minutes
    const [showLeaderboard, setShowLeaderboard] = useState(false)
    
    // Track time spent per sentence
    const [sentenceStartTime, setSentenceStartTime] = useState<number>(Date.now())

    // Lấy timeLimit từ prop hoặc mặc định 600s (10 phút)
    useEffect(() => {
        console.log("[DictationLessonForPK] Setting timeLeft to:", timeLimitProp || 600);
        setTimeLeft(timeLimitProp || 600) // 10 minutes default
    }, [timeLimitProp])

    // Lắng nghe gameFinished từ parent component
    useEffect(() => {
        if (gameFinished) {
            console.log("[DictationLessonForPK] Game finished by parent, showing leaderboard");
            setShowLeaderboard(true)
        }
    }, [gameFinished])

    // Đếm ngược
    useEffect(() => {
        if (showLeaderboard) return
        if (timeLeft <= 0) {
            console.log("[DictationLessonForPK] Time's up! Showing final leaderboard");
            setShowLeaderboard(true)
            return
        }
        
        console.log("[DictationLessonForPK] Timer running, timeLeft:", timeLeft);
        const timer = setInterval(() => {
            setTimeLeft((t: number) => {
                const newTime = t - 1;
                if (newTime % 30 === 0) { // Log every 30 seconds
                    console.log("[DictationLessonForPK] Timer countdown:", newTime);
                }
                return newTime;
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [timeLeft, showLeaderboard])

    useEffect(() => {
        setHintWordCount(0)
        setSentenceStartTime(Date.now()) // Reset timer when sentence changes
    }, [currentSentence])
    useEffect(() => {
        if (feedback?.allCorrect) setHintWordCount(0)
    }, [feedback])

    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [youtubePlayer, setYoutubePlayer] = useState<any>(null)
    const [isYoutubePlaying, setIsYoutubePlaying] = useState(false)

    const currentDictation = lesson?.challenges
        ? lesson.challenges[currentSentence]
        : null
    const useYoutube =
        !!currentDictation &&
        !currentDictation.audioSrc &&
        !!lesson?.youtubeUrl &&
        currentDictation.timeStart !== undefined &&
        currentDictation.timeEnd !== undefined
    const autoPlayRef = useRef(false)

    useEffect(() => {
        const fetchLesson = async () => {
            // If lessonDataProp is provided (from WebSocket), use it directly
            if (lessonDataProp) {
                console.log("[DictationLessonForPK] Using lesson data from WebSocket:", lessonDataProp)
                setLesson(lessonDataProp)
                setLoading(false)
                autoPlayRef.current = true
                setSentenceStartTime(Date.now()) // Initialize timer when lesson starts
                return
            }
            
            // Otherwise, fetch lesson by ID
            if (!lessonId) return
            try {
                setLoading(true)
                const response = await api.getLessonById(lessonId)
                if (response.success && response.data) {
                    setLesson(response.data)
                    if (!progress) {
                        startLesson(
                            lessonId,
                            "dictation",
                            response.data.challenges?.length || 0
                        )
                    }
                    autoPlayRef.current = true
                    setSentenceStartTime(Date.now()) // Initialize timer when lesson starts
                } else {
                    setError(response.message || "Failed to load lesson")
                }
            } catch (err) {
                setError("Failed to load lesson")
                console.error("Error fetching lesson:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchLesson()
    }, [lessonId, lessonDataProp, progress, startLesson])

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
        const handleEnded = () => {
            setIsPlaying(false)
            setCurrentTime(0)
            audio.pause()
            audio.currentTime = 0
        }
        const handlePlay = () => setIsPlaying(true)
        const handlePause = () => setIsPlaying(false)
        audio.addEventListener("timeupdate", handleTimeUpdate)
        audio.addEventListener("ended", handleEnded)
        audio.addEventListener("play", handlePlay)
        audio.addEventListener("pause", handlePause)
        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate)
            audio.removeEventListener("ended", handleEnded)
            audio.removeEventListener("play", handlePlay)
            audio.removeEventListener("pause", handlePause)
        }
    }, [audioRef])

    const playChallengeAudio = useCallback(() => {
        if (currentDictation?.audioSrc && audioRef.current) {
            audioRef.current.currentTime = 0
            audioRef.current.play()
            setPlayCount(prev => prev + 1)
            setIsPlaying(true)
        }
    }, [currentDictation?.audioSrc])

    const playYoutubeSegment = useCallback(() => {
        if (
            youtubePlayer &&
            useYoutube &&
            currentDictation &&
            currentDictation.timeStart !== undefined
        ) {
            youtubePlayer.pauseVideo()
            youtubePlayer.seekTo(currentDictation.timeStart, true)
            setTimeout(() => {
                youtubePlayer.playVideo()
            }, 100)
            setIsYoutubePlaying(true)
            setIsPlaying(true)
            setPlayCount(prev => prev + 1)
        }
    }, [youtubePlayer, useYoutube, currentDictation])

    const pauseYoutube = useCallback(() => {
        if (youtubePlayer && useYoutube) {
            youtubePlayer.pauseVideo()
            setIsYoutubePlaying(false)
            setIsPlaying(false)
        }
    }, [youtubePlayer, useYoutube])

    useEffect(() => {
        if (!youtubePlayer || !useYoutube || !currentDictation) return
        let interval: ReturnType<typeof setInterval>
        if (isYoutubePlaying) {
            interval = setInterval(() => {
                const current = youtubePlayer.getCurrentTime()
                if (current >= currentDictation.timeEnd - 0.1) {
                    youtubePlayer.pauseVideo()
                    setIsYoutubePlaying(false)
                    setIsPlaying(false)
                    clearInterval(interval)
                    youtubePlayer.seekTo(currentDictation.timeStart, true)
                }
            }, 200)
        }
        return () => clearInterval(interval)
    }, [isYoutubePlaying, youtubePlayer, useYoutube, currentDictation])

    const hasSubmittedRef = useRef(false)

    // Reset hasSubmitted khi user thay đổi input hoặc khi trả lời sai
    useEffect(() => {
        console.log("[DictationLessonForPK] User transcript changed, resetting hasSubmitted");
        hasSubmittedRef.current = false
    }, [userTranscript])

    // Reset hasSubmitted khi feedback thay đổi và trả lời sai
    useEffect(() => {
        if (feedback && !feedback.allCorrect) {
            console.log("[DictationLessonForPK] Answer was incorrect, allowing retry");
            // Delay reset để tránh spam
            setTimeout(() => {
                hasSubmittedRef.current = false
                console.log("[DictationLessonForPK] hasSubmitted reset to false after incorrect answer");
            }, 100)
        }
    }, [feedback])

    const handleCheck = () => {
        console.log("[DictationLessonForPK] handleCheck called, hasSubmitted:", hasSubmittedRef.current);
        if (!userTranscript.trim() || !lesson?.challenges || !currentDictation) {
            console.log("[DictationLessonForPK] Early return - missing data");
            return
        }
        
        if (hasSubmittedRef.current) {
            console.log("[DictationLessonForPK] Already submitted, skipping");
            return
        }
        
        console.log("[DictationLessonForPK] Setting hasSubmitted to true");
        hasSubmittedRef.current = true // Prevent duplicate submissions
        
        const correctText = currentDictation.content
        const comparison = compareWordsDetailed(userTranscript, correctText)
        const isCorrect =
            comparison.length === correctText.trim().split(/\s+/).length &&
            comparison.every(word => word.status === "correct")
        setFeedback({
            allCorrect: isCorrect,
            userText: userTranscript,
            comparison,
            correctText,
        })
        setShowFeedback(true)
        setCanProceed(isCorrect)
        if (isCorrect) {
            autoPlayRef.current = true
        } else if (hintEnabled) {
            setHintWordCount(count =>
                Math.min(count + 1, correctText.trim().split(/\s+/).length)
            )
        }
        addAttempt(lessonId!, {
            sentenceIndex: currentSentence,
            userAnswer: userTranscript,
            correctAnswer: correctText,
            aiFeedback: { allCorrect: isCorrect, comparison },
            score: isCorrect ? 1 : 0, // Thay đổi: 1 điểm cho mỗi câu hoàn thành đúng
            attemptNumber: 1,
            createdAt: new Date(),
        })

        // Gửi điểm số lên backend qua SignalR nếu có submitAnswer function
        if (submitAnswer && roomId && currentUser) {
            const scoreToAdd = isCorrect ? 100 : 0 // 100 điểm cho mỗi câu trả lời đúng
            const timeSpent = Math.round((Date.now() - sentenceStartTime) / 1000) // Calculate time spent in seconds
            
            console.log("[DictationLessonForPK] Submitting answer:", {
                playerId: currentUser.id,
                sentenceIndex: currentSentence,
                answer: userTranscript,
                score: scoreToAdd,
                isCorrect,
                timeSpent
            });
            
            // Submit answer without waiting (fire and forget)
            // UI feedback is already shown above
            submitAnswer(roomId, {
                playerId: currentUser.id,
                sentenceIndex: currentSentence,
                answer: userTranscript,
                score: scoreToAdd,
                isCorrect,
                timeSpent,
            })
        }
    }

    const [showSettings, setShowSettings] = useState(false)
    const [settings, setSettings] = useState({
        replayKey: "Ctrl",
        playPauseKey: "`",
        autoReplay: false,
        secondsBetweenReplays: 0.5,
        wordSuggestions: "Disabled",
    })
    const settingsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                settingsRef.current &&
                !settingsRef.current.contains(event.target as Node)
            ) {
                setShowSettings(false)
            }
        }
        if (showSettings) {
            document.addEventListener("mousedown", handleClickOutside)
        } else {
            document.removeEventListener("mousedown", handleClickOutside)
        }
        return () =>
            document.removeEventListener("mousedown", handleClickOutside)
    }, [showSettings])

    const resetAudio = useCallback(() => {
        setIsPlaying(false)
        setIsYoutubePlaying(false)
        setCurrentTime(0)
        if (audioRef.current) {
            audioRef.current.currentTime = 0
            audioRef.current.pause()
        }
        if (youtubePlayer && currentDictation) {
            youtubePlayer.pauseVideo()
            youtubePlayer.seekTo(currentDictation.timeStart, true)
        }
        setPlayCount(0)
    }, [audioRef, youtubePlayer, currentDictation])

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const active = document.activeElement as HTMLElement
            const isTextarea = active && active.tagName === "TEXTAREA"
            if (e.key === settings.playPauseKey) {
                e.preventDefault()
                if (isPlaying || isYoutubePlaying) {
                    if (useYoutube) pauseYoutube()
                    else resetAudio()
                } else {
                    if (useYoutube) playYoutubeSegment()
                    else playChallengeAudio()
                }
            }
            if (
                (settings.replayKey === "Ctrl" && e.ctrlKey) ||
                (settings.replayKey === "Shift" && e.shiftKey) ||
                (settings.replayKey === "Alt" && e.altKey)
            ) {
                e.preventDefault()
                if (useYoutube) playYoutubeSegment()
                else resetAudio()
            }
            if (e.key === "Enter" && isTextarea && !e.shiftKey) {
                e.preventDefault()
                handleCheck()
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [
        settings,
        isPlaying,
        isYoutubePlaying,
        useYoutube,
        playYoutubeSegment,
        pauseYoutube,
        playChallengeAudio,
        resetAudio,
        handleCheck,
    ])

    useEffect(() => {
        if (!settings.autoReplay) return
        if (!(isPlaying || isYoutubePlaying)) return
        let timeout: any = null
        function onEnd() {
            timeout = setTimeout(() => {
                if (useYoutube) playYoutubeSegment()
                else playChallengeAudio()
            }, settings.secondsBetweenReplays * 1000)
        }
        if (useYoutube && youtubePlayer) {
            youtubePlayer.addEventListener("onStateChange", (e: any) => {
                if (e.data === 0) onEnd()
            })
        } else if (audioRef.current) {
            audioRef.current.addEventListener("ended", onEnd)
        }
        return () => {
            if (timeout) clearTimeout(timeout)
            if (audioRef.current)
                audioRef.current.removeEventListener("ended", onEnd)
        }
    }, [
        settings.autoReplay,
        settings.secondsBetweenReplays,
        isPlaying,
        isYoutubePlaying,
        useYoutube,
        playYoutubeSegment,
        playChallengeAudio,
        youtubePlayer,
    ])

    const handleNext = () => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
            setIsPlaying(false)
        }
        if (youtubePlayer) {
            youtubePlayer.pauseVideo()
            youtubePlayer.seekTo(currentDictation?.timeStart || 0, true)
            setIsYoutubePlaying(false)
        }
        if (
            lesson?.challenges &&
            currentSentence < lesson.challenges.length - 1
        ) {
            setCurrentSentence(currentSentence + 1)
            setUserTranscript("")
            setShowFeedback(false)
            setFeedback(null)
            setPlayCount(0)
            setCurrentTime(0)
            setCanProceed(false)
            setPronunciationFeedback("")
            setShowCorrectAnswer(false)
            setHintWordCount(0)
            hasSubmittedRef.current = false // Reset submission state for next sentence
            setSentenceStartTime(Date.now()) // Reset timer for next sentence
            if (!autoPlayRef.current) {
                autoPlayRef.current = true
            }
        } else {
            // Game sẽ tự động kết thúc khi hết thời gian - hiển thị leaderboard
            console.log("[DictationLessonForPK] Game completed, showing final leaderboard");
            setShowLeaderboard(true)
        }
    }

    useEffect(() => {
        if (lesson && currentDictation && autoPlayRef.current) {
            autoPlayRef.current = false
            if (useYoutube) {
                if (youtubePlayer) {
                    setTimeout(() => {
                        playYoutubeSegment()
                    }, 100)
                } else {
                    setPendingAutoPlay(true)
                }
            } else {
                playChallengeAudio()
            }
        }
    }, [
        currentSentence,
        useYoutube,
        lesson,
        currentDictation,
        youtubePlayer,
        playYoutubeSegment,
        playChallengeAudio,
    ])

    useEffect(() => {
        if (pendingAutoPlay && youtubePlayer && useYoutube) {
            setPendingAutoPlay(false)
            setTimeout(() => {
                playYoutubeSegment()
            }, 100)
        }
    }, [pendingAutoPlay, youtubePlayer, useYoutube, playYoutubeSegment])

    const startPronunciationRecording = async () => {
        try {
            setIsRecording(true)
            setShowText(false)
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            })
            const mediaRecorder = new MediaRecorder(stream)
            const audioChunks: BlobPart[] = []
            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data)
            }
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/wav" })
                setShowText(true)
                if (lesson?.challenges && currentDictation) {
                    setPronunciationFeedback(
                        simulatePronunciationFeedback(currentDictation.content)
                    )
                }
            }
            mediaRecorder.start()
            setTimeout(() => {
                mediaRecorder.stop()
                stream.getTracks().forEach(track => track.stop())
                setIsRecording(false)
            }, 5000)
        } catch (error) {
            console.error("Error accessing microphone:", error)
            setIsRecording(false)
            setShowText(true)
            alert("Error accessing microphone. Please check your permissions.")
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading lesson...</p>
                </div>
            </div>
        )
    }
    if (error || !lesson) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">
                        {error || "Lesson not found"}
                    </p>
                    <button
                        onClick={() => navigate("/dashboard/dictation")}
                        className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                    >
                        Back to Lessons
                    </button>
                </div>
            </div>
        )
    }

    // Final Leaderboard UI
    if (showLeaderboard) {
        console.log("[DictationLessonForPK] Rendering final leaderboard with scores:", scores);
        const sorted = [...scores].sort((a, b) => b.score - a.score)
        console.log("[DictationLessonForPK] Sorted scores for leaderboard:", sorted);

        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-pink-50">
                <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-200">
                    <div className="text-center mb-8">
                        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <h1 className="text-4xl font-bold text-slate-800 mb-2">
                            Kết quả PK
                        </h1>
                        <p className="text-lg text-slate-600">Bảng xếp hạng cuối cùng</p>
                    </div>
                    <ol className="space-y-4 mb-8">
                        {sorted.map((p, i) => {
                            const isAvatarUrl =
                                p.avatar &&
                                (p.avatar.startsWith("http://") ||
                                    p.avatar.startsWith("https://"))
                            const isCurrentUser = currentUser?.id === p.id
                            let bg = ""
                            if (i === 0)
                                bg =
                                    "bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-300 shadow-lg"
                            else if (i === 1)
                                bg =
                                    "bg-gradient-to-r from-gray-100 to-slate-100 border-gray-300"
                            else if (i === 2)
                                bg =
                                    "bg-gradient-to-r from-orange-100 to-red-100 border-orange-300"
                            else bg = "bg-slate-50 border-slate-200"
                            return (
                                <li
                                    key={p.id}
                                    className={`flex items-center justify-between p-4 rounded-xl border ${bg} ${isCurrentUser ? 'ring-2 ring-pink-400' : ''}`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                                                i === 0
                                                    ? "bg-yellow-400 text-white shadow-lg"
                                                    : i === 1
                                                    ? "bg-gray-400 text-white"
                                                    : i === 2
                                                    ? "bg-orange-400 text-white"
                                                    : "bg-slate-300 text-white"
                                            }`}
                                        >
                                            {isAvatarUrl ? (
                                                <img
                                                    src={p.avatar}
                                                    alt={p.name}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                p.avatar || p.name[0]
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-semibold text-slate-800 text-lg">
                                                    {p.name}
                                                </span>
                                                {isCurrentUser && (
                                                    <span className="text-xs text-pink-600 font-semibold">(You)</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Hạng #{i + 1}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-pink-600">
                                            {p.score}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            điểm
                                        </div>
                                    </div>
                                </li>
                            )
                        })}
                    </ol>
                    <div className="text-center">
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

    const pronunciationFeedbackData =
        currentDictation && pronunciationFeedback
            ? renderPronunciationFeedback(
                  currentDictation.content,
                  pronunciationFeedback
              )
            : []
    const hintContent = currentDictation
        ? currentDictation.content
              .split(/\s+/)
              .slice(0, hintWordCount)
              .join(" ")
        : ""

    // Sort players by score for leaderboard
    console.log("[DictationLessonForPK] Current players prop:", players);
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
    console.log("[DictationLessonForPK] Sorted players for live leaderboard:", sortedPlayers);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pink-50">
            <div className="flex items-center justify-center mb-4">
                <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow border border-pink-200">
                    <Clock className="w-5 h-5 text-pink-500" />
                    <span className="font-semibold text-pink-600 text-lg">
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                </div>
            </div>

            {/* Live Leaderboard */}
            <div className="max-w-6xl mx-auto px-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                        Live Leaderboard
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {sortedPlayers.map((player, index) => {
                            const isCurrentUser = currentUser?.id === player.id
                            const bgClass = index === 0
                                ? "bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-300"
                                : index === 1
                                ? "bg-gradient-to-r from-gray-100 to-slate-100 border-gray-300"
                                : index === 2
                                ? "bg-gradient-to-r from-orange-100 to-red-100 border-orange-300"
                                : "bg-slate-50 border-slate-200"

                            return (
                                <div
                                    key={player.id}
                                    className={`p-3 rounded-lg border text-center ${bgClass} ${isCurrentUser ? 'ring-2 ring-pink-400' : ''}`}
                                >
                                    <div className="flex items-center justify-center mb-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                            index === 0 ? "bg-yellow-500 text-white" :
                                            index === 1 ? "bg-gray-400 text-white" :
                                            index === 2 ? "bg-orange-500 text-white" :
                                            "bg-slate-400 text-white"
                                        }`}>
                                            {index + 1}
                                        </div>
                                        {isCurrentUser && (
                                            <span className="ml-1 text-xs text-pink-600 font-semibold">(You)</span>
                                        )}
                                    </div>
                                    <div className="text-xs font-medium text-slate-800 truncate mb-1">
                                        {player.name}
                                    </div>
                                    <div className="text-lg font-bold text-pink-600">
                                        {player.score}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            <DictationLessonHeader
                lesson={{ title: lesson.title, accent: lesson.accent }}
                currentSentence={currentSentence}
                totalSentences={lesson.challenges.length}
            />
            <div className="max-w-6xl mx-auto p-4 space-y-6">
                {currentDictation && useYoutube ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-6 items-stretch">
                        <div className="md:w-2/5 w-full flex items-start justify-center">
                            <div className="w-full max-w-xl aspect-[16/9]">
                                <DictationLessonPlayer
                                    lesson={lesson}
                                    currentDictation={currentDictation}
                                    useYoutube={Boolean(useYoutube)}
                                    audioRef={audioRef}
                                    youtubePlayer={youtubePlayer}
                                    setYoutubePlayer={setYoutubePlayer}
                                    playCount={playCount}
                                    setPlayCount={setPlayCount}
                                    currentTime={currentTime}
                                    setCurrentTime={setCurrentTime}
                                    isPlaying={isPlaying}
                                    setIsPlaying={setIsPlaying}
                                    isYoutubePlaying={isYoutubePlaying}
                                    setIsYoutubePlaying={setIsYoutubePlaying}
                                    playChallengeAudio={playChallengeAudio}
                                    playYoutubeSegment={playYoutubeSegment}
                                    pauseYoutube={pauseYoutube}
                                    resetAudio={resetAudio}
                                />
                            </div>
                        </div>
                        <div className="md:w-3/5 w-full flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center flex-1 min-h-[32px]">
                                    {showFeedback && feedback && (
                                        <div
                                            className={`text-sm font-medium rounded px-2 py-1 w-fit mr-2 ${
                                                feedback.allCorrect
                                                    ? "bg-green-50 text-green-800"
                                                    : "bg-red-50 text-red-800"
                                            }`}
                                        >
                                            {feedback.allCorrect
                                                ? "🎉 Perfect!"
                                                : "📝 Not quite right!"}
                                        </div>
                                    )}
                                    {pronunciationEnabled &&
                                        !isRecording &&
                                        !showFeedback && (
                                            <span className="text-base font-semibold text-slate-800">
                                                Click the microphone to start
                                                recording
                                            </span>
                                        )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <DictationLessonActions
                                        useYoutube={useYoutube}
                                        onReplay={() => {
                                            if (useYoutube) playYoutubeSegment()
                                            else resetAudio()
                                        }}
                                        onSkip={() => {
                                            setShowCorrectAnswer(true)
                                            if (lesson && currentDictation) {
                                                const correctText =
                                                    currentDictation.content
                                                const comparison =
                                                    compareWordsDetailed(
                                                        correctText,
                                                        correctText
                                                    )
                                                setFeedback({
                                                    allCorrect: true,
                                                    userText: userTranscript,
                                                    comparison,
                                                    correctText,
                                                })
                                                setShowFeedback(true)
                                                setCanProceed(true)
                                                addAttempt(lessonId!, {
                                                    sentenceIndex:
                                                        currentSentence,
                                                    userAnswer: userTranscript,
                                                    correctAnswer: correctText,
                                                    aiFeedback: {
                                                        allCorrect: true,
                                                        comparison,
                                                    },
                                                    score: 0,
                                                    attemptNumber: 1,
                                                    createdAt: new Date(),
                                                })
                                            }
                                        }}
                                        onToggleHint={() =>
                                            setHintEnabled(v => !v)
                                        }
                                        hintEnabled={hintEnabled}
                                        onTogglePronunciation={() =>
                                            setPronunciationEnabled(
                                                !pronunciationEnabled
                                            )
                                        }
                                        pronunciationEnabled={
                                            pronunciationEnabled
                                        }
                                        onToggleShowAnswer={() =>
                                            setShowCorrectAnswer(
                                                !showCorrectAnswer
                                            )
                                        }
                                        showCorrectAnswer={showCorrectAnswer}
                                        onToggleSettings={() =>
                                            setShowSettings(v => !v)
                                        }
                                        showSettings={showSettings}
                                    />
                                    <div className="relative">
                                        <DictationLessonSettings
                                            settings={settings}
                                            setSettings={setSettings}
                                            showSettings={showSettings}
                                            setShowSettings={setShowSettings}
                                            settingsRef={settingsRef}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DictationWritingArea
                                userTranscript={userTranscript}
                                setUserTranscript={setUserTranscript}
                                showFeedback={showFeedback}
                                setShowFeedback={setShowFeedback}
                                feedback={feedback}
                                canProceed={canProceed}
                                handleCheck={handleCheck}
                                handleNext={handleNext}
                                currentSentence={currentSentence}
                                lesson={lesson}
                                pronunciationEnabled={pronunciationEnabled}
                                isRecording={isRecording}
                                showText={showText}
                                setPronunciationFeedback={
                                    setPronunciationFeedback
                                }
                                startPronunciationRecording={
                                    startPronunciationRecording
                                }
                                pronunciationFeedbackData={
                                    pronunciationFeedbackData
                                }
                                pronunciationFeedback={pronunciationFeedback}
                                setShowText={setShowText}
                            />
                            <div className="mt-4">
                                <DictationFeedback
                                    showFeedback={showFeedback}
                                    feedback={feedback}
                                    showCorrectAnswer={showCorrectAnswer}
                                    setShowCorrectAnswer={setShowCorrectAnswer}
                                    getCharacterColor={getCharacterColor}
                                    getWordBorderColor={getWordBorderColor}
                                    lesson={lesson}
                                />
                            </div>
                            {currentDictation &&
                                hintEnabled &&
                                showFeedback &&
                                feedback &&
                                !feedback.allCorrect && (
                                    <div className="mt-2 bg-blue-50 text-blue-800 rounded p-2 text-sm w-fit">
                                        <b>Hint:</b> {hintContent}
                                    </div>
                                )}
                        </div>
                    </div>
                ) : (
                    <>
                        {currentDictation && (
                            <div className="mb-2">
                                <DictationLessonPlayer
                                    lesson={lesson}
                                    currentDictation={currentDictation}
                                    useYoutube={Boolean(useYoutube)}
                                    audioRef={audioRef}
                                    youtubePlayer={youtubePlayer}
                                    setYoutubePlayer={setYoutubePlayer}
                                    playCount={playCount}
                                    setPlayCount={setPlayCount}
                                    currentTime={currentTime}
                                    setCurrentTime={setCurrentTime}
                                    isPlaying={isPlaying}
                                    setIsPlaying={setIsPlaying}
                                    isYoutubePlaying={isYoutubePlaying}
                                    setIsYoutubePlaying={setIsYoutubePlaying}
                                    playChallengeAudio={playChallengeAudio}
                                    playYoutubeSegment={playYoutubeSegment}
                                    pauseYoutube={pauseYoutube}
                                    resetAudio={resetAudio}
                                />
                            </div>
                        )}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center flex-1 min-h-[32px]">
                                    {showFeedback && feedback && (
                                        <div
                                            className={`text-sm font-medium rounded px-2 py-1 w-fit mr-2 ${
                                                feedback.allCorrect
                                                    ? "bg-green-50 text-green-800"
                                                    : "bg-red-50 text-red-800"
                                            }`}
                                        >
                                            {feedback.allCorrect
                                                ? "🎉 Perfect! You can proceed to the next sentence!"
                                                : "📝 Not quite right. Try again!"}
                                        </div>
                                    )}
                                    {pronunciationEnabled &&
                                        !isRecording &&
                                        !showFeedback && (
                                            <span className="text-base font-semibold text-slate-800">
                                                Click the microphone to start
                                                recording
                                            </span>
                                        )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <DictationLessonActions
                                        useYoutube={useYoutube}
                                        onReplay={() => {
                                            if (useYoutube) playYoutubeSegment()
                                            else resetAudio()
                                        }}
                                        onSkip={() => {
                                            setShowCorrectAnswer(true)
                                            if (lesson && currentDictation) {
                                                const correctText =
                                                    currentDictation.content
                                                const comparison =
                                                    compareWordsDetailed(
                                                        correctText,
                                                        correctText
                                                    )
                                                setFeedback({
                                                    allCorrect: true,
                                                    userText: userTranscript,
                                                    comparison,
                                                    correctText,
                                                })
                                                setShowFeedback(true)
                                                setCanProceed(true)
                                                addAttempt(lessonId!, {
                                                    sentenceIndex:
                                                        currentSentence,
                                                    userAnswer: userTranscript,
                                                    correctAnswer: correctText,
                                                    aiFeedback: {
                                                        allCorrect: true,
                                                        comparison,
                                                    },
                                                    score: 0,
                                                    attemptNumber: 1,
                                                    createdAt: new Date(),
                                                })
                                            }
                                        }}
                                        onToggleHint={() =>
                                            setHintEnabled(v => !v)
                                        }
                                        hintEnabled={hintEnabled}
                                        onTogglePronunciation={() =>
                                            setPronunciationEnabled(
                                                !pronunciationEnabled
                                            )
                                        }
                                        pronunciationEnabled={
                                            pronunciationEnabled
                                        }
                                        onToggleShowAnswer={() =>
                                            setShowCorrectAnswer(
                                                !showCorrectAnswer
                                            )
                                        }
                                        showCorrectAnswer={showCorrectAnswer}
                                        onToggleSettings={() =>
                                            setShowSettings(v => !v)
                                        }
                                        showSettings={showSettings}
                                    />
                                    <div className="relative">
                                        <DictationLessonSettings
                                            settings={settings}
                                            setSettings={setSettings}
                                            showSettings={showSettings}
                                            setShowSettings={setShowSettings}
                                            settingsRef={settingsRef}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DictationWritingArea
                                userTranscript={userTranscript}
                                setUserTranscript={setUserTranscript}
                                showFeedback={showFeedback}
                                setShowFeedback={setShowFeedback}
                                feedback={feedback}
                                canProceed={canProceed}
                                handleCheck={handleCheck}
                                handleNext={handleNext}
                                currentSentence={currentSentence}
                                lesson={lesson}
                                pronunciationEnabled={pronunciationEnabled}
                                isRecording={isRecording}
                                showText={showText}
                                setPronunciationFeedback={
                                    setPronunciationFeedback
                                }
                                startPronunciationRecording={
                                    startPronunciationRecording
                                }
                                pronunciationFeedbackData={
                                    pronunciationFeedbackData
                                }
                                pronunciationFeedback={pronunciationFeedback}
                                setShowText={setShowText}
                            />
                            <div className="mt-4">
                                <DictationFeedback
                                    showFeedback={showFeedback}
                                    feedback={feedback}
                                    showCorrectAnswer={showCorrectAnswer}
                                    setShowCorrectAnswer={setShowCorrectAnswer}
                                    getCharacterColor={getCharacterColor}
                                    getWordBorderColor={getWordBorderColor}
                                    lesson={lesson}
                                />
                            </div>
                            {currentDictation &&
                                hintEnabled &&
                                showFeedback &&
                                feedback &&
                                !feedback.allCorrect && (
                                    <div className="mt-2 bg-blue-50 text-blue-800 rounded p-2 text-sm w-fit">
                                        <b>Hint:</b> {hintContent}
                                    </div>
                                )}
                            
                            {/* Game sẽ tự động kết thúc khi hết thời gian */}
                            <div className="mt-4 flex justify-center">
                                <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                                    ⏰ Game sẽ tự động kết thúc khi hết thời gian
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {pronunciationEnabled && (
                    <DictationPronunciation
                        showPronunciationSection={true}
                        isRecording={isRecording}
                        pronunciationFeedbackData={pronunciationFeedbackData}
                        startPronunciationRecording={
                            startPronunciationRecording
                        }
                        currentDictation={currentDictation as Challenge}
                    />
                )}
            </div>
        </div>
    )
}

export default DictationLessonForPK
