import React, { useState, useEffect, useRef } from "react"
import { useAuth } from "../contexts/AuthContext"

interface User {
    id: number
    email: string
    full_name?: string
}

interface Participant {
    user: User
    is_host: boolean
    is_ready: boolean
}

interface Room {
    id: number
    room_name: string
    room_code: string
    room_status: string
    current_players: number
    max_players: number
    host_user_id: number
    participants: Participant[]
}

interface PublicRoom {
    id: number
    room_name: string
    room_code: string
    room_status: string
    current_players: number
    max_players: number
    host_user: User
}

const TestAPI: React.FC = () => {
    const { user, getValidAccessToken } = useAuth()
    const [baseUrl] = useState("http://localhost:8080")
    const [token, setToken] = useState<string | null>(null)
    const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
    const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([])
    const [ws, setWs] = useState<WebSocket | null>(null)
    const [generalWs, setGeneralWs] = useState<WebSocket | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [wsStatus, setWsStatus] = useState("Disconnected")
    const [logs, setLogs] = useState<string[]>([])
    const [isConnecting, setIsConnecting] = useState(false)
    // const [isTogglingReady, setIsTogglingReady] = useState(false) // UNUSED - commented out
    const autoRefreshInterval = useRef<NodeJS.Timeout | null>(null)
    // const heartbeatInterval = useRef<NodeJS.Timeout | null>(null) // UNUSED - commented out
    const lastReadyToggle = useRef<number>(0)

    const log = (message: string) => {
        const timestamp = new Date().toLocaleTimeString()
        setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    }

    const clearLog = () => {
        setLogs([])
    }

    // Auto-refresh functionality
    const startAutoRefresh = () => {
        if (autoRefreshInterval.current) clearInterval(autoRefreshInterval.current)

        autoRefreshInterval.current = setInterval(async () => {
            // await refreshCurrentRoom()  // COMMENT: Keep simple like original
            await refreshPublicRooms()
        }, 5000) // Back to 5 seconds like original

        log("🔄 Auto-refresh started (5s interval) - simple mode")
    }

    const stopAutoRefresh = () => {
        if (autoRefreshInterval.current) {
            clearInterval(autoRefreshInterval.current)
            autoRefreshInterval.current = null
            log("⏹️ Auto-refresh stopped")
        }
    }

    // Room management
    const refreshCurrentRoom = async () => {
        if (!token) return

        try {
            const response = await fetch(`${baseUrl}/api/v1/protected/pk/rooms/active`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.ok) {
                const data = await response.json()
                setCurrentRoom(data.data)

                // COMMENT: Disable auto-connect from refresh to avoid conflicts
                // if (data.data && !ws && !isConnecting) {
                //     setTimeout(() => connectWebSocket(data.data), 500)
                // }
            } else if (response.status === 404) {
                setCurrentRoom(null)
            }
        } catch (error: any) {
            log(`❌ Error refreshing current room: ${error.message}`)
        }
    }

    const createRoom = async () => {
        if (!token || !user) {
            log(`❌ Missing token or user: token=${!!token}, user=${!!user}`)
            return
        }

        try {
            const roomData = {
                room_name: `Room by ${user.full_name || user.email}`,
                category_id: 1,
                lesson_id: 1,
                max_players: 4,
                game_mode: "dictation",
                time_limit_seconds: 300,
                is_public: true,
                password: ""
            }

            log(`🔄 Creating room with data: ${JSON.stringify(roomData)}`)
            log(`🔄 Sending to: ${baseUrl}/api/v1/protected/pk/rooms`)

            const response = await fetch(`${baseUrl}/api/v1/protected/pk/rooms`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(roomData)
            })

            log(`📥 Response status: ${response.status}`)
            const result = await response.json()
            log(`📥 Response data: ${JSON.stringify(result)}`)
            
            if (response.ok) {
                log(`✅ Room created: ${result.data.room_name} (${result.data.room_code})`)
                // Set room directly from create response and then connect WebSocket
                setCurrentRoom(result.data)
                if (!ws && !isConnecting) {
                    setTimeout(() => connectWebSocket(result.data), 500)
                }
                // COMMENT: Keep simple - no refresh after create
                // await refreshCurrentRoom()
            } else {
                log(`❌ Failed to create room: ${result.error}`)
            }
        } catch (error: any) {
            log(`❌ Error creating room: ${error.message}`)
        }
    }

    const leaveCurrentRoom = () => {
        if (!currentRoom) return

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: "leave_room",
                data: { room_id: currentRoom.id }
            }))
            log(`🔄 Leaving room: ${currentRoom.room_name}...`)
        } else {
            log("❌ Room WebSocket not connected")
        }
    }

    const joinRoom = (roomCode: string) => {
        if (!generalWs || generalWs.readyState !== WebSocket.OPEN) {
            log("❌ General WebSocket not connected")
            return
        }

        generalWs.send(JSON.stringify({
            type: "join_room",
            data: {
                room_code: roomCode,
                password: ""
            }
        }))
        log(`🔄 Joining room: ${roomCode}...`)
    }

    const refreshPublicRooms = async () => {
        try {
            const response = await fetch(`${baseUrl}/api/v1/pk/rooms/public`)
            const result = await response.json()

            if (response.ok && result.data && result.data.rooms) {
                setPublicRooms(result.data.rooms)
            } else {
                setPublicRooms([])
            }
        } catch (error: any) {
            log(`❌ Error refreshing public rooms: ${error.message}`)
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

                if (message.type === "join_room_response") {
                    if (message.data.success) {
                        log(`✅ Joined room successfully: ${message.data.room.room_name}`)
                        setCurrentRoom(message.data.room)
                        // Sync ready status when joining
                        const myParticipant = message.data.room.participants?.find((p: any) => p.user_id === user?.id)
                        if (myParticipant) {
                            setIsReady(myParticipant.is_ready)
                        }
                        // COMMENT: Keep simple - no auto-connect from general WS
                        // if (!ws && !isConnecting) {
                        //     setTimeout(() => connectWebSocket(message.data.room), 500)
                        // }
                    } else {
                        log(`❌ Failed to join room: ${message.data.error}`)
                    }
                } else if (message.type === "active_room_response") {
                    if (message.data.success && message.data.room) {
                        setCurrentRoom(message.data.room)
                        // Don't call refreshCurrentRoom here to avoid loop
                    }
                }
            } catch (error) {
                log(`📥 General WS Raw: ${event.data}`)
            }
        }

        newGeneralWs.onclose = () => {
            log("❌ General WebSocket disconnected")
            setTimeout(connectGeneralWebSocket, 3000)
        }

        newGeneralWs.onerror = (error) => {
            log(`🚨 General WebSocket error: ${error}`)
        }

        setGeneralWs(newGeneralWs)
    }

    // Room WebSocket functionality
    const connectWebSocket = (room?: Room) => {
        const roomToUse = room || currentRoom
        if (!roomToUse || !token) {
            log("❌ No active room to connect WebSocket")
            return
        }

        if (isConnecting) {
            log("⏳ Already connecting to WebSocket, skipping...")
            return
        }

        if (ws && ws.readyState === WebSocket.OPEN) {
            log("✅ WebSocket already connected, skipping...")
            return
        }

        setIsConnecting(true)

        if (ws) {
            ws.close()
        }

        const wsUrl = baseUrl.replace("http", "ws")
        const newWs = new WebSocket(`${wsUrl}/api/v1/protected/pk/ws?room_id=${roomToUse.id}&token=${encodeURIComponent(token)}`)

        newWs.onopen = () => {
            setWsStatus("✅ Connected")
            setIsConnecting(false)
            log("🔌 Room WebSocket connected and authenticated")
            
            // COMMENT: Disable heartbeat - keep simple like original
            // if (heartbeatInterval.current) clearInterval(heartbeatInterval.current)
            // heartbeatInterval.current = setInterval(() => {
            //     if (newWs.readyState === WebSocket.OPEN) {
            //         newWs.send(JSON.stringify({ type: "ping", data: {} }))
            //     }
            // }, 30000)
        }

        newWs.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data)
                log(`📥 Room WS: ${message.type} - ${JSON.stringify(message.data)}`)

                if (message.type === "room_update") {
                    // Update room directly from WebSocket data instead of calling API
                    if (message.data && message.data.room) {
                        setCurrentRoom(message.data.room)
                    }
                } else if (message.type === "leave_room_response") {
                    if (message.data.success) {
                        log(`✅ ${message.data.message}`)
                        setCurrentRoom(null)
                        refreshCurrentRoom()
                    } else {
                        log(`❌ Failed to leave room: ${message.data.error}`)
                    }
                } else if (message.type === "player_joined") {
                    log(`👤 Player joined: ${message.data.participant.user.full_name || message.data.participant.user.email}`)
                    // Room update will come via room_update message, no need to call API
                } else if (message.type === "player_left") {
                    log(`👋 Player left (ID: ${message.data.user_id})`)
                    // Room update will come via room_update message, no need to call API
                } else if (message.type === "room_deleted") {
                    log(`🗑️ Room deleted: ${message.data.message}`)
                    disconnectWebSocket()
                    setCurrentRoom(null)
                    refreshCurrentRoom()
                }
            } catch (error) {
                log(`📥 Room WS Raw: ${event.data}`)
            }
        }

        newWs.onclose = () => {
            setWsStatus("❌ Disconnected")
            setIsConnecting(false)
            // setIsTogglingReady(false) // Reset toggle flag on disconnect - UNUSED
            log("❌ Room WebSocket disconnected")
            
            // COMMENT: Disable auto-reconnect - keep simple like original
            // if (currentRoom) {
            //     log("🔄 Will attempt to reconnect in 3 seconds...")
            //     setTimeout(() => {
            //         if (currentRoom && (!ws || ws.readyState !== WebSocket.OPEN)) {
            //             log("🔄 Attempting to reconnect WebSocket...")
            //             connectWebSocket(currentRoom)
            //         }
            //     }, 3000)
            // }
        }

        newWs.onerror = (error) => {
            setIsConnecting(false)
            log(`🚨 Room WebSocket error: ${error}`)
        }

        setWs(newWs)
    }

    const disconnectWebSocket = () => {
        if (ws) {
            ws.close()
            setWs(null)
        }
        // COMMENT: No heartbeat to clear - keep simple
        // if (heartbeatInterval.current) {
        //     clearInterval(heartbeatInterval.current)
        //     heartbeatInterval.current = null
        // }
        setIsConnecting(false)
        // setIsTogglingReady(false) // UNUSED
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

        ws.send(JSON.stringify({
            type: "start_game",
            data: {}
        }))
        log("🎮 Starting game...")
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

    // Initialize on mount
    useEffect(() => {
        if (user && token) {
            connectGeneralWebSocket()
            startAutoRefresh()
            refreshCurrentRoom()
            refreshPublicRooms()
        }

        return () => {
            stopAutoRefresh()
            if (ws) ws.close()
            if (generalWs) generalWs.close()
        }
    }, [user, token])

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">API Test Page</h1>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700">❌ Please login first to use the API test page</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">PK Room API Test</h1>

                {/* User Info */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">User Info</h3>
                    <p className="text-gray-700">👤 User: {user.full_name || user.email} (ID: {user.id})</p>
                </div>

                {/* Current Room Status */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Current Room Status</h3>
                    {currentRoom ? (
                        <div className={`p-4 rounded-lg ${currentRoom.host_user_id === user.id ? 'bg-blue-50' : 'bg-green-50'}`}>
                            <div className="space-y-2">
                                <p><strong>{currentRoom.room_name}</strong> - Code: <strong>{currentRoom.room_code}</strong>
                                    {currentRoom.host_user_id === user.id && <span className="ml-2">👑 (HOST)</span>}
                                </p>
                                <p>Status: {currentRoom.room_status} | Players: {currentRoom.current_players}/{currentRoom.max_players}</p>
                                <p>Participants: {currentRoom.participants.map(p => 
                                    `${p.user.full_name || p.user.email}${p.is_host ? ' 👑' : ''}${p.is_ready ? ' ✅' : ' ❌'}`
                                ).join(", ")}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">No active room</p>
                    )}
                    <div className="mt-4 space-x-2">
                        <button
                            onClick={refreshCurrentRoom}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Refresh
                        </button>
                        {currentRoom && (
                            <button
                                onClick={leaveCurrentRoom}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Leave Room
                            </button>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="space-x-2">
                        <button
                            onClick={createRoom}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Create New Room
                        </button>
                        <button
                            onClick={refreshPublicRooms}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Refresh Public Rooms
                        </button>
                    </div>
                </div>

                {/* Public Rooms */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Public Rooms (Auto-refresh every 5s)</h3>
                    <div className="space-y-2">
                        {publicRooms.length > 0 ? publicRooms.map(room => (
                            <div key={room.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="space-y-1">
                                    <p><strong>{room.room_name}</strong> - Code: <strong>{room.room_code}</strong></p>
                                    <p>Host: {room.host_user.full_name || room.host_user.email}</p>
                                    <p>Players: {room.current_players}/{room.max_players} | Status: {room.room_status}</p>
                                    {!currentRoom && room.room_status === "waiting" && (
                                        <button
                                            onClick={() => joinRoom(room.room_code)}
                                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                                        >
                                            Join
                                        </button>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-500">No public rooms available</p>
                        )}
                    </div>
                </div>

                {/* WebSocket Section */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">WebSocket Connection</h3>
                    <p className="mb-4">Status: {wsStatus}</p>
                    <div className="space-x-2 mb-4">
                        <button
                            onClick={() => connectWebSocket()}
                            disabled={!currentRoom}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                        >
                            Connect WebSocket
                        </button>
                        <button
                            onClick={disconnectWebSocket}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Disconnect
                        </button>
                    </div>
                    {currentRoom && (
                        <div className="space-x-2">
                            <button
                                onClick={toggleReady}
                                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                            >
                                Toggle Ready ({isReady ? 'Ready ✅' : 'Not Ready ❌'})
                            </button>
                            {currentRoom.host_user_id === user.id && (
                                <button
                                    onClick={startGame}
                                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                                >
                                    Start Game
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Activity Log */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Activity Log</h3>
                    <div className="bg-gray-100 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
                        {logs.map((log, index) => (
                            <div key={index} className="mb-1">{log}</div>
                        ))}
                    </div>
                    <button
                        onClick={clearLog}
                        className="mt-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Clear Log
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TestAPI
