import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  BookOpen, 
  MessageSquare, 
  Headphones, 
  Mic,
  Globe,
  Clock,
  Users,
  Star,
  ArrowRight,
  Video,
  Plane
} from 'lucide-react';
import { api } from '../utils/api';
import { titleToSlug } from '../utils/categorySlugMap';

const DictationCategories: React.FC = () => {
  const { skillName } = useParams<{ skillName?: string }>();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [skillName]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('=== Fetching dictation categories ===');
      
      // Use skill ID 4 for dictation as requested
      const response = await api.getCategoriesBySkill('4');
      console.log('=== Categories response ===', response);
      
      if (response.success && response.data) {
        console.log('API call successful, mapping categories...');
        // Map categories with icons and colors for UI
        const categoriesWithUI = response.data.map((category: any) => ({
          ...category,
          iconComponent: getCategoryIcon(category.icon || 'BookOpen'),
          color: getCategoryColor(category.id), // Add color based on category
          path: titleToSlug[category.title || category.name] || (category.title || category.name).toLowerCase().replace(/\s+/g, '-'), // Create path for routing
          name: category.title || category.name, // Ensure name field exists
          lessonsCount: category.lessonsCount || category.lessons_count || 0,
          duration: category.duration || 15 // Default duration
        }));
        setCategories(categoriesWithUI);
        console.log('Categories mapped successfully:', categoriesWithUI);
      } else {
        console.error('Categories API failed:', response);
        setError(response.message || 'Failed to load categories');
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to connect to server. Please try again.');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'Video': Video,
      'Headphones': Headphones,
      'Mic': Mic,
      'MessageSquare': MessageSquare,
      'Plane': Plane,
      'Clock': Clock,
      'BookOpen': BookOpen,
      'Globe': Globe
    };
    return iconMap[iconName] || BookOpen;
  };

  const getCategoryColor = (categoryId: string | number) => {
    // Generate consistent colors based on category ID
    const colors = [
      'from-blue-500 to-indigo-500',
      'from-green-500 to-emerald-500',
      'from-purple-500 to-pink-500',
      'from-orange-500 to-red-500',
      'from-cyan-500 to-blue-500',
      'from-yellow-500 to-orange-500',
      'from-rose-500 to-pink-500',
      'from-indigo-500 to-purple-500'
    ];
    const index = parseInt(categoryId.toString()) % colors.length;
    return colors[index];
  };



  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg text-slate-600">Loading categories...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{error}</div>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchCategories();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <div className="text-lg text-slate-600 mb-2">No categories found</div>
          <div className="text-sm text-slate-500">Try refreshing the page or contact support</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl lg:text-5xl font-bold text-slate-800">
          Dictation Practice
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Improve your listening and writing skills with our comprehensive dictation exercises. 
          Choose from various categories to match your learning goals and proficiency level.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-slate-800 mb-1">200+</div>
          <div className="text-sm text-slate-600">Total Lessons</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-slate-800 mb-1">50K+</div>
          <div className="text-sm text-slate-600">Active Learners</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-slate-800 mb-1">4.9</div>
          <div className="text-sm text-slate-600">Average Rating</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-slate-800 mb-1">24/7</div>
          <div className="text-sm text-slate-600">Available</div>
        </div>
      </div>

      {/* Categories Grid */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          Choose Your Dictation Category
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const IconComponent = category.iconComponent || BookOpen;
          return (
            <div key={category.id} className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(category.difficulty)}`}>
                    {category.difficulty}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-slate-800 mb-3">{category.name}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">{category.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{category.lessonsCount} lessons</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{category.duration} min</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Globe className="w-4 h-4" />
                      <span>{category.accent}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>4.8</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/dashboard/dictation/${category.path}?category_id=${category.id}`}
                  className="w-full bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 py-3 px-4 rounded-xl hover:from-slate-200 hover:to-slate-300 transition-all duration-200 font-medium text-center flex items-center justify-center space-x-2 group-hover:from-blue-500 group-hover:to-indigo-500 group-hover:text-white"
                >
                  <span>Explore Lessons</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Why Choose Our Dictation Practice?</h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Our dictation exercises are designed to improve your listening accuracy and writing skills simultaneously.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Analysis</h3>
            <p className="text-blue-100">Get detailed feedback on your accuracy with word-by-word analysis and suggestions for improvement.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Authentic Audio</h3>
            <p className="text-blue-100">Practice with real-world audio from various sources including news, conversations, and academic content.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Progressive Learning</h3>
            <p className="text-blue-100">Start with simple exercises and gradually progress to more challenging content as your skills improve.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DictationCategories;