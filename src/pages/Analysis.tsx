import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  Filter,
  BarChart3,
  PieChart,
  Clock,
  Target,
  Award,
  Brain,
  Zap,
  Calendar,
  Volume2,
  Eye,
  ChevronDown,
  ChevronUp,
  Star,
  Trophy,
  BookOpen,
  Headphones
} from 'lucide-react';
import { mockWordAnalysis, mockLessonAnalysis, mockOverallStats, WordAnalysis } from '../data/analysisData';

const Analysis: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('totalOccurrences');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedWord, setSelectedWord] = useState<WordAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'words' | 'lessons'>('overview');

  const filteredWords = useMemo(() => {
    return mockWordAnalysis
      .filter(word => {
        const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || word.category === selectedCategory;
        const matchesDifficulty = selectedDifficulty === 'all' || word.difficulty === selectedDifficulty;
        return matchesSearch && matchesCategory && matchesDifficulty;
      })
      .sort((a, b) => {
        const aValue = a[sortBy as keyof WordAnalysis] as number;
        const bValue = b[sortBy as keyof WordAnalysis] as number;
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      });
  }, [searchTerm, selectedCategory, selectedDifficulty, sortBy, sortOrder]);

  const categories = [...new Set(mockWordAnalysis.map(word => word.category))];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Learning Analytics
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Deep insights into your dictation learning journey with detailed word-level analysis and progress tracking
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-2">
          <div className="flex space-x-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'words', label: 'Word Analysis', icon: Brain },
              { id: 'lessons', label: 'Lesson History', icon: BookOpen }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Overall Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{mockOverallStats.totalWordsEncountered.toLocaleString()}</div>
                  <div className="text-blue-100 text-sm">Words Encountered</div>
                </div>
              </div>
              <div className="text-blue-100 text-sm">
                Across {mockOverallStats.totalLessonsCompleted} lessons
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{mockOverallStats.overallAccuracy}%</div>
                  <div className="text-green-100 text-sm">Overall Accuracy</div>
                </div>
              </div>
              <div className="text-green-100 text-sm">
                {mockOverallStats.averageTriesPerWord} avg tries per word
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{formatTime(mockOverallStats.totalStudyTime)}</div>
                  <div className="text-purple-100 text-sm">Total Study Time</div>
                </div>
              </div>
              <div className="text-purple-100 text-sm">
                {mockOverallStats.streakDays} day streak
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{mockOverallStats.masteredWords}</div>
                  <div className="text-orange-100 text-sm">Mastered Words</div>
                </div>
              </div>
              <div className="text-orange-100 text-sm">
                {mockOverallStats.improvingWords} improving
              </div>
            </div>
          </div>

          {/* Progress Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <PieChart className="w-6 h-6 mr-3 text-purple-600" />
                Word Difficulty Distribution
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Easy Words', count: 89, color: 'bg-green-500', percentage: 45 },
                  { label: 'Medium Words', count: 67, color: 'bg-yellow-500', percentage: 34 },
                  { label: 'Hard Words', count: 41, color: 'bg-red-500', percentage: 21 }
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700 font-medium">{item.label}</span>
                      <span className="text-slate-600">{item.count} words</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div 
                        className={`${item.color} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-3 text-green-600" />
                Learning Progress Trends
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-green-800">Improving Words</div>
                      <div className="text-sm text-green-600">Getting better over time</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{mockOverallStats.improvingWords}</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-red-800">Struggling Words</div>
                      <div className="text-sm text-red-600">Need more practice</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-red-600">{mockOverallStats.strugglingWords}</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-blue-800">Mastered Words</div>
                      <div className="text-sm text-blue-600">Consistently correct</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{mockOverallStats.masteredWords}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Words Tab */}
      {activeTab === 'words' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search words..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="totalOccurrences-desc">Most Encountered</option>
                <option value="averageTriesToCorrect-desc">Most Difficult</option>
                <option value="averageTriesToCorrect-asc">Easiest</option>
                <option value="word-asc">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Words Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWords.map((word, index) => (
              <div
                key={word.word}
                onClick={() => setSelectedWord(word)}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-800 mb-1">{word.word}</h3>
                    {word.phonetic && (
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-slate-500 text-sm">{word.phonetic}</span>
                        <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(word.difficulty)}`}>
                      {word.difficulty}
                    </span>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {getTrendIcon(word.improvementTrend)}
                    <span className="text-xs text-slate-500">{word.category}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total encounters:</span>
                    <span className="font-bold text-slate-800">{word.totalOccurrences}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Avg tries:</span>
                    <span className="font-bold text-slate-800">{word.averageTriesToCorrect.toFixed(1)}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-slate-500 mb-1">Success Rate by Attempt:</div>
                    <div className="grid grid-cols-4 gap-1">
                      <div className="text-center">
                        <div className="text-xs font-bold text-green-600">{word.correctOnFirstTry}</div>
                        <div className="text-xs text-slate-400">1st</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-bold text-yellow-600">{word.correctOnSecondTry}</div>
                        <div className="text-xs text-slate-400">2nd</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-bold text-orange-600">{word.correctOnThirdTry}</div>
                        <div className="text-xs text-slate-400">3rd</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-bold text-red-600">{word.correctAfterMultipleTries}</div>
                        <div className="text-xs text-slate-400">3+</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lessons Tab */}
      {activeTab === 'lessons' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                <Headphones className="w-6 h-6 mr-3 text-blue-600" />
                Recent Lesson Performance
              </h3>
            </div>
            <div className="divide-y divide-slate-200">
              {mockLessonAnalysis.map((lesson, index) => (
                <div key={lesson.lessonId} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-slate-800 mb-1">{lesson.lessonTitle}</h4>
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{lesson.category}</span>
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">{lesson.difficulty}</span>
                        <span>{new Date(lesson.completedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-800">{lesson.accuracy.toFixed(1)}%</div>
                      <div className="text-sm text-slate-600">Accuracy</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-lg font-bold text-slate-800">{lesson.correctWords}/{lesson.totalWords}</div>
                      <div className="text-xs text-slate-600">Words Correct</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-lg font-bold text-slate-800">{lesson.averageTriesPerWord.toFixed(1)}</div>
                      <div className="text-xs text-slate-600">Avg Tries</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-lg font-bold text-slate-800">{formatTime(lesson.timeSpent)}</div>
                      <div className="text-xs text-slate-600">Time Spent</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-lg font-bold text-slate-800">{Math.round(lesson.timeSpent / lesson.totalWords)}s</div>
                      <div className="text-xs text-slate-600">Per Word</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Word Detail Modal */}
      {selectedWord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-4xl font-bold text-slate-800 mb-2">{selectedWord.word}</h2>
                  {selectedWord.phonetic && (
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-slate-500 text-lg">{selectedWord.phonetic}</span>
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  {selectedWord.definition && (
                    <p className="text-slate-600 leading-relaxed mb-4">{selectedWord.definition}</p>
                  )}
                  <div className="flex items-center space-x-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getDifficultyColor(selectedWord.difficulty)}`}>
                      {selectedWord.difficulty}
                    </span>
                    <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                      {selectedWord.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedWord(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Eye className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Performance Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Total encounters:</span>
                      <span className="font-bold text-blue-800">{selectedWord.totalOccurrences}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Average tries:</span>
                      <span className="font-bold text-blue-800">{selectedWord.averageTriesToCorrect.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Success rate:</span>
                      <span className="font-bold text-blue-800">
                        {((selectedWord.correctOnFirstTry / selectedWord.totalOccurrences) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Learning Trend
                  </h3>
                  <div className="flex items-center space-x-3 mb-3">
                    {getTrendIcon(selectedWord.improvementTrend)}
                    <span className="font-semibold text-purple-800 capitalize">
                      {selectedWord.improvementTrend}
                    </span>
                  </div>
                  <p className="text-purple-700 text-sm">
                    Last encountered: {selectedWord.lastEncountered.toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Attempt Distribution</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-100 rounded-xl border border-green-200">
                    <div className="text-2xl font-bold text-green-700">{selectedWord.correctOnFirstTry}</div>
                    <div className="text-sm text-green-600 mt-1">First Try</div>
                    <div className="text-xs text-green-500 mt-1">
                      {((selectedWord.correctOnFirstTry / selectedWord.totalOccurrences) * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-center p-4 bg-yellow-100 rounded-xl border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-700">{selectedWord.correctOnSecondTry}</div>
                    <div className="text-sm text-yellow-600 mt-1">Second Try</div>
                    <div className="text-xs text-yellow-500 mt-1">
                      {((selectedWord.correctOnSecondTry / selectedWord.totalOccurrences) * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-100 rounded-xl border border-orange-200">
                    <div className="text-2xl font-bold text-orange-700">{selectedWord.correctOnThirdTry}</div>
                    <div className="text-sm text-orange-600 mt-1">Third Try</div>
                    <div className="text-xs text-orange-500 mt-1">
                      {((selectedWord.correctOnThirdTry / selectedWord.totalOccurrences) * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-center p-4 bg-red-100 rounded-xl border border-red-200">
                    <div className="text-2xl font-bold text-red-700">{selectedWord.correctAfterMultipleTries}</div>
                    <div className="text-sm text-red-600 mt-1">3+ Tries</div>
                    <div className="text-xs text-red-500 mt-1">
                      {((selectedWord.correctAfterMultipleTries / selectedWord.totalOccurrences) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;