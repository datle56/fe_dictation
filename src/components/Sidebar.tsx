import React, { useState, useEffect } from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import {
    Home,
    BookOpen,
    PenTool,
    Headphones,
    MessageSquare,
    BookMarked,
    FileText,
    Mic,
    User,
    Users,
    Zap,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    Youtube,
    Settings,
    ArrowLeft,
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useMultiplayer } from "../contexts/MultiplayerContext"

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    // { name: 'Reading', href: '/dashboard/lessons/reading', icon: BookOpen },
    // { name: 'Writing', href: '/dashboard/lessons/writing', icon: PenTool },
    // { name: 'Listening', href: '/dashboard/lessons/listening', icon: Headphones },
    // { name: 'Speaking', href: '/dashboard/lessons/speaking', icon: MessageSquare },
    { name: "Dictation", href: "/dashboard/dictation", icon: Mic },
    { name: "YouTube", href: "/dashboard/youtube", icon: Youtube },
    { name: "Multiplayer", href: "/dashboard/multiplayer", icon: Users },
    { name: "Analysis", href: "/dashboard/analysis", icon: BarChart3 },
    { name: "Test API", href: "/dashboard/test-api", icon: Settings },
    // { name: 'Vocabulary', href: '/dashboard/lessons/vocabulary', icon: BookMarked },
    // { name: 'Grammar', href: '/dashboard/lessons/grammar', icon: FileText },
    // { name: 'Profile', href: '/dashboard/profile', icon: User },
]

interface SidebarProps {
    collapsed: boolean
    onToggle: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, getValidAccessToken } = useAuth()
    const { activeRoom, updateActiveRoom } = useMultiplayer()
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
    const [pendingNavigation, setPendingNavigation] = useState<string>("")
    const [token, setToken] = useState<string | null>(null)
    const baseUrl = "http://localhost:8080"

    // Get token
    useEffect(() => {
        const initializeToken = async () => {
            if (user) {
                const accessToken = await getValidAccessToken()
                setToken(accessToken)
            }
        }
        initializeToken()
    }, [user, getValidAccessToken])

    // Check for active room only once on mount
    useEffect(() => {
        if (!user || !token) return

        const checkActiveRoom = async () => {
            try {
                const response = await fetch(`${baseUrl}/api/v1/protected/pk/rooms/active`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                if (response.ok) {
                    const data = await response.json()
                    if (data.data) {
                        console.log('Sidebar: Active room detected on mount:', data.data.room_name)
                        updateActiveRoom(data.data)
                    } else {
                        console.log('Sidebar: No active room on mount')
                        updateActiveRoom(null)
                    }
                } else {
                    console.log('Sidebar: Failed to check active room, status:', response.status)
                    updateActiveRoom(null)
                }
            } catch (error) {
                console.error('Error checking active room:', error)
                updateActiveRoom(null)
            }
        }

        // Only check once when component mounts or when user/token changes
        checkActiveRoom()
        
        // No more continuous polling - multiplayer components will update the context
    }, [user, token, updateActiveRoom])

    const handleNavClick = (event: React.MouseEvent, href: string) => {
        console.log('Sidebar nav click:', {
            href,
            activeRoom: activeRoom?.room_name,
            isMultiplayerPath: href.includes('/multiplayer'),
            shouldShowConfirm: activeRoom && !href.includes('/multiplayer')
        })
        
        // If user is in an active room and trying to navigate away from multiplayer
        if (activeRoom && !href.includes('/multiplayer')) {
            event.preventDefault()
            setPendingNavigation(href)
            setShowLeaveConfirm(true)
            console.log('Showing leave confirmation modal')
        }
        // Otherwise, let the NavLink handle navigation normally
    }

    const confirmLeaveRoom = async () => {
        if (!activeRoom || !token) return

        try {
            // First, try to send WebSocket leave message if we have access to the room WebSocket
            // This will be handled by the room component's beforeunload event
            
            // Call the API endpoint to leave the room
            const response = await fetch(`${baseUrl}/api/v1/protected/pk/rooms/${activeRoom.id}/leave`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })

            const result = await response.json()
            
            if (response.ok && result.success) {
                console.log(`Successfully left room: ${activeRoom.room_name}`)
                // Clear active room immediately
                updateActiveRoom(null)
                setShowLeaveConfirm(false)
                // Navigate to the pending destination
                if (pendingNavigation) {
                    navigate(pendingNavigation)
                    setPendingNavigation("")
                }
            } else {
                console.error(`Failed to leave room: ${result.error || result.message}`)
                // Even if API fails, clear the room state and navigate
                updateActiveRoom(null)
                setShowLeaveConfirm(false)
                if (pendingNavigation) {
                    navigate(pendingNavigation)
                    setPendingNavigation("")
                }
            }
        } catch (error) {
            console.error(`Error leaving room:`, error)
            // Even if there's an error, clear the room state and navigate
            updateActiveRoom(null)
            setShowLeaveConfirm(false)
            if (pendingNavigation) {
                navigate(pendingNavigation)
                setPendingNavigation("")
            }
        }
    }

    const cancelLeaveRoom = () => {
        setShowLeaveConfirm(false)
        setPendingNavigation("")
    }

    const isHost = user?.id === activeRoom?.host_user_id
    return (
        <>
            <div
                className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-xl border-r border-slate-200 transition-all duration-300 z-40 ${
                    collapsed ? "w-16" : "w-64"
                }`}
            >
                {/* Active Room Indicator */}
                {activeRoom && !location.pathname.includes('/multiplayer') && (
                    <div className="p-4 bg-orange-50 border-b border-orange-200">
                        <div className={`${collapsed ? 'text-center' : ''}`}>
                            {collapsed ? (
                                <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto" title={`In room: ${activeRoom.room_name}`} />
                            ) : (
                                <div className="text-xs">
                                    <div className="text-orange-700 font-medium">In Multiplayer Room</div>
                                    <div className="text-orange-600 truncate">{activeRoom.room_name}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <nav className="p-4 space-y-2">
                    {navigation.map(item => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            onClick={(e) => handleNavClick(e, item.href)}
                            className={({ isActive }) =>
                                `flex items-center rounded-xl transition-all duration-200 group relative ${
                                    collapsed
                                        ? "justify-center px-3 py-3"
                                        : "space-x-3 px-4 py-3"
                                } ${
                                    isActive
                                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                                }`
                            }
                            title={collapsed ? item.name : undefined}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && (
                                <span className="font-medium">{item.name}</span>
                            )}
                            {collapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                                    {item.name}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Toggle Button - ở giữa sidebar */}
                <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-50">
                    <button
                        onClick={onToggle}
                        className="w-8 h-8 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 hover:shadow-xl transition-all duration-200 group"
                        title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {collapsed ? (
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-800" />
                        ) : (
                            <ChevronLeft className="w-4 h-4 text-slate-600 group-hover:text-slate-800" />
                        )}
                    </button>
                </div>
            </div>

            {/* Leave Room Confirmation Modal */}
            {showLeaveConfirm && activeRoom && (
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
                                Are you sure you want to leave "{activeRoom.room_name}"? 
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
        </>
    )
}

export default Sidebar
