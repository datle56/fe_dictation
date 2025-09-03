import React from "react"
import { useAuth } from "../contexts/AuthContext"
import { LogOut, User, Trophy } from "lucide-react"
import { useProgress } from "../contexts/ProgressContext"

const Header: React.FC = () => {
    const { user, logout } = useAuth()
    const { getOverallStats } = useProgress()
    const stats = getOverallStats()

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-slate-200">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                                I
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            IELTS Master
                        </h1>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                            <div className="flex items-center space-x-1">
                                <Trophy className="w-4 h-4 text-yellow-500" />
                                <span className="font-medium">
                                    {stats.averageScore.toFixed(1)}
                                </span>
                            </div>
                            <div className="text-slate-400">|</div>
                            <span>
                                {stats.completedLessons} lessons completed
                            </span>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <div className="text-sm">
                                    <div className="font-medium text-slate-800">
                                        {user?.fullName}
                                    </div>
                                    <div className="text-slate-500">
                                        {user?.level}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={logout}
                                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
