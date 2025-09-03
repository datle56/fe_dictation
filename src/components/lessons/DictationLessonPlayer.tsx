import React from "react"
import DictationAudioPlayer from "./DictationAudioPlayer"
import type { LessonData, Challenge } from "../../types/dictationTypes"

interface DictationLessonPlayerProps {
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

const DictationLessonPlayer: React.FC<DictationLessonPlayerProps> = ({
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
        <DictationAudioPlayer
            lesson={lesson}
            currentDictation={currentDictation}
            useYoutube={useYoutube}
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
    )
}

export default DictationLessonPlayer
