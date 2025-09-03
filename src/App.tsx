
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { ProgressProvider } from "./contexts/ProgressContext"
import { MultiplayerProvider } from "./contexts/MultiplayerContext"
import Layout from "./components/Layout"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import LessonSelection from "./pages/LessonSelection"
import DictationCategories from "./pages/DictationCategories"
import DictationLessons from "./pages/DictationLessons"
import ReadingLesson from "./pages/lessons/ReadingLesson"
import WritingLesson from "./pages/lessons/WritingLesson"
import ListeningLesson from "./pages/lessons/ListeningLesson"
import VocabularyPublic from "./pages/vocabulary/VocabularyPublic"
import VocabularyFlashcards from "./pages/vocabulary/VocabularyFlashcards"
import FlashcardDeck from "./pages/vocabulary/FlashcardDeck"
import GrammarLesson from "./pages/lessons/GrammarLesson"
import SpeakingLesson from "./pages/lessons/SpeakingLesson"
import DictationLesson from "./pages/lessons/DictationLesson"
import Profile from "./pages/Profile"
import CategoryLessons from "./pages/CategoryLessons"
import MultiplayerLobby from "./components/multiplayer/MultiplayerLobby"
import MultiplayerRoom from "./components/multiplayer/MultiplayerRoom"
import MultiplayerGame from "./components/multiplayer/MultiplayerGame"
import Analysis from "./pages/Analysis"
import YouTubeDictation from "./pages/YouTubeDictation"
import TestAPI from "./pages/TestAPI"

function App() {
    return (
        <Router>
            <AuthProvider>
                <ProgressProvider>
                    <MultiplayerProvider>
                        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/dashboard" element={<Layout />}>
                                <Route index element={<Dashboard />} />
                                <Route
                                    path="lessons/:skillType"
                                    element={<LessonSelection />}
                                />
                                <Route
                                    path="dictation"
                                    element={<DictationCategories />}
                                />
                                <Route
                                    path="dictation/:category"
                                    element={<DictationLessons />}
                                />
                                <Route
                                    path="dictation/category/:categoryTitle"
                                    element={<CategoryLessons />}
                                />
                                <Route
                                    path="youtube"
                                    element={<YouTubeDictation />}
                                />
                                <Route
                                    path="multiplayer"
                                    element={<MultiplayerLobby />}
                                />
                                <Route
                                    path="multiplayer/room/:roomId"
                                    element={<MultiplayerRoom />}
                                />
                                <Route
                                    path="multiplayer/game/:roomId"
                                    element={<MultiplayerGame />}
                                />
                                <Route path="vocabulary">
                                    <Route
                                        index
                                        element={<VocabularyPublic />}
                                    />
                                    <Route
                                        path="flashcards"
                                        element={<VocabularyFlashcards />}
                                    />
                                    <Route
                                        path="flashcards/:deckId"
                                        element={<FlashcardDeck />}
                                    />
                                </Route>
                                <Route
                                    path="lesson/reading/:lessonId"
                                    element={<ReadingLesson />}
                                />
                                <Route
                                    path="lesson/writing/:lessonId"
                                    element={<WritingLesson />}
                                />
                                <Route
                                    path="lesson/listening/:lessonId"
                                    element={<ListeningLesson />}
                                />
                                <Route
                                    path="lesson/grammar/:lessonId"
                                    element={<GrammarLesson />}
                                />
                                <Route
                                    path="lesson/speaking/:lessonId"
                                    element={<SpeakingLesson />}
                                />
                                <Route
                                    path="lesson/dictation/:lessonId"
                                    element={<DictationLesson />}
                                />
                                <Route path="analysis" element={<Analysis />} />
                                <Route path="test-api" element={<TestAPI />} />
                                <Route path="profile" element={<Profile />} />
                            </Route>
                        </Routes>
                        </div>
                    </MultiplayerProvider>
                </ProgressProvider>
            </AuthProvider>
        </Router>
    )
}

export default App
