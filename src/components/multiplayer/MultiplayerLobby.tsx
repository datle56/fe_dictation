import React, { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
    Plus,
    Users,
    Play,
    Crown,
    Clock,
    Zap,
    Copy,
    Check,
} from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useMultiplayer } from "../../contexts/MultiplayerContext"
import { api } from "../../utils/api"

const MultiplayerLobby: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, getValidAccessToken } = useAuth()
    const { updateActiveRoom } = useMultiplayer()
    const [showCreateRoom, setShowCreateRoom] = useState(false)
    const [showJoinRoom, setShowJoinRoom] = useState(false)
    const [rooms, setRooms] = useState<any[]>([])
    const [joinCode, setJoinCode] = useState("")
    const [newRoomName, setNewRoomName] = useState("")
    const [copied, setCopied] = useState(false)
    const [categories, setCategories] = useState<any[]>([])
    const [selectedCategory, setSelectedCategory] = useState<any>(null)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)
    const [token, setToken] = useState<string | null>(null)
    const [baseUrl] = useState("http://localhost:8080")
    const [generalWs, setGeneralWs] = useState<WebSocket | null>(null)
    const [isWsConnected, setIsWsConnected] = useState(false)
    const [logs, setLogs] = useState<string[]>([])
    const [kickedMessage, setKickedMessage] = useState<string>("")
    const [joiningRoom, setJoiningRoom] = useState<string | null>(null)
    const [uiLoaded, setUiLoaded] = useState(false)

    const log = (message: string) => {
        const timestamp = new Date().toLocaleTimeString()
        setLogs(prev => [...prev, `[${timestamp}] ${message}`])
        console.log(`[${timestamp}] ${message}`)
    }

    // Check for kicked message from navigation state
    useEffect(() => {
        if (location.state?.message) {
            setKickedMessage(location.state.message)
            // Clear the state to prevent showing message again on refresh
            window.history.replaceState({}, document.title)
            // Auto-hide after 5 seconds
            setTimeout(() => setKickedMessage(""), 5000)
        }
    }, [location.state])

    // Initialize component
    useEffect(() => {
        const initialize = async () => {
            if (!user) return

            try {
                setLoading(true)

                // Get token
                const accessToken = await getValidAccessToken()
                setToken(accessToken)

                // Check if user is already in an active room
                log("🔄 Checking for active room...")
                const activeRoomResponse = await fetch(`${baseUrl}/api/v1/protected/pk/rooms/active`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                })

                if (activeRoomResponse.ok) {
                    const activeRoomData = await activeRoomResponse.json()
                    if (activeRoomData.data) {
                        log(`✅ Found active room: ${activeRoomData.data.room_name} (${activeRoomData.data.room_code})`)
                        updateActiveRoom(activeRoomData.data)
                        // Disconnect lobby WebSocket before navigating to room
                        disconnectGeneralWebSocket()
                        navigate(`/dashboard/multiplayer/room/${activeRoomData.data.room_code}`)
                        return
                    }
                }

                // Load categories
                log("📚 Loading dictation categories...")
                const categoriesResponse = await api.getCategoriesBySkill("4")
                if (categoriesResponse.success && categoriesResponse.data) {
                    setCategories(categoriesResponse.data)
                    log(`✅ Loaded ${categoriesResponse.data.length} categories`)
                } else {
                    setCategories([])
                }

                // Load initial rooms first
                await refreshPublicRooms()
                
                // Mark UI as loaded and connect WebSocket
                setUiLoaded(true)
                setTimeout(() => {
                    log("🔄 Connecting to WebSocket after UI loaded...")
                    connectGeneralWebSocket()
                }, 1000)

            } catch (error: any) {
                log(`❌ Error initializing: ${error.message}`)
                setCategories([])
                setRooms([])
            } finally {
                setLoading(false)
            }
        }

        initialize()

        // Cleanup on unmount
        return () => {
            disconnectGeneralWebSocket()
            setJoiningRoom(null)
            setUiLoaded(false)
        }
    }, [user, getValidAccessToken, baseUrl, updateActiveRoom, navigate])

    // Connect WebSocket when UI is loaded
    useEffect(() => {
        if (uiLoaded && token && !generalWs) {
            log("🔄 UI loaded, connecting to WebSocket...")
            connectGeneralWebSocket()
        }
    }, [uiLoaded, token])

    // Simple WebSocket management
    const connectGeneralWebSocket = () => {
        if (!token) return
        
        if (generalWs && generalWs.readyState === WebSocket.OPEN) {
            log("✅ General WebSocket already connected")
            return
        }
        
        if (generalWs && generalWs.readyState === WebSocket.CONNECTING) {
            log("⏳ General WebSocket already connecting")
            return
        }

        log("🔄 Connecting to WebSocket...")
        const wsUrl = baseUrl.replace("http", "ws")
        // For browser WebSocket, we need to pass token as query parameter
        const ws = new WebSocket(`${wsUrl}/api/v1/protected/pk/ws?token=${encodeURIComponent(token)}`)

        ws.onopen = () => {
            log("🔌 General WebSocket connected")
            setIsWsConnected(true)

            // Subscribe to public room events
            ws.send(JSON.stringify({
                type: "subscribe_public_rooms",
                data: {}
            }))
            log("📡 Subscribed to public room events")
        }

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data)
                log(`📥 General WS: ${message.type}`)

                switch (message.type) {
                    case "join_room_response":
                        setJoiningRoom(null) // Clear joining state
                        if (message.data.success) {
                            log(`✅ Joined room: ${message.data.room.room_name}`)
                            // Disconnect lobby WebSocket before navigating to room
                            disconnectGeneralWebSocket()
                            navigate(`/dashboard/multiplayer/room/${message.data.room.room_code}`)
                        } else {
                            log(`❌ Failed to join room: ${message.data.error}`)
                            setError(message.data.error || "Failed to join room")
                        }
                        break

                    case "public_rooms_subscription_response":
                        log(`✅ ${message.data.message}`)
                        break

                    case "public_room_created":
                        log(`🆕 New room: ${message.data.room.room_name}`)
                        setRooms(prev => [message.data.room, ...prev])
                        break

                    case "public_room_updated":
                        log(`🔄 Room updated: ${message.data.room.room_name}`)
                        setRooms(prev => {
                            const index = prev.findIndex(room => room.id === message.data.room.id)
                            if (index !== -1) {
                                const newRooms = [...prev]
                                newRooms[index] = message.data.room
                                return newRooms
                            }
                            return [message.data.room, ...prev]
                        })
                        break

                    case "public_room_removed":
                        log(`🗑️ Room removed: ${message.data.room_code}`)
                        setRooms(prev => prev.filter(room => room.id !== message.data.room_id))
                        break

                    case "public_rooms_response":
                        if (message.data.success && message.data.rooms) {
                            setRooms(message.data.rooms)
                            log(`📋 Loaded ${message.data.rooms.length} public rooms`)
                        } else {
                            log(`❌ Failed to load public rooms: ${message.data.error || 'Unknown error'}`)
                            setRooms([])
                        }
                        break
                }
            } catch (error) {
                log(`📥 General WS Raw: ${event.data}`)
                log(`❌ Failed to parse WebSocket message: ${error}`)
            }
        }

        ws.onclose = (event) => {
            log(`❌ General WebSocket disconnected (code: ${event.code}, reason: ${event.reason})`)
            setIsWsConnected(false)
            setGeneralWs(null)

            // Auto-reconnect after 3 seconds if not intentionally disconnected
            if (token && event.code !== 1000) { // 1000 = normal closure
                log("🔄 Auto-reconnecting in 3 seconds...")
                setTimeout(() => {
                    connectGeneralWebSocket()
                }, 3000)
            }
        }

        ws.onerror = (error) => {
            log(`🚨 General WebSocket error: ${error}`)
            setIsWsConnected(false)
        }

        setGeneralWs(ws)
    }

    const disconnectGeneralWebSocket = () => {
        if (generalWs && generalWs.readyState === WebSocket.OPEN) {
            generalWs.send(JSON.stringify({
                type: "unsubscribe_public_rooms",
                data: {}
            }))
            generalWs.close(1000, "Normal closure") // Use normal closure code
        }
        setGeneralWs(null)
        setIsWsConnected(false)
    }

    const refreshPublicRooms = async () => {
        try {
            log("🔄 Refreshing public rooms...")
            const response = await fetch(`${baseUrl}/api/v1/pk/rooms/public`)
            const result = await response.json()

            if (response.ok && result.data && result.data.rooms) {
                setRooms(result.data.rooms)
                log(`✅ Loaded ${result.data.rooms.length} public rooms`)
            } else {
                setRooms([])
            }
        } catch (error: any) {
            log(`❌ Error refreshing public rooms: ${error.message}`)
            setRooms([])
        }
    }

    const createRoom = async () => {
        if (!newRoomName.trim() || !selectedCategory || !token) {
            setError("Please fill in all required fields")
            return
        }

        try {
            const roomData = {
                room_name: newRoomName.trim(),
                category_id: parseInt(selectedCategory.id),
                lesson_id: null,
                max_players: 6,
                game_mode: "dictation",
                time_limit_seconds: 600,
                is_public: true,
                password: ""
            }

            const response = await fetch(`${baseUrl}/api/v1/protected/pk/rooms`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(roomData)
            })

            const result = await response.json()

            if (response.ok && result.data) {
                log(`✅ Room created: ${result.data.room_name}`)
                setNewRoomName("")
                setShowCreateRoom(false)
                setSelectedCategory(null)
                navigate(`/dashboard/multiplayer/room/${result.data.room_code}`)
            } else {
                setError(result.error || result.message || "Failed to create room")
            }
        } catch (error: any) {
            log(`❌ Error creating room: ${error.message}`)
            setError("Network error occurred")
        }
    }

    const joinRoom = (roomCode?: string) => {
        const targetRoomCode = roomCode || joinCode
        if (!targetRoomCode) {
            setError("Please enter a room code")
            return
        }

        // Check if WebSocket is properly connected
        if (!isWsConnected || !generalWs || generalWs.readyState !== WebSocket.OPEN) {
            log("🔄 WebSocket not ready, attempting to reconnect...")

            // Try to reconnect if not connected
            if (!generalWs && token) {
                connectGeneralWebSocket()
                setError("Reconnecting... Please try again in a moment.")
                return
            }

            setError("Connection not ready. Please wait a moment and try again.")
            return
        }

        setError("")
        setJoiningRoom(targetRoomCode)
        
        try {
            generalWs.send(JSON.stringify({
                type: "join_room",
                data: {
                    room_code: targetRoomCode,
                    password: ""
                }
            }))
            log(`🔄 Joining room: ${targetRoomCode}...`)
            
            // Set timeout for join room response
            setTimeout(() => {
                if (joiningRoom === targetRoomCode) {
                    log(`⏰ Join room timeout for: ${targetRoomCode}`)
                    setError("Join request timed out. Please try again.")
                    setJoiningRoom(null)
                }
            }, 10000) // 10 second timeout
            
        } catch (error) {
            log(`❌ Error sending join room message: ${error}`)
            setError("Failed to send join request. Please try again.")
            setJoiningRoom(null)
            return
        }

        setJoinCode("")
        setShowJoinRoom(false)
    }

    const copyRoomCode = (roomCode: string) => {
        navigator.clipboard.writeText(roomCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "waiting":
                return "bg-green-100 text-green-800"
            case "starting":
                return "bg-yellow-100 text-yellow-800"
            case "playing":
                return "bg-blue-100 text-blue-800"
            case "finished":
                return "bg-gray-100 text-gray-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Multiplayer Dictation</h1>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700">❌ Please login first to access multiplayer features</p>
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
                    <p className="mt-4 text-slate-600">Loading multiplayer lobby...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-800 mb-2">
                            Multiplayer Dictation
                        </h1>
                        <p className="text-xl text-slate-600">
                            Challenge friends and compete in real-time dictation battles
                        </p>
                        {/* Connection Status */}
                        <div className="flex items-center space-x-2 mt-2">
                            <div className={`w-2 h-2 rounded-full ${isWsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className={`text-sm font-medium ${isWsConnected ? 'text-green-600' : 'text-red-600'}`}>
                                {isWsConnected ? '🟢 Connected' : '🔴 Disconnected'}
                            </span>
                            {!isWsConnected && (
                                <button
                                    onClick={() => {
                                        if (token) {
                                            log("🔄 Manual reconnect requested...")
                                            connectGeneralWebSocket()
                                        }
                                    }}
                                    className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    🔄 Reconnect
                                </button>
                            )}
                        </div>
                        {!uiLoaded && (
                            <div className="text-xs text-slate-500 mt-1">
                                ⏳ Loading UI...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Plus className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">Create Room</h3>
                            <p className="text-blue-100">
                                Start a new multiplayer session
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateRoom(true)}
                        className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create New Room</span>
                    </button>
                </div>

                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Users className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">Join Room</h3>
                            <p className="text-purple-100">
                                Enter a room code to join
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowJoinRoom(true)}
                        className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                        <Users className="w-5 h-5" />
                        <span>Join with Code</span>
                    </button>
                </div>
            </div>

            {/* Active Rooms */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">
                        Active Rooms
                    </h2>
                                    <button
                    onClick={async () => {
                        if (isWsConnected && generalWs && generalWs.readyState === WebSocket.OPEN) {
                            generalWs.send(JSON.stringify({
                                type: "get_public_rooms",
                                data: {
                                    page: 1,
                                    limit: 50
                                }
                            }))
                            log("📡 Requesting public rooms via WebSocket...")
                        } else {
                            log("❌ General WebSocket not connected, falling back to REST API...")
                            // Fallback to REST API
                            await refreshPublicRooms()
                            // Try to reconnect WebSocket
                            if (token) {
                                connectGeneralWebSocket()
                            }
                        }
                    }}
                    disabled={!isWsConnected}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Refresh
                </button>
                </div>
                
                {rooms.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-200">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                            No Active Rooms
                        </h3>
                        <p className="text-slate-600 mb-6">
                            Be the first to create a room and start playing!
                        </p>
                        <button
                            onClick={() => setShowCreateRoom(true)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                        >
                            Create First Room
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {rooms.map(room => (
                            <div
                                key={room.id}
                                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-xl font-semibold text-slate-800">
                                                    {room.room_name}
                                                </h3>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                        room.room_status
                                                    )}`}
                                                >
                                                    {room.room_status}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2 text-sm text-slate-600">
                                                    <Crown className="w-4 h-4 text-yellow-500" />
                                                    <span>Host: {room.host_user.full_name || room.host_user.email}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-sm text-slate-600">
                                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                    <span>Category: {room.category?.name || "Unknown"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => copyRoomCode(room.room_code)}
                                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                            title="Copy room code"
                                        >
                                            {copied ? (
                                                <Check className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                                            <Users className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                                            <div className="text-sm font-medium text-slate-800">
                                                {room.current_players}/{room.max_players}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Players
                                            </div>
                                        </div>
                                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                                            <Clock className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                                            <div className="text-sm font-medium text-slate-800">
                                                5min
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Duration
                                            </div>
                                        </div>
                                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                                            <Zap className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                                            <div className="text-sm font-medium text-slate-800">
                                                Dictation
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Mode
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => joinRoom(room.room_code)}
                                        disabled={
                                            !isWsConnected ||
                                            room.room_status?.toLowerCase() !== "waiting" ||
                                            room.current_players >= room.max_players ||
                                            !!joiningRoom
                                        }
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                                    >
                                        <Play className="w-4 h-4" />
                                        <span>
                                            {joiningRoom === room.room_code
                                                ? "Joining..."
                                                : !isWsConnected
                                                ? "Connecting..."
                                                : room.room_status?.toLowerCase() === "waiting"
                                                ? room.current_players >= room.max_players
                                                    ? "Room Full"
                                                    : "Join Room"
                                                : "Unavailable"}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Room Modal */}
            {showCreateRoom && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6">
                            Create New Room
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Room Name
                                </label>
                                <input
                                    type="text"
                                    value={newRoomName}
                                    onChange={e => setNewRoomName(e.target.value)}
                                    placeholder="Enter room name..."
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Category
                                </label>
                                <select
                                    value={selectedCategory?.id || ""}
                                    onChange={e => {
                                        const cat = categories.find(c => c.id === e.target.value)
                                        setSelectedCategory(cat)
                                    }}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Choose category...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowCreateRoom(false)}
                                    className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createRoom}
                                    disabled={!newRoomName.trim() || !selectedCategory}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Join Room Modal */}
            {showJoinRoom && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6">
                            Join Room
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Room Code
                                </label>
                                <input
                                    type="text"
                                    value={joinCode}
                                    onChange={e => setJoinCode(e.target.value)}
                                    placeholder="Enter room code..."
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowJoinRoom(false)}
                                    className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => joinRoom()}
                                    disabled={!joinCode.trim() || !isWsConnected || !!joiningRoom}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all duration-200"
                                >
                                    {joiningRoom ? "Joining..." : !isWsConnected ? "Connecting..." : "Join"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Kicked Message */}
            {kickedMessage && (
                <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg border-l-4 border-red-700">
                    <div className="flex items-center">
                        <span className="mr-2">⚠️</span>
                        {kickedMessage}
                        <button
                            onClick={() => setKickedMessage("")}
                            className="ml-3 text-white hover:text-red-200 font-bold"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-md">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="font-semibold mb-1">Connection Error</div>
                            <div className="text-sm">{error}</div>
                            {!isWsConnected && (
                                <div className="text-xs mt-2 opacity-75">
                                    WebSocket: Disconnected | Status: {generalWs?.readyState === WebSocket.CONNECTING ? 'Connecting' : generalWs?.readyState === WebSocket.OPEN ? 'Open' : 'Closed'}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setError("")}
                            className="ml-2 text-white hover:text-red-200 text-lg font-bold"
                        >
                            ×
                        </button>
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

export default MultiplayerLobby