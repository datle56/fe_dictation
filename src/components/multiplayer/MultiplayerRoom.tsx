import React, { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
    Crown,
    Users,
    Play,
    ArrowLeft,
    Copy,
    Check,
    Shuffle,
    Clock,
    Trophy,
    Zap,
    UserX,
} from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useMultiplayer } from "../../contexts/MultiplayerContext"
import DictationLessonForPK from "../lessons/DictationLessonForPK"

const MultiplayerRoom: React.FC = () => {
    const params = useParams()
    const roomCode = params.roomId as string
    const navigate = useNavigate()
    const { user, getValidAccessToken } = useAuth()
    const { updateActiveRoom } = useMultiplayer()
    
    const [room, setRoom] = useState<any | null>(null)
    const [availableLessons, setAvailableLessons] = useState<any[]>([])
    const [selectedLesson, setSelectedLesson] = useState<any>(null)
    const [gameLesson, setGameLesson] = useState<any>(null) // Store lesson data from game_start

    const [copied, setCopied] = useState(false)

    const [token, setToken] = useState<string | null>(null)
    const [baseUrl] = useState("http://localhost:8080")
    const [ws, setWs] = useState<WebSocket | null>(null)
    const [generalWs, setGeneralWs] = useState<WebSocket | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [wsStatus, setWsStatus] = useState("Disconnected")
    const [shouldReconnect, setShouldReconnect] = useState(true)
    const [logs, setLogs] = useState<string[]>([])
    const [isConnecting, setIsConnecting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
    const lastReadyToggle = useRef<number>(0)
    const [uiReady, setUiReady] = useState(false)
    const connectionAttemptRef = useRef<NodeJS.Timeout | null>(null)

    // Game state
    const [gameStarted, setGameStarted] = useState(false)
    const [gameFinished, setGameFinished] = useState(false)
    const [currentScores, setCurrentScores] = useState<{[playerId: string]: number}>({})
    const [, setGameSettings] = useState<any>(null)

    const log = (message: string) => {
        const timestamp = new Date().toLocaleTimeString()
        setLogs(prev => [...prev, `[${timestamp}] ${message}`])
        console.log(`[${timestamp}] ${message}`)
    }

    // Get token on mount
    useEffect(() => {
        const initializeToken = async () => {
            const accessToken = await getValidAccessToken()
            setToken(accessToken)
        }
        
        if (user) {
            initializeToken()
        }
    }, [user, getValidAccessToken])

    // Initialize room and WebSocket
    useEffect(() => {
        if (user && token && roomCode) {
            connectGeneralWebSocket()
            refreshCurrentRoom()
        }

        return () => {
            setShouldReconnect(false) // Stop reconnection attempts
            if (connectionAttemptRef.current) {
                clearTimeout(connectionAttemptRef.current)
                connectionAttemptRef.current = null
            }
            if (ws) ws.close()
            if (generalWs) generalWs.close()
        }
    }, [user, token, roomCode])

    // Set UI ready after component mounts and initial data loads
    useEffect(() => {
        if (!loading && room) {
            // Additional delay to ensure all UI elements are rendered
            const timer = setTimeout(() => {
                setUiReady(true)
                log("✅ UI is ready for WebSocket connection")
                
                // Fallback: Connect WebSocket if not already connected
                if (!ws && !isConnecting) {
                    log("🔄 Fallback: Connecting WebSocket after UI ready...")
                    connectWebSocket(room)
                }
            }, 1000)
            
            return () => clearTimeout(timer)
        }
    }, [loading, room])

    // Handle page unload/navigation away
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (room) {
                event.preventDefault()
                event.returnValue = 'You are currently in a multiplayer room. Are you sure you want to leave?'
                return 'You are currently in a multiplayer room. Are you sure you want to leave?'
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [room])

    const refreshCurrentRoom = async () => {
        if (!token) return

        try {
            log(`🔄 Refreshing current room...`)
            const response = await fetch(`${baseUrl}/api/v1/protected/pk/rooms/active`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.ok) {
                const data = await response.json()
                if (data.data) {
                    setRoom(data.data)
                    updateActiveRoom(data.data)
                    log(`✅ Room loaded: ${data.data.room_name} (${data.data.room_code})`)
                    
                    // Sync ready status when loading room
                    const myParticipant = data.data.participants?.find((p: any) => p.user.id === user?.id)
                    if (myParticipant) {
                        setIsReady(myParticipant.is_ready)
                    }

                    // Connect to room WebSocket if not already connected and UI is ready
                    if (!ws && !isConnecting && uiReady) {
                        log("🔄 Connecting to room WebSocket after UI is ready...")
                        connectWebSocket(data.data)
                    } else if (!ws && !isConnecting && !uiReady) {
                        log("⏳ Waiting for UI to be ready before connecting WebSocket...")
                    }

                    // Load lessons for the category
                    if (data.data.category_id) {
                        loadLessonsForCategory(data.data.category_id)
                    }

                    // Set initial lesson selection if room has a lesson
                    if (data.data.lesson && data.data.lesson.id) {
                        // We'll set the selectedLesson after lessons are loaded
                        // This will be handled in the loadLessonsForCategory callback
                    } else {
                        setSelectedLesson(null)
                    }
                } else {
                    log("❌ No active room found")
                    updateActiveRoom(null)
                    navigate("/dashboard/multiplayer")
                }
            } else if (response.status === 404) {
                log("❌ Room not found")
                updateActiveRoom(null)
                navigate("/dashboard/multiplayer")
            }
        } catch (error: any) {
            log(`❌ Error refreshing current room: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const loadLessonsForCategory = async (categoryId: number) => {
        try {
            log(`📚 Loading lessons for category ${categoryId}...`)
            const response = await fetch(`${baseUrl}/api/v1/categories/${categoryId}/lessons`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            if (response.ok) {
                const data = await response.json()
                if (data.success && data.data) {
                    setAvailableLessons(data.data)
                    log(`✅ Loaded ${data.data.length} lessons`)

                    // Set initial lesson selection if room has a lesson
                    if (room?.lesson && room.lesson.id) {
                        const initialLesson = data.data.find((l: any) => l.id === room.lesson.id)
                        if (initialLesson) {
                            setSelectedLesson(initialLesson)
                            log(`📚 Initial lesson set: ${initialLesson.lesson_name}`)
                        } else {
                            // Use lesson data from room if not found in available lessons
                            setSelectedLesson(room.lesson)
                            log(`📚 Initial lesson set from room data: ${room.lesson.lesson_name}`)
                        }
                    }
                } else {
                    setAvailableLessons([])
                    log(`⚠️ No lessons found for category ${categoryId}`)
                }
            } else {
                log(`❌ Failed to load lessons: ${response.status}`)
                setAvailableLessons([])
            }
        } catch (error: any) {
            log(`❌ Error loading lessons: ${error.message}`)
            setAvailableLessons([])
        }
    }

    // General WebSocket functionality
    const connectGeneralWebSocket = () => {
        if (!token) return

        if (generalWs) {
            generalWs.close()
        }

        const wsUrl = baseUrl.replace("http", "ws")
        const newGeneralWs = new WebSocket(`${wsUrl}/api/v1/protected/pk/ws?token=${encodeURIComponent(token)}`)

        newGeneralWs.onopen = () => {
            log("🔌 General WebSocket connected")
        }

        newGeneralWs.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data)
                log(`📥 General WS: ${message.type} - ${JSON.stringify(message.data)}`)
            } catch (error) {
                log(`📥 General WS Raw: ${event.data}`)
            }
        }

        newGeneralWs.onclose = () => {
            log("❌ General WebSocket disconnected")
            // Only attempt to reconnect if component is still mounted and should reconnect
            if (shouldReconnect) {
                setTimeout(() => {
                    if (shouldReconnect) {
                        connectGeneralWebSocket()
                    }
                }, 3000)
            }
        }

        newGeneralWs.onerror = (error) => {
            log(`🚨 General WebSocket error: ${error}`)
        }

        setGeneralWs(newGeneralWs)
    }

    // Room WebSocket functionality
    const connectWebSocket = (roomData?: any) => {
        const roomToUse = roomData || room
        if (!roomToUse || !token) {
            log("❌ No active room to connect WebSocket")
            return
        }

        // Clear any pending connection attempt
        if (connectionAttemptRef.current) {
            clearTimeout(connectionAttemptRef.current)
            connectionAttemptRef.current = null
        }

        if (isConnecting) {
            log("⏳ Already connecting to WebSocket, skipping...")
            return
        }

        if (ws && ws.readyState === WebSocket.OPEN) {
            log("✅ WebSocket already connected, skipping...")
            return
        }

        // Additional check to prevent rapid reconnection attempts
        if (ws && ws.readyState === WebSocket.CONNECTING) {
            log("⏳ WebSocket is already in connecting state, skipping...")
            return
        }

        // Debounce connection attempts to prevent spam
        connectionAttemptRef.current = setTimeout(() => {
            setIsConnecting(true)
            log("🔄 Starting WebSocket connection...")
            
            if (ws) {
                ws.close()
            }

            const wsUrl = baseUrl.replace("http", "ws")
            const newWs = new WebSocket(`${wsUrl}/api/v1/protected/pk/ws?room_id=${roomToUse.id}&token=${encodeURIComponent(token)}`)

            newWs.onopen = () => {
                setWsStatus("✅ Connected")
                setIsConnecting(false)
                connectionAttemptRef.current = null
                log("🔌 Room WebSocket connected and authenticated")
            }

            newWs.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data)
                    log(`📥 Room WS: ${message.type} - ${JSON.stringify(message.data)}`)

                    if (message.type === "room_update") {
                        // Update room directly from WebSocket data
                        if (message.data && message.data.room) {
                            setRoom(message.data.room)
                            
                            // Check if game is playing based on room status
                            if (message.data.room.room_status === "playing") {
                                log(`🎮 Room status is 'playing', setting gameStarted=true`)
                                setGameStarted(true)
                                setGameFinished(false)
                            } else if (message.data.room.room_status === "finished") {
                                log(`🏁 Room status is 'finished', setting gameFinished=true`)
                                setGameFinished(true)
                            }
                            
                            // Sync ready status when room updates
                            const myParticipant = message.data.room.participants?.find((p: any) => p.user.id === user?.id)
                            if (myParticipant) {
                                setIsReady(myParticipant.is_ready)
                            }

                            // Sync lesson selection when room updates
                            if (message.data.room.lesson && message.data.room.lesson.id) {
                                // Find the lesson in available lessons
                                const updatedLesson = availableLessons.find(l => l.id === message.data.room.lesson.id)
                                if (updatedLesson) {
                                    setSelectedLesson(updatedLesson)
                                    log(`📚 Lesson updated: ${updatedLesson.lesson_name}`)
                                } else {
                                    // If lesson not in available lessons, use the lesson data from room update
                                    setSelectedLesson(message.data.room.lesson)
                                    log(`📚 Lesson updated: ${message.data.room.lesson.lesson_name}`)
                                }
                            } else if (message.data.room.lesson_id === null) {
                                // Lesson was cleared
                                setSelectedLesson(null)
                                log(`📚 Lesson selection cleared`)
                            }
                        }
                    } else if (message.type === "leave_room_response") {
                        if (message.data.success) {
                            log(`✅ ${message.data.message}`)
                            updateActiveRoom(null)
                            navigate("/dashboard/multiplayer")
                        } else {
                            log(`❌ Failed to leave room: ${message.data.error}`)
                        }
                    } else if (message.type === "player_joined") {
                        log(`👤 Player joined: ${message.data.participant.user.full_name || message.data.participant.user.email}`)
                    } else if (message.type === "player_left") {
                        log(`👋 Player left (ID: ${message.data.user_id})`)
                    } else if (message.type === "room_deleted") {
                        log(`🗑️ Room deleted: ${message.data.message}`)
                        updateActiveRoom(null)
                        disconnectWebSocket()
                        navigate("/dashboard/multiplayer")
                    } else if (message.type === "player_kicked") {
                        if (message.data.user_id === user?.id) {
                            log(`👢 You have been kicked from the room`)
                            updateActiveRoom(null)
                            disconnectWebSocket()
                            navigate("/dashboard/multiplayer", {
                                state: { message: "You have been kicked from the room" }
                            })
                        } else {
                            // Find the kicked player's name
                            const kickedPlayer = room?.participants?.find((p: any) => p.user.id === message.data.user_id)
                            const kickedPlayerName = kickedPlayer?.user.full_name || kickedPlayer?.user.email || `User ${message.data.user_id}`
                            log(`👢 ${kickedPlayerName} was kicked from the room`)

                            // Show notification to other players
                            const notification = document.createElement('div')
                            notification.className = 'fixed top-4 right-4 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg border-l-4 border-orange-700 z-50'
                            notification.innerHTML = `
                                <div class="flex items-center">
                                    <span class="mr-2">👢</span>
                                    ${kickedPlayerName} was kicked from the room
                                    <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white hover:text-orange-200 font-bold">×</button>
                                </div>
                            `
                            document.body.appendChild(notification)

                            // Auto-remove notification after 5 seconds
                            setTimeout(() => {
                                if (notification.parentNode) {
                                    notification.remove()
                                }
                            }, 5000)
                        }
                    } else if (message.type === "start_game" || message.type === "game_start") {
                        log(`🎮 Game started!`)
                        setGameStarted(true)
                        setGameFinished(false)

                        // Initialize scores for all players
                        if (room?.participants) {
                            const initialScores: {[playerId: string]: number} = {}
                            room.participants.forEach((p: any) => {
                                initialScores[p.user.id] = p.current_score || p.score || 0
                            })
                            setCurrentScores(initialScores)
                            log(`🏆 Initial scores set: ${JSON.stringify(initialScores)}`)
                        }

                        // Set game settings
                        if (message.data?.settings) {
                            setGameSettings(message.data.settings)
                        }
                        
                        // Check for time settings from backend
                        if (message.data?.settings?.time_limit_seconds) {
                            log(`⏰ Backend sent time_limit_seconds: ${message.data.settings.time_limit_seconds}`)
                        }
                        
                        // Load lesson data from game_start if available
                        if (message.type === "game_start" && message.data?.lesson) {
                            const lessonFromWS = message.data.lesson
                            const challengesFromWS = message.data.challenges
                            
                            if (lessonFromWS && lessonFromWS.id) {
                                // Store complete game lesson data with challenges
                                const completeGameLesson = {
                                    ...lessonFromWS,
                                    challenges: challengesFromWS || []
                                }
                                setGameLesson(completeGameLesson)
                                
                                // Find lesson in available lessons or use the one from WebSocket
                                const foundLesson = availableLessons.find(l => l.id === lessonFromWS.id)
                                if (foundLesson) {
                                    setSelectedLesson(foundLesson)
                                } else {
                                    setSelectedLesson(lessonFromWS)
                                }
                                log(`📚 Game lesson set: ${lessonFromWS.lesson_name} with ${challengesFromWS?.length || 0} challenges`)
                                log(`🎯 Game state: gameStarted=true, gameFinished=false, gameLesson=${!!completeGameLesson}`)
                            }
                        } else {
                            log(`⚠️ No lesson data in game_start event`)
                        }
                    } else if (message.type === "challenge_submission") {
                        log(`📝 Challenge submission: ${JSON.stringify(message.data)}`)
                        // Handle challenge submission - this is the cumulative score
                        if (message.data && message.data.player_id && message.data.score !== undefined) {
                            setCurrentScores(prev => {
                                const newScores = {
                                    ...prev,
                                    [message.data.player_id]: message.data.score
                                }
                                log(`🎯 Score updated via challenge_submission: ${JSON.stringify(newScores)}`)
                                return newScores
                            })
                        }
                    } else if (message.type === "WSScoreUpdate") {
                        log(`🏆 Score update: ${JSON.stringify(message.data)}`)
                        if (message.data && message.data.scores) {
                            setCurrentScores(message.data.scores)
                            log(`🎯 Scores updated via WSScoreUpdate: ${JSON.stringify(message.data.scores)}`)
                        }
                    } else if (message.type === "WSChallengeSubmission") {
                        log(`📝 WS Challenge submission: ${JSON.stringify(message.data)}`)
                        // Handle WebSocket challenge submission - this is the cumulative score
                        if (message.data && message.data.player_id && message.data.score !== undefined) {
                            setCurrentScores(prev => {
                                const newScores = {
                                    ...prev,
                                    [message.data.player_id]: message.data.score
                                }
                                log(`🎯 Score updated via WSChallengeSubmission: ${JSON.stringify(newScores)}`)
                                return newScores
                            })
                        }
                    } else if (message.type === "score_update") {
                        log(`🏆 Real-time score update: ${JSON.stringify(message.data)}`)
                        
                        // Handle new format with participants array
                        if (message.data && message.data.participants && Array.isArray(message.data.participants)) {
                            // Update room participants data
                            setRoom((prev: any) => {
                                if (!prev) return prev
                                return { ...prev, participants: message.data.participants }
                            })
                            
                            // Extract scores from participants and update currentScores
                            const newScores: {[key: string]: number} = {}
                            message.data.participants.forEach((participant: any) => {
                                if (participant.user && participant.user.id) {
                                    newScores[participant.user.id] = participant.current_score || 0
                                }
                            })
                            
                            setCurrentScores(newScores)
                            log(`🎯 Scores updated via participants array: ${JSON.stringify(newScores)}`)
                        }
                        // Handle legacy formats
                        else if (message.data && message.data.player_id && message.data.score !== undefined) {
                            setCurrentScores(prev => {
                                const newScores = {
                                    ...prev,
                                    [message.data.player_id]: message.data.score
                                }
                                log(`🎯 Score updated for player ${message.data.player_id} (${message.data.username}): ${message.data.score}`)
                                return newScores
                            })
                        } else if (message.data && message.data.scores) {
                            // Fallback cho format khác
                            setCurrentScores(message.data.scores)
                            log(`🎯 Scores updated via score_update (bulk): ${JSON.stringify(message.data.scores)}`)
                        }
                    } else if (message.type === "player_ready") {
                        log(`✅ Player ready: ${JSON.stringify(message.data)}`)
                        // Update player's ready status
                        if (message.data && message.data.user_id) {
                            setRoom((prev: any) => {
                                if (!prev) return prev
                                const updatedParticipants = prev.participants?.map((p: any) =>
                                    p.user.id === message.data.user_id
                                        ? { ...p, is_ready: message.data.is_ready }
                                        : p
                                )
                                return { ...prev, participants: updatedParticipants }
                            })
                        }
                    } else if (message.type === "update_settings") {
                        log(`⚙️ Settings update: ${JSON.stringify(message.data)}`)
                        // Handle settings update
                        if (message.data && message.data.lesson_id) {
                            // Lesson selection update
                            if (message.data.lesson_id === null) {
                                setSelectedLesson(null)
                            } else {
                                // Find lesson in available lessons
                                const updatedLesson = availableLessons.find(l => l.id === message.data.lesson_id)
                                if (updatedLesson) {
                                    setSelectedLesson(updatedLesson)
                                }
                            }
                        }
                    } else if (message.type === "finish_game") {
                        log(`🏁 Game finished!`)
                        setGameFinished(true)
                        // Update final scores if provided
                        if (message.data && message.data.final_scores) {
                            setCurrentScores(message.data.final_scores)
                        }
                    }
                } catch (error) {
                    log(`📥 Room WS Raw: ${event.data}`)
                }
            }

            newWs.onclose = (event) => {
                setWsStatus("❌ Disconnected")
                setIsConnecting(false)
                connectionAttemptRef.current = null
                log(`❌ Room WebSocket disconnected (code: ${event.code}, reason: ${event.reason})`)
                
                // Auto-reconnect if not intentionally disconnected and component is still mounted
                if (shouldReconnect && event.code !== 1000) {
                    log("🔄 Auto-reconnecting room WebSocket in 3 seconds...")
                    setTimeout(() => {
                        if (shouldReconnect && room) {
                            connectWebSocket()
                        }
                    }, 3000)
                }
            }

            newWs.onerror = (error) => {
                setIsConnecting(false)
                connectionAttemptRef.current = null
                setWsStatus("❌ Connection Error")
                log(`🚨 Room WebSocket error: ${error}`)
            }

            setWs(newWs)
        }, 500) // 500ms debounce delay
    }

    const disconnectWebSocket = () => {
        if (ws) {
            ws.close()
            setWs(null)
        }
        setIsConnecting(false)
    }

    const toggleReady = () => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            log("❌ WebSocket not connected")
            return
        }

        // Simple rate limiting: Prevent spam clicking (max 1 per 300ms)
        const now = Date.now()
        if (now - lastReadyToggle.current < 300) {
            log("⏳ Please wait before toggling ready status again")
            return
        }
        lastReadyToggle.current = now

        const newReadyStatus = !isReady
        setIsReady(newReadyStatus)
        
        ws.send(JSON.stringify({
            type: "ready_status",
            data: { is_ready: newReadyStatus }
        }))
        log(`🎯 Set ready status: ${newReadyStatus}`)
    }

    const startGame = () => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            log("❌ WebSocket not connected")
            return
        }

        // Basic frontend validation to avoid backend "room is not ready" errors
        if (!room) {
            log("❌ No room data available")
            alert('Room data not loaded yet. Please try again.')
            return
        }

        // Ensure a lesson is selected (backend expects lesson_id)
        const lessonSelected = !!(selectedLesson || room.lesson || room.lesson_id)
        if (!lessonSelected) {
            log("❌ Cannot start: no lesson selected")
            alert('Please select a lesson first!')
            return
        }

        // Must have at least 2 participants
        if (!room.participants || room.participants.length < 2) {
            log("❌ Cannot start: not enough players")
            alert('Need at least 2 players to start the game.')
            return
        }

        // All participants must be ready (backend requires full readiness)
        const allReady = room.participants.every((p: any) => p.is_ready)
        if (!allReady) {
            log("❌ Cannot start: not all players are ready")
            alert('Not all players are ready yet.')
            return
        }

        // Room must be in 'ready' status according to backend checks
        if (room.room_status && room.room_status !== 'ready') {
            log(`❌ Cannot start: room status is '${room.room_status}'`)
            alert('Room is not ready to start the game.')
            return
        }

        ws.send(JSON.stringify({
            type: "start_game",
            data: {}
        }))
        log("🎮 Starting game...")
        // Game will start when WebSocket broadcasts start_game event to all players
    }

    // Handle score changes from DictationLessonForPK (chỉ để debug, không update state để tránh loop)
    const handleScoreChange = (scores: Array<{ id: string; name: string; score: number }>) => {
        log(`🏆 Scores updated from child: ${JSON.stringify(scores)}`)
        // Không update currentScores ở đây để tránh loop
        // currentScores sẽ được update từ WebSocket events
    }

    // Handle answer submission from DictationLessonForPK
    const handleSubmitAnswer = (_roomId: string, data: {
        playerId: string;
        sentenceIndex: number;
        answer: string;
        score: number;
        isCorrect: boolean;
        timeSpent: number;
    }) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            log("❌ WebSocket not connected")
            return
        }

        // Không update local score ở đây, để WebSocket handle để đồng bộ với tất cả clients

        // Get challenge_id from game lesson data (from game_start event)
        const currentChallenge = gameLesson?.challenges?.[data.sentenceIndex]
        const challengeId = currentChallenge?.id

        if (!challengeId) {
            log(`❌ Cannot find challenge ID for sentence index ${data.sentenceIndex}`)
            log(`Available challenges: ${JSON.stringify(gameLesson?.challenges)}`)
            return
        }

        log(`📋 Using challenge ID: ${challengeId} for sentence index: ${data.sentenceIndex}`)

        ws.send(JSON.stringify({
            type: "challenge_submission",
            data: {
                challenge_id: challengeId,
                user_input: data.answer,
                is_correct: data.isCorrect,
                score_earned: data.score, // Points earned for this specific answer
                time_taken_seconds: data.timeSpent
            }
        }))

        log(`📝 Submitted answer for player ${data.playerId}: ${data.isCorrect ? 'Correct' : 'Incorrect'} (+${data.score} points)`)
    }

    const showLeaveConfirmation = () => {
        setShowLeaveConfirm(true)
    }

    const confirmLeaveRoom = async () => {
        if (!room || !token) return

        try {
            // First, send leave room message via WebSocket to notify other players immediately
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: "leave_room",
                    data: { room_id: room.id }
                }))
                log(`🔄 Sent WebSocket leave room message: ${room.room_name}`)
            }

            // Then call the API endpoint to leave the room
            const response = await fetch(`${baseUrl}/api/v1/protected/pk/rooms/${room.id}/leave`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })

            const result = await response.json()
            
            if (response.ok && result.success) {
                log(`✅ Successfully left room: ${room.room_name}`)
                setShowLeaveConfirm(false)
                // Clear room state immediately
                setRoom(null)
                updateActiveRoom(null)
                // Disconnect WebSockets
                disconnectWebSocket()
                if (generalWs) {
                    generalWs.close()
                    setGeneralWs(null)
                }
                navigate("/dashboard/multiplayer")
            } else {
                log(`❌ Failed to leave room via API: ${result.error || result.message}`)
                // Even if API fails, we've already sent WebSocket message, so proceed
                setShowLeaveConfirm(false)
                setRoom(null)
                updateActiveRoom(null)
                disconnectWebSocket()
                if (generalWs) {
                    generalWs.close()
                    setGeneralWs(null)
                }
                navigate("/dashboard/multiplayer")
            }
        } catch (error: any) {
            log(`❌ Error leaving room: ${error.message}`)
            // Even if there's an error, clear the room state and navigate
            setShowLeaveConfirm(false)
            setRoom(null)
            updateActiveRoom(null)
            disconnectWebSocket()
            if (generalWs) {
                generalWs.close()
                setGeneralWs(null)
            }
            navigate("/dashboard/multiplayer")
        }
    }

    const cancelLeaveRoom = () => {
        setShowLeaveConfirm(false)
    }

    const copyRoomCode = () => {
        if (roomCode) {
            navigator.clipboard.writeText(roomCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }



    const handleSelectLesson = (lessonId: string) => {
        if (!isHost || !room || !ws || ws.readyState !== WebSocket.OPEN) return
        
        const lesson = availableLessons.find(l => l.id === parseInt(lessonId))
        if (lesson) {
            setSelectedLesson(lesson)
            
            // Broadcast lesson selection via WebSocket
            ws.send(JSON.stringify({
                type: "update_settings",
                data: {
                    lesson_id: lesson.id
                }
            }))
            
            log(`📚 Selected lesson: ${lesson.lesson_name}`)
        }
    }

    const handleRandomLesson = () => {
        if (!isHost || availableLessons.length === 0) return
        
        const randomIndex = Math.floor(Math.random() * availableLessons.length)
        const lesson = availableLessons[randomIndex]
        handleSelectLesson(lesson.id.toString())
    }

    const handleKickPlayer = (targetUserId: string) => {
        if (!isHost || !room || !ws || ws.readyState !== WebSocket.OPEN) return
        
        const targetParticipant = room.participants?.find((p: any) => p.user.id === parseInt(targetUserId))
        const playerName = targetParticipant?.user.full_name || targetParticipant?.user.email || `User ${targetUserId}`
        
        ws.send(JSON.stringify({
            type: "kick_player",
            data: { 
                user_id: parseInt(targetUserId),
                room_id: room.id
            }
        }))
        log(`👢 Kicking player: ${playerName}`)
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Multiplayer Room</h1>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700">❌ Please login first to access this room</p>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading room...</p>
                </div>
            </div>
        )
    }

    if (!room) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-semibold text-slate-800">
                    Room not found or you don't have access to this room.
                </h2>
                <button
                    onClick={() => navigate("/dashboard/multiplayer")}
                    className="mt-4 text-blue-600 hover:text-blue-700"
                >
                    Back to Lobby
                </button>
            </div>
        )
    }

    const isHost = user?.id === room?.host_user_id
    const hostPlayer = room?.participants?.find((p: any) => p.user.id === room?.host_user_id)
    const hostName = hostPlayer?.user.full_name || hostPlayer?.user.email || "Unknown Host"

    // Game started view - Show DictationLessonForPK
    console.log(`[MultiplayerRoom] Render check: gameStarted=${gameStarted}, gameFinished=${gameFinished}, gameLesson=${!!gameLesson}, room=${!!room}`);
    
    if (gameStarted && !gameFinished) {
        console.log(`[MultiplayerRoom] Rendering DictationLessonForPK with gameLesson:`, gameLesson);
        
        // Prepare players data for DictationLessonForPK
        const playersData = room?.participants?.map((p: any) => {
            const scoreFromCurrentScores = currentScores[p.user.id]
            const scoreFromParticipant = p.current_score || p.score || 0
            const finalScore = scoreFromCurrentScores !== undefined ? scoreFromCurrentScores : scoreFromParticipant
            
            console.log(`[MultiplayerRoom] Player ${p.user.full_name || p.user.email}:`, {
                userId: p.user.id,
                scoreFromCurrentScores,
                scoreFromParticipant,
                finalScore
            })
            
            return {
                id: p.user.id.toString(),
                name: p.user.full_name || p.user.email || "Unknown",
                avatar: p.user.avatar || p.user.full_name?.charAt(0) || p.user.email?.charAt(0) || "",
                score: finalScore
            }
        }) || []

        console.log(`[MultiplayerRoom] Current scores state:`, currentScores);
        console.log(`[MultiplayerRoom] Room participants:`, room?.participants?.map((p: any) => ({id: p.user.id, current_score: p.current_score, name: p.user.full_name})));
        console.log(`[MultiplayerRoom] Final players data for DictationLessonForPK:`, playersData);
        console.log(`[MultiplayerRoom] Room time_limit_seconds:`, room?.time_limit_seconds);
        console.log(`[MultiplayerRoom] Calculated timeLimit:`, room?.time_limit_seconds || 600);

        const currentUserData = room?.participants?.find((p: any) => p.user.id === user?.id)

        return (
            <DictationLessonForPK
                players={playersData}
                onScoreChange={handleScoreChange}
                lessonId={selectedLesson?.id?.toString()}
                lessonData={gameLesson || selectedLesson} // Pass lesson data from WebSocket or fallback to selectedLesson
                timeLimit={room?.time_limit_seconds || 600} // Use seconds directly, default 10 minutes
                submitAnswer={handleSubmitAnswer}
                roomId={room?.id?.toString()}
                currentUser={currentUserData ? {
                    id: currentUserData.user.id.toString(),
                    name: currentUserData.user.full_name || currentUserData.user.email || "Unknown"
                } : undefined}
                gameFinished={gameFinished}
            />
        )
    }

    // Room lobby view
    const nonHostPlayers = room.participants?.filter((p: any) => !p.is_host) || []
    const allNonHostReady = nonHostPlayers.length > 0 && nonHostPlayers.every((p: any) => p.is_ready)
    const canStartGame = isHost && selectedLesson && room.participants?.length >= 2 && allNonHostReady

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={showLeaveConfirmation}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            {room.room_name}
                        </h1>
                        <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-2 text-slate-600">
                                <Crown className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm">Host: {hostName}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-slate-600">Room Code:</span>
                                <button
                                    onClick={copyRoomCode}
                                    className="flex items-center space-x-1 px-2 py-1 bg-slate-100 rounded text-sm font-mono hover:bg-slate-200 transition-colors"
                                >
                                    <span>{roomCode}</span>
                                    {copied ? (
                                        <Check className="w-3 h-3 text-green-500" />
                                    ) : (
                                        <Copy className="w-3 h-3" />
                                    )}
                                </button>
                            </div>
                            <div className="text-sm text-slate-600">
                                Status: {wsStatus}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Players Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-slate-800">
                                Players ({room.current_players}/{room.max_players})
                            </h3>
                            <Users className="w-5 h-5 text-slate-600" />
                        </div>

                        <div className="space-y-4">
                            {room.participants?.map((participant: any, index: number) => (
                                <div
                                    key={`${participant.user.id}-${index}`}
                                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">
                                                {participant.user.full_name?.charAt(0) || participant.user.email.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-slate-800">
                                                    {participant.user.full_name || participant.user.email}
                                                </span>
                                                {participant.is_host && (
                                                    <Crown className="w-4 h-4 text-yellow-500" />
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-500">
                                                Online
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div
                                            className={`w-3 h-3 rounded-full ${
                                                participant.is_ready ? "bg-green-500" : "bg-gray-300"
                                            }`}
                                        ></div>
                                        {isHost && !participant.is_host && (
                                            <button
                                                onClick={() => handleKickPlayer(participant.user.id.toString())}
                                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                title={`Kick ${participant.user.full_name || participant.user.email}`}
                                            >
                                                <UserX className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Room Settings */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-slate-800">
                                Room Settings
                            </h3>

                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-slate-50 rounded-lg">
                                <Clock className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                                <div className="font-semibold text-slate-800">
                                    {room?.time_limit_seconds ? `${Math.floor(room.time_limit_seconds / 60)}min` : '10min'}
                                </div>
                                <div className="text-xs text-slate-500">Duration</div>
                            </div>
                            
                            <div className="text-center p-4 bg-slate-50 rounded-lg">
                                <Trophy className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                                <div className="font-semibold text-slate-800">Dictation</div>
                                <div className="text-xs text-slate-500">Mode</div>
                            </div>
                            
                            <div className="text-center p-4 bg-slate-50 rounded-lg">
                                <Zap className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                                <div className="font-semibold text-slate-800">Real-time</div>
                                <div className="text-xs text-slate-500">Scoring</div>
                            </div>
                            
                            <div className="text-center p-4 bg-slate-50 rounded-lg">
                                <Users className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                                <div className="font-semibold text-slate-800">Host</div>
                                <div className="text-xs text-slate-500">Selection</div>
                            </div>
                        </div>
                    </div>

                    {/* Lesson Selection */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-slate-800">
                                Lesson Selection
                            </h3>
                            {isHost && (
                                <button
                                    onClick={handleRandomLesson}
                                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    <Shuffle className="w-4 h-4" />
                                    <span>Random Lesson</span>
                                </button>
                            )}
                        </div>

                        {selectedLesson ? (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-green-800">{selectedLesson.lesson_name}</h4>
                                        <p className="text-sm text-green-600">{selectedLesson.video_title || selectedLesson.lesson_name}</p>
                                        <div className="flex items-center space-x-4 mt-2 text-xs text-green-600">
                                            <span>Level: {selectedLesson.vocab_level || "Intermediate"}</span>
                                            <span>Duration: {selectedLesson.duration || "5"}min</span>
                                        </div>
                                    </div>
                                    {isHost && (
                                        <button
                                            onClick={() => {
                                                setSelectedLesson(null)
                                                // Notify other players that lesson was cleared
                                                if (ws && ws.readyState === WebSocket.OPEN) {
                                                    ws.send(JSON.stringify({
                                                        type: "update_settings",
                                                        data: {
                                                            lesson_id: null
                                                        }
                                                    }))
                                                    log(`📚 Lesson selection cleared`)
                                                }
                                            }}
                                            className="text-green-600 hover:text-green-800 text-sm border border-green-300 rounded px-3 py-1 ml-4"
                                        >
                                            Change
                                        </button>
                                    )}
                                </div>
                                
                                {/* Ready button for non-host players */}
                                {!isHost && (
                                    <div className="text-center mt-4">
                                        <button
                                            onClick={toggleReady}
                                            className={`px-6 py-2 rounded-lg font-bold text-white transition-colors ${
                                                isReady
                                                    ? "bg-red-500 hover:bg-red-600"
                                                    : "bg-green-600 hover:bg-green-700"
                                            }`}
                                        >
                                            {isReady ? "Cancel Ready" : "Ready"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                {isHost ? (
                                    <div>
                                        <p className="mb-4">Select a lesson to start the game</p>
                                        {availableLessons.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                                                {availableLessons.map(lesson => (
                                                    <button
                                                        key={lesson.id}
                                                        onClick={() => handleSelectLesson(lesson.id.toString())}
                                                        className="p-3 text-left border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                                    >
                                                        <div className="font-medium text-slate-800">{lesson.lesson_name}</div>
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {lesson.vocab_level || "Intermediate"} • {lesson.duration || "5"}min
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p>Waiting for host to select a lesson...</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Start Game */}
                    {isHost && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                                    Ready to Start?
                                </h3>
                                <div className="mb-6">
                                    {!selectedLesson && (
                                        <p className="text-sm text-amber-600 mb-2">
                                            Please select a lesson first
                                        </p>
                                    )}
                                    {room.current_players < 2 && (
                                        <p className="text-sm text-amber-600 mb-2">
                                            Need at least 2 players to start
                                        </p>
                                    )}
                                    {room.current_players >= 2 && !allNonHostReady && (
                                        <p className="text-sm text-amber-600 mb-2">
                                            All players must be ready to start
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={startGame}
                                    disabled={!canStartGame}
                                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-3 mx-auto"
                                >
                                    <Play className="w-6 h-6" />
                                    <span>Start Game</span>
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Non-host ready status section */}
                    {!isHost && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                                    Player Status
                                </h3>
                                {selectedLesson ? (
                                    <div>
                                        {isReady ? (
                                            <div>
                                                <p className="text-green-600 font-semibold mb-4">✅ You are ready!</p>
                                                {!allNonHostReady && (
                                                    <p className="text-amber-600 mb-4">Waiting for other players to be ready...</p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-slate-600 mb-4">Click ready when you're prepared to start</p>
                                        )}
                                        <button
                                            onClick={toggleReady}
                                            className={`px-6 py-3 rounded-lg font-bold text-white transition-colors ${
                                                isReady
                                                    ? "bg-red-500 hover:bg-red-600"
                                                    : "bg-green-600 hover:bg-green-700"
                                            }`}
                                        >
                                            {isReady ? "Cancel Ready" : "Ready"}
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-slate-600 mb-4">Waiting for host to select a lesson...</p>
                                        <div className={`px-4 py-2 rounded-lg font-medium ${
                                            isReady ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                                        }`}>
                                            Status: {isReady ? "Ready" : "Not Ready"}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Leave Room Confirmation Modal */}
            {showLeaveConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ArrowLeft className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                Leave Room?
                            </h3>
                            <p className="text-slate-600 mb-6">
                                Are you sure you want to leave "{room?.room_name}"? 
                                {isHost && " As the host, leaving will close the room for all players."}
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={cancelLeaveRoom}
                                    className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                                >
                                    Stay in Room
                                </button>
                                <button
                                    onClick={confirmLeaveRoom}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                                >
                                    Leave Room
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Debug Log (only in development) */}
            {process.env.NODE_ENV === 'development' && logs.length > 0 && (
                <div className="mt-8 bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
                    {logs.slice(-20).map((log, index) => (
                        <div key={index}>{log}</div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MultiplayerRoom