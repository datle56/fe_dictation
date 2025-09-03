import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useProgress } from "../contexts/ProgressContext"
import {
    BookOpen,
    PenTool,
    Headphones,
    MessageSquare,
    BookMarked,
    FileText,
    Mic,
    TrendingUp,
    Clock,
    Trophy,
    Target,
    Pencil,
    Volume2,
    Book,
    GraduationCap,
    Youtube,
} from "lucide-react"
import { api } from "../utils/api"
import { Skill } from "../types/skill"

const Dashboard: React.FC = () => {
    const { user } = useAuth()
    const { getOverallStats } = useProgress()
    const stats = getOverallStats()
    const [skills, setSkills] = useState<Skill[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSkills()
    }, [])

    const fetchSkills = async () => {
        try {
            console.log('=== Starting skills fetch ===')
            
            const response = await api.getSkills()
            console.log('=== Skills response ===', response)
            
            if (response.success && response.data) {
                console.log('API call successful, mapping skills...')
                // Map icon string to component and add lessonsCount
                const skillsWithUI = response.data.map((skill: any) => ({
                    ...skill,
                    iconComponent: getSkillIcon(skill.icon),
                    lessonsCount: getSkillLessonsCount(skill.name) // Mock data for now
                }))
                setSkills(skillsWithUI)
                console.log('Skills mapped successfully:', skillsWithUI)
            } else {
                console.error('Skills API failed:', response)
                setSkills([])
            }
        } catch (error) {
            console.error('Error fetching skills:', error)
            setSkills([])
        } finally {
            setLoading(false)
        }
    }

    const getSkillIcon = (iconName: string) => {
        const iconMap: Record<string, React.ElementType> = {
            'BookOpen': BookOpen,
            'Pencil': Pencil,
            'Headphones': Headphones,
            'Book': Book,
            'Volume2': Volume2,
            'GraduationCap': GraduationCap,
            'Mic': Mic
        }
        return iconMap[iconName] || BookOpen
    }

    const getSkillLessonsCount = (skillName: string) => {
        // TODO: Get from API
        return 0
    }



    const statCards = [
        {
            title: "Current Score",
            value: stats.averageScore.toFixed(1),
            icon: Trophy,
            color: "text-yellow-600",
            bg: "bg-yellow-50",
        },
        {
            title: "Target Score",
            value: "7.0",
            icon: Target,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            title: "Lessons Completed",
            value: stats.completedLessons.toString(),
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-50",
        },
        {
            title: "Study Time",
            value: `${Math.floor((stats.totalSentences * 2.5) / 60)}h`,
            icon: Clock,
            color: "text-purple-600",
            bg: "bg-purple-50",
        },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-slate-600">Loading dashboard...</div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            Welcome back, {user?.full_name}!
                        </h1>
                        <p className="text-blue-100 text-lg">
                            Continue your journey to IELTS success. You're{" "}
                            Beginner level, targeting 7.0{" "}
                            band score.
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 mb-1">
                                    {stat.title}
                                </p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {stat.value}
                                </p>
                            </div>
                            <div
                                className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}
                            >
                                <stat.icon
                                    className={`w-6 h-6 ${stat.color}`}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Skills Grid */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    Choose Your Skill to Practice
                </h2>
                {skills.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {skills.map(skill => {
                            const Icon = skill.iconComponent || BookOpen
                            const path = skill.path === 'vocabulary' 
                                ? '/dashboard/vocabulary' 
                                : `/dashboard/lessons/${skill.path}`

                            return (
                                <Link
                                    key={skill.id}
                                    to={path}
                                    className="block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200"
                                >
                                    <div
                                        className={`p-6 bg-gradient-to-r ${skill.color}`}
                                    >
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-slate-800 mb-2">
                                            {skill.name}
                                        </h3>
                                        <p className="text-slate-600 mb-4">
                                            {skill.description}
                                        </p>
                                        <div className="text-sm text-slate-500">
                                            {skill.lessonsCount}{" "}
                                            {skill.lessonsCount === 1
                                                ? "lesson"
                                                : "lessons"}
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-600 mb-2">
                            No Skills Available
                        </h3>
                        <p className="text-slate-500">
                            Please check your connection or try again later.
                        </p>
                    </div>
                )}
            </div>

            {/* YouTube Dictation Feature */}
            <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Youtube className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">YouTube Dictation</h3>
                                <p className="text-red-100">Learn with any YouTube video</p>
                            </div>
                        </div>
                        <p className="text-red-100 mb-6 max-w-md">
                            Transform any YouTube video into an interactive dictation lesson. 
                            Practice with real-world content from your favorite creators.
                        </p>
                        <Link
                            to="/dashboard/youtube"
                            className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200"
                        >
                            <Youtube className="w-5 h-5" />
                            <span>Try YouTube Dictation</span>
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                            <Youtube className="w-12 h-12 text-white" />
                        </div>
                    </div>
                </div>
            </div>
            {/* Quick Tips */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Study Tips for Today
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-white font-bold text-sm">
                                1
                            </span>
                        </div>
                        <p className="text-sm text-slate-700">
                            Practice 30 minutes daily for consistent improvement
                        </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-white font-bold text-sm">
                                2
                            </span>
                        </div>
                        <p className="text-sm text-slate-700">
                            Focus on your weakest skills first
                        </p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-white font-bold text-sm">
                                3
                            </span>
                        </div>
                        <p className="text-sm text-slate-700">
                            Review completed lessons regularly
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
