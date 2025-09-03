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

const DictationLessonMain: React.FC = () => {
    const { lessonId } = useParams<{ lessonId: string }>()
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
    const [hintEnabled, setHintEnabled] = useState(true)
    const [hintWordCount, setHintWordCount] = useState(0)
    const [challengeTransitioning, setChallengeTransitioning] = useState(false)

    useEffect(() => {
        setHintWordCount(0)
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
        !currentDictation.audioSrc && // Empty audioSrc means use YouTube
        !!lesson?.youtubeEmbedUrl && // Use embed URL for player
        currentDictation.timeStart !== undefined &&
        currentDictation.timeEnd !== undefined
    const autoPlayRef = useRef(false)
    const isCheckingRef = useRef(false)
    const playerReadyRef = useRef(false)

    useEffect(() => {
        const fetchLesson = async () => {
            if (!lessonId) return
            try {
                setLoading(true)
                setError(null)
                console.log('=== Fetching lesson detail for ID ===', lessonId)
                
                const response = await api.getLessonById(lessonId)
                console.log('=== Lesson detail response ===', response)
                
                if (response.success && response.data) {
                    const lessonData = response.data
                    console.log('API call successful, mapping lesson data...')
                    
                    // Map API response to LessonData format
                    const mappedLesson: LessonData = {
                        id: lessonData.id,
                        title: lessonData.lesson_name || lessonData.video_title || 'Untitled Lesson',
                        description: lessonData.category_description || 'Dictation exercise',
                        accent: lessonData.speech_to_text_lang_code === 'en-US' ? 'American' : 'International',
                        difficulty: lessonData.vocab_level || 'Intermediate',
                        duration: 120, // Default duration
                        youtubeUrl: lessonData.youtube_url || '',
                        youtubeEmbedUrl: lessonData.youtube_embed_url || '',
                        videoId: lessonData.video_id || '',
                        audioSrc: lessonData.audio_src || '', // Empty means YouTube
                        challenges: lessonData.challenges?.map((challenge: any, index: number) => ({
                            id: challenge.id,
                            content: challenge.content,
                            audioSrc: challenge.audio_src || '', // Empty means use YouTube
                            timeStart: challenge.time_start || 0,
                            timeEnd: challenge.time_end || 0,
                            hint: challenge.hint || '',
                            explanation: challenge.explanation || '',
                            position: challenge.position || index + 1
                        })) || []
                    }
                    
                    setLesson(mappedLesson)
                    console.log('Lesson mapped successfully:', mappedLesson)
                } else {
                    console.error('Lesson detail API failed:', response)
                    setError(response.message || 'Failed to load lesson')
                }
            } catch (err) {
                console.error("Error fetching lesson:", err)
                setError("Failed to connect to server. Please try again.")
            } finally {
                setLoading(false)
            }
        }
        fetchLesson()
    }, [lessonId]) // Only depend on lessonId to avoid re-fetching

    // Initialize lesson progress when lesson is loaded
    useEffect(() => {
        if (lesson && lessonId && !progress) {
            console.log('Initializing lesson progress')
            startLesson(lessonId, 'dictation', lesson.challenges.length)
        }
    }, [lesson, lessonId, progress, startLesson])

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
            currentDictation.timeStart !== undefined &&
            currentDictation.timeEnd !== undefined
        ) {
            console.log('Playing YouTube segment:', currentDictation.timeStart, 'to', currentDictation.timeEnd)
            youtubePlayer.pauseVideo()
            youtubePlayer.seekTo(currentDictation.timeStart, true)
            setTimeout(() => {
                youtubePlayer.playVideo()
            }, 200) // Increased delay for better reliability
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
        if (currentDictation.timeEnd === 0) return // Skip if no end time defined
        
        let interval: ReturnType<typeof setInterval>
        if (isYoutubePlaying) {
            interval = setInterval(() => {
                try {
                    const current = youtubePlayer.getCurrentTime()
                    console.log('YouTube current time:', current, 'target end:', currentDictation.timeEnd)
                    
                    // Stop when reaching end time (with small buffer)
                    if (current >= currentDictation.timeEnd - 0.2) {
                        console.log('Stopping YouTube at end time')
                        youtubePlayer.pauseVideo()
                        setIsYoutubePlaying(false)
                        setIsPlaying(false)
                        clearInterval(interval)
                        // Return to start position for next play
                        setTimeout(() => {
                            youtubePlayer.seekTo(currentDictation.timeStart, true)
                        }, 100)
                    }
                } catch (error) {
                    console.error('Error monitoring YouTube time:', error)
                    clearInterval(interval)
                }
            }, 100) // Check more frequently for better precision
        }
        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isYoutubePlaying, youtubePlayer, useYoutube, currentDictation])

    const handleCheck = () => {
        if (!userTranscript.trim() || !lesson?.challenges || !currentDictation)
            return
            
        console.log('handleCheck called - setting isCheckingRef to true')
        isCheckingRef.current = true
        
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
        
        // Removed autoplay after correct answer - user should manually decide to play again
        if (!isCorrect && hintEnabled) {
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
        
        // Reset checking flag after a short delay
        setTimeout(() => {
            console.log('Resetting isCheckingRef to false')
            isCheckingRef.current = false
        }, 1000) // Increased delay to ensure all effects settle
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
        console.log('Resetting audio/video')
        setIsPlaying(false)
        setIsYoutubePlaying(false)
        setCurrentTime(0)
        
        if (useYoutube && youtubePlayer && currentDictation) {
            youtubePlayer.pauseVideo()
            setTimeout(() => {
                youtubePlayer.seekTo(currentDictation.timeStart, true)
            }, 100)
        } else if (audioRef.current) {
            audioRef.current.currentTime = 0
            audioRef.current.pause()
        }
        
        // Don't reset play count - user might want to know how many times they played
        // setPlayCount(0)
    }, [useYoutube, audioRef, youtubePlayer, currentDictation])

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
        console.log('Moving to next challenge')
        
        // Show brief transition state for smooth UX
        setChallengeTransitioning(true)
        
        // Gently stop current playback without resetting player
        if (useYoutube && youtubePlayer) {
            youtubePlayer.pauseVideo()
            setIsYoutubePlaying(false)
        } else if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
        }
        setIsPlaying(false)
        
        if (
            lesson?.challenges &&
            currentSentence < lesson.challenges.length - 1
        ) {
            // Reset UI state for next challenge
            setUserTranscript("")
            setShowFeedback(false)
            setFeedback(null)
            setPlayCount(0)
            setCurrentTime(0)
            setCanProceed(false)
            setPronunciationFeedback("")
            setShowCorrectAnswer(false)
            setHintWordCount(0)
            
            // Smooth transition to next challenge
            setTimeout(() => {
                setCurrentSentence(currentSentence + 1)
                autoPlayRef.current = true
                setChallengeTransitioning(false)
            }, 100) // Very brief delay for smooth transition
        } else {
            navigate(`/dashboard/dictation`)
        }
    }

    // Handle challenge change - seek to new position without reloading
    useEffect(() => {
        // Debounce effect to avoid multiple rapid triggers
        const timeoutId = setTimeout(() => {
            if (lesson && currentDictation && youtubePlayer && useYoutube) {
                console.log('Challenge effect triggered - seeking to:', currentDictation.timeStart, 'autoPlayRef:', autoPlayRef.current, 'isChecking:', isCheckingRef.current)
                
                // Skip if currently checking transcript to avoid unwanted autoplay
                if (isCheckingRef.current) {
                    console.log('Skipping effect - currently checking transcript')
                    return
                }
                
                // Smoothly transition to new challenge position
                try {
                    // Check if player is ready before seeking
                    if (youtubePlayer.getPlayerState && youtubePlayer.getPlayerState() !== -1) {
                        youtubePlayer.seekTo(currentDictation.timeStart, true)
                        
                        // Auto-play ONLY if flag is explicitly set (e.g., from Next button)
                        if (autoPlayRef.current) {
                            console.log('Auto-playing due to autoPlayRef flag')
                            autoPlayRef.current = false
                            // Reduced delay for smoother experience
                            setTimeout(() => {
                                playYoutubeSegment()
                            }, 150)
                        } else {
                            console.log('No autoplay - flag not set')
                        }
                    } else {
                        console.log('YouTube player not ready yet, skipping seek')
                    }
                } catch (error) {
                    console.error('Error seeking YouTube player:', error)
                }
            } else if (lesson && currentDictation && autoPlayRef.current && !useYoutube && !isCheckingRef.current) {
                // Handle audio files
                console.log('Auto-playing audio due to autoPlayRef flag')
                autoPlayRef.current = false
                playChallengeAudio()
            }
        }, 100) // 100ms debounce
        
        return () => clearTimeout(timeoutId)
    }, [
        currentSentence,
        useYoutube,
        lesson,
        currentDictation,
        youtubePlayer,
        playYoutubeSegment,
        playChallengeAudio,
    ])

    // Removed pendingAutoPlay effect - handled in challenge change effect above

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pink-50">
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

export default DictationLessonMain
