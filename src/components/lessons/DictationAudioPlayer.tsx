import React from "react"
import YouTube from "react-youtube"
import { Play, RotateCcw, Volume2 } from "lucide-react"
import type { LessonData, Challenge } from "../../types/dictationTypes"
import type { YouTubeEvent } from "react-youtube"

type Props = {
    lesson: LessonData
    currentDictation: Challenge
    useYoutube: boolean
    audioRef: React.RefObject<HTMLAudioElement>
    youtubePlayer: any
    setYoutubePlayer: (player: any) => void
    playCount: number
    setPlayCount: (count: number) => void
    currentTime: number
    setCurrentTime: (time: number) => void
    isPlaying: boolean
    setIsPlaying: (playing: boolean) => void
    isYoutubePlaying: boolean
    setIsYoutubePlaying: (playing: boolean) => void
    playChallengeAudio: () => void
    playYoutubeSegment: () => void
    pauseYoutube: () => void
    resetAudio: () => void
}

const DictationAudioPlayer: React.FC<Props> = ({
    lesson,
    currentDictation,
    useYoutube,
    audioRef,
    youtubePlayer,
    setYoutubePlayer,
    playCount,
    setPlayCount,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    isYoutubePlaying,
    setIsYoutubePlaying,
    playChallengeAudio,
    playYoutubeSegment,
    pauseYoutube,
    resetAudio,
}) => {
    return (
        <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">
                Listen and Write
            </h3>

            {useYoutube ? (
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-full flex justify-center">
                        {/* ✅ Responsive video wrapper with 16:9 aspect ratio */}
                        <div className="w-full max-w-2xl aspect-[16/9] mx-auto relative">
                            <YouTube
                                videoId={
                                    lesson.videoId ||
                                    lesson.youtubeUrl?.split("v=")[1]
                                }
                                opts={{
                                    width: "100%",
                                    height: "100%",
                                    playerVars: {
                                        controls: 1,
                                        modestbranding: 1,
                                        rel: 0,
                                        autoplay: 0, // Don't autoplay
                                        enablejsapi: 1, // Enable JS API for better control
                                    },
                                }}
                                iframeClassName="absolute top-0 left-0 w-full h-full"
                                onReady={(e: YouTubeEvent) => {
                                    console.log('YouTube player ready for lesson:', lesson.id)
                                    setYoutubePlayer(e.target)
                                    // Notify that player is ready
                                    setTimeout(() => {
                                        console.log('YouTube player fully initialized')
                                    }, 500)
                                }}
                                onStateChange={(e: YouTubeEvent) => {
                                    // YouTube player state: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
                                    const state = e.data
                                    
                                    if (state === 1) { // Playing
                                        setIsYoutubePlaying(true)
                                        setIsPlaying(true)
                                    } else if (state === 2 || state === 0) { // Paused or ended
                                        setIsYoutubePlaying(false)
                                        setIsPlaying(false)
                                    }
                                }}
                                onPause={() => {
                                    setIsYoutubePlaying(false)
                                    setIsPlaying(false)
                                }}
                                onPlay={() => {
                                    setIsYoutubePlaying(true)
                                    setIsPlaying(true)
                                }}
                            />
                        </div>
                    </div>
                    
                    {/* YouTube Control Buttons */}
                    <div className="flex items-center justify-center space-x-4">
                        <button
                            onClick={playYoutubeSegment}
                            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-200 font-medium"
                        >
                            <Play className="w-4 h-4" />
                            <span>Play Segment</span>
                        </button>
                        <button
                            onClick={resetAudio}
                            className="flex items-center space-x-2 px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-all duration-200 font-medium"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>Replay</span>
                        </button>
                    </div>
                    
                    {/* YouTube Segment Info */}
                    <div className="flex items-center justify-center space-x-4 text-sm text-slate-600">
                        <div className="flex items-center space-x-1">
                            <Volume2 className="w-4 h-4" />
                            <span>Played {playCount} times</span>
                        </div>
                        <span>•</span>
                        <span>
                            Segment: {currentDictation.timeStart.toFixed(1)}s - {currentDictation.timeEnd.toFixed(1)}s
                        </span>
                        <span>•</span>
                        <span>
                            Duration: {(currentDictation.timeEnd - currentDictation.timeStart).toFixed(1)}s
                        </span>
                    </div>
                </div>
            ) : (
                <>
                    {/* Removed Play/Replay buttons for audio */}
                    <audio
                        ref={audioRef}
                        src={currentDictation?.audioSrc || undefined}
                        preload="auto"
                        style={{ display: "none" }}
                    />

                    <div className="max-w-md mx-auto">
                        <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all"
                                style={{
                                    width: `${
                                        currentDictation &&
                                        audioRef.current?.duration
                                            ? (currentTime /
                                                  audioRef.current.duration) *
                                              100
                                            : 0
                                    }%`,
                                }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>{currentTime.toFixed(1)}s</span>
                            <span>
                                {(audioRef.current?.duration || 0).toFixed(1)}s
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center space-x-4 text-sm text-slate-600">
                        <div className="flex items-center space-x-1">
                            <Volume2 className="w-4 h-4" />
                            <span>Played {playCount} times</span>
                        </div>
                        <span>•</span>
                        <span>
                            Duration:{" "}
                            {(audioRef.current?.duration || 0).toFixed(1)}s
                        </span>
                    </div>
                </>
            )}
        </div>
    )
}

export default DictationAudioPlayer
