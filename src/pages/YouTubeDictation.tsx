import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Youtube, 
  Search, 
  Play, 
  Clock, 
  Eye, 
  Heart, 
  User,
  Calendar,
  Tag,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Globe
} from 'lucide-react';
import { recentYouTubeVideos, popularCategories, YouTubeVideo } from '../data/youtubeData';

const YouTubeDictation: React.FC = () => {
  const navigate = useNavigate();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleGetScript = async () => {
    if (!youtubeUrl.trim()) return;
    
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      alert('Please enter a valid YouTube URL');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call to get transcript
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to dictation lesson with YouTube video
      navigate(`/dashboard/lesson/dictation/youtube-${videoId}?youtube=${encodeURIComponent(youtubeUrl)}`);
    }, 2000);
  };

  const handleVideoClick = (video: YouTubeVideo) => {
    navigate(`/dashboard/lesson/dictation/${video.id}?youtube=${encodeURIComponent(video.youtubeUrl)}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredVideos = selectedCategory === 'All' 
    ? recentYouTubeVideos 
    : recentYouTubeVideos.filter(video => 
        video.tags.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()))
      );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-200 rounded-full mb-4">
            <Youtube className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-700 text-sm font-medium">YouTube Dictation Practice</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Learn with YouTube Videos
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Transform any YouTube video into an interactive dictation lesson. Practice listening skills with real-world content.
          </p>
        </div>

        {/* YouTube URL Input */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200 p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Youtube className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Add YouTube Video</h3>
              <p className="text-slate-600">Paste any YouTube URL to create an instant dictation lesson</p>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-6 py-4 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg bg-white/70 backdrop-blur-sm"
                />
                <Youtube className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400" />
              </div>
              
              <button
                onClick={handleGetScript}
                disabled={!youtubeUrl.trim() || isLoading}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing Video...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    <span>Get Script & Start Learning</span>
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-sm text-slate-600">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Search className="w-4 h-4 text-blue-600" />
                </div>
                <span>Auto Extract</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Play className="w-4 h-4 text-green-600" />
                </div>
                <span>Interactive</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <span>Track Progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Categories */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                selectedCategory === 'All'
                  ? 'border-slate-400 bg-slate-100'
                  : 'border-slate-200 hover:border-slate-300 bg-white/60'
              }`}
            >
              <div className="text-center">
                <Globe className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                <div className="font-semibold text-slate-800">All</div>
                <div className="text-xs text-slate-500">{recentYouTubeVideos.length} videos</div>
              </div>
            </button>
            {popularCategories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                  selectedCategory === category.name
                    ? 'border-slate-400 bg-slate-100'
                    : 'border-slate-200 hover:border-slate-300 bg-white/60'
                }`}
              >
                <div className="text-center">
                  <div className={`w-6 h-6 mx-auto mb-2 bg-gradient-to-r ${category.color} rounded-lg`}></div>
                  <div className="font-semibold text-slate-800">{category.name}</div>
                  <div className="text-xs text-slate-500">{category.count} videos</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Videos */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">Recent Learning Videos</h2>
            <span className="text-sm text-slate-500">{filteredVideos.length} videos available</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => handleVideoClick(video)}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-slate-200 to-slate-300">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/480x270/e2e8f0/64748b?text=${encodeURIComponent(video.title.slice(0, 20))}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                    {video.duration}
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(video.difficulty)}`}>
                      {video.difficulty}
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{video.description}</p>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{video.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>{video.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Globe className="w-3 h-3" />
                      <span>{video.accent}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{video.addedBy.avatar}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-800">{video.addedBy.name}</div>
                        <div className="text-xs text-slate-500 flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{video.addedAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {video.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl p-8 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Why YouTube Dictation?</h2>
            <p className="text-red-100 text-lg max-w-2xl mx-auto">
              Learn English with authentic content from your favorite YouTube creators
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Youtube className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real Content</h3>
              <p className="text-red-100">Practice with authentic videos from native speakers and real-world scenarios.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Auto Transcription</h3>
              <p className="text-red-100">Our AI automatically extracts and segments video content for optimal learning.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-red-100">Monitor your improvement with detailed analytics and personalized feedback.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeDictation;