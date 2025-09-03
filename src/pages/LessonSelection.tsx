import React from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

const LessonSelection: React.FC = () => {
    const { skillType } = useParams<{ skillType: string }>()
    const navigate = useNavigate()

    // Redirect to new vocabulary section if skillType is vocabulary
    React.useEffect(() => {
        if (skillType === "vocabulary") {
            navigate("/dashboard/vocabulary")
        }
    }, [skillType, navigate])

    const lessons = {
        reading: [
            {
                id: "reading-1",
                title: "Climate Change Impact",
                level: "intermediate",
                sentences: 15,
                description:
                    "Learn about the effects of climate change on our planet.",
                topics: ["Environment", "Science", "Global Issues"],
            },
            {
                id: "reading-2",
                title: "Digital Technology",
                level: "advanced",
                sentences: 20,
                description: "Explore how technology is shaping our future.",
                topics: ["Technology", "Innovation", "Future"],
            },
        ],
        writing: [
            {
                id: "writing-1",
                title: "Essay Structure",
                level: "intermediate",
                sentences: 10,
                description:
                    "Learn how to structure academic essays effectively.",
                topics: ["Academic", "Writing", "Structure"],
            },
            {
                id: "writing-2",
                title: "Opinion Essays",
                level: "advanced",
                sentences: 12,
                description: "Practice writing compelling opinion essays.",
                topics: ["Opinion", "Argument", "Writing"],
            },
        ],
        listening: [
            {
                id: "listening-1",
                title: "Academic Lectures",
                level: "intermediate",
                sentences: 8,
                description: "Practice understanding academic lectures.",
                topics: ["Academic", "Lectures", "Education"],
            },
            {
                id: "listening-2",
                title: "News Reports",
                level: "advanced",
                sentences: 10,
                description: "Listen to and understand news reports.",
                topics: ["News", "Current Events", "Media"],
            },
        ],
        speaking: [
            {
                id: "speaking-1",
                title: "Personal Introduction",
                level: "beginner",
                sentences: 6,
                description:
                    "Practice introducing yourself and talking about personal topics.",
                topics: ["Personal", "Introduction", "Basic"],
            },
            {
                id: "speaking-2",
                title: "Describing Places and Events",
                level: "intermediate",
                sentences: 10,
                description:
                    "Learn to describe places, events, and experiences fluently.",
                topics: ["Description", "Events", "Experiences"],
            },
        ],
        grammar: [
            {
                id: "grammar-1",
                title: "Complex Sentence Structures",
                level: "intermediate",
                sentences: 15,
                description:
                    "Master advanced sentence patterns and structures.",
                topics: ["Syntax", "Complex Sentences", "Advanced"],
            },
            {
                id: "grammar-2",
                title: "Conditional Sentences",
                level: "advanced",
                sentences: 12,
                description: "Practice all types of conditional sentences.",
                topics: ["Conditionals", "Grammar Rules", "Practice"],
            },
        ],
    }

    const skillLessons = lessons[skillType as keyof typeof lessons] || []

    const getLevelColor = (level: string) => {
        switch (level) {
            case "beginner":
                return "bg-green-100 text-green-800"
            case "intermediate":
                return "bg-yellow-100 text-yellow-800"
            case "advanced":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getSkillTitle = () => {
        return (
            skillType?.charAt(0).toUpperCase() +
            skillType?.slice(1) +
            " Lessons"
        )
    }

    if (skillType === "vocabulary") {
        return null // Return null while redirecting
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center space-x-4 mb-8">
                <Link
                    to="/dashboard"
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">
                        {getSkillTitle()}
                    </h1>
                    <p className="text-slate-600 mt-1">
                        Choose a lesson to start practicing
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {skillLessons.map(lesson => (
                    <Link
                        key={lesson.id}
                        to={`/dashboard/lesson/${skillType}/${lesson.id}`}
                        className="block bg-white rounded-xl shadow-sm border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 p-6"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold text-slate-800">
                                {lesson.title}
                            </h3>
                            <span
                                className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(
                                    lesson.level
                                )}`}
                            >
                                {lesson.level}
                            </span>
                        </div>

                        <p className="text-slate-600 mb-4">
                            {lesson.description}
                        </p>

                        <div className="flex items-center justify-between text-sm">
                            <div className="space-y-1">
                                <div className="text-slate-500">
                                    {lesson.sentences} sentences
                                </div>
                                <div className="text-slate-500">
                                    {Math.round(lesson.sentences * 2.5)} min
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {lesson.topics.map(topic => (
                                    <span
                                        key={topic}
                                        className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs"
                                    >
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default LessonSelection
