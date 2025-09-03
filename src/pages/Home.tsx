import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  PenTool, 
  Headphones, 
  MessageSquare, 
  Mic,
  BookMarked,
  FileText,
  Star,
  Users,
  Trophy,
  Target,
  CheckCircle,
  ArrowRight,
  Play,
  Globe,
  Award,
  TrendingUp,
  Clock,
  Volume2,
  Zap,
  Heart,
  Shield,
  Sparkles
} from 'lucide-react';

const Home: React.FC = () => {
  const skills = [
    { 
      name: 'Dictation Practice', 
      icon: Mic, 
      path: '/dashboard/dictation', 
      color: 'from-sky-400 to-blue-500',
      description: 'Perfect your listening and writing accuracy with dictation exercises',
      lessons: 25,
      bgColor: 'bg-sky-50'
    },
    { 
      name: 'Reading', 
      icon: BookOpen, 
      path: '/lessons/reading', 
      color: 'from-emerald-400 to-teal-500',
      description: 'Master reading comprehension with interactive sentence-by-sentence practice',
      lessons: 15,
      bgColor: 'bg-emerald-50'
    },
    { 
      name: 'Writing', 
      icon: PenTool, 
      path: '/lessons/writing', 
      color: 'from-violet-400 to-purple-500',
      description: 'Improve your writing skills with AI-powered feedback and scoring',
      lessons: 12,
      bgColor: 'bg-violet-50'
    },
    { 
      name: 'Listening', 
      icon: Headphones, 
      path: '/lessons/listening', 
      color: 'from-cyan-400 to-blue-500',
      description: 'Enhance listening skills with authentic audio materials',
      lessons: 18,
      bgColor: 'bg-cyan-50'
    },
    { 
      name: 'Speaking', 
      icon: MessageSquare, 
      path: '/lessons/speaking', 
      color: 'from-rose-400 to-pink-500',
      description: 'Practice speaking with AI analysis and pronunciation feedback',
      lessons: 10,
      bgColor: 'bg-rose-50'
    },
    { 
      name: 'Vocabulary', 
      icon: BookMarked, 
      path: '/dashboard/vocabulary', 
      color: 'from-amber-400 to-orange-500',
      description: 'Build essential vocabulary for IELTS success',
      lessons: 25,
      bgColor: 'bg-amber-50'
    }
  ];

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Learning',
      description: 'Get personalized feedback and scoring with advanced AI technology',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Monitor your improvement with detailed analytics and performance metrics',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      icon: Globe,
      title: 'Comprehensive Coverage',
      description: 'Practice all IELTS skills with authentic materials and real exam scenarios',
      color: 'text-violet-600',
      bgColor: 'bg-violet-50'
    },
    {
      icon: Award,
      title: 'Expert Content',
      description: 'Learn from carefully crafted lessons designed by IELTS experts',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      score: '8.5',
      text: 'IELTS Master helped me achieve my target score! The AI feedback was incredibly helpful.',
      avatar: 'SC',
      country: 'Vietnam'
    },
    {
      name: 'Michael Rodriguez',
      score: '7.5',
      text: 'The dictation exercises really improved my listening skills. Highly recommended!',
      avatar: 'MR',
      country: 'Mexico'
    },
    {
      name: 'Priya Patel',
      score: '8.0',
      text: 'Interactive learning made studying enjoyable. The progress tracking kept me motivated.',
      avatar: 'PP',
      country: 'India'
    }
  ];

  const stats = [
    { number: '50,000+', label: 'Students Worldwide', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { number: '8.2', label: 'Average Score Improvement', icon: TrendingUp, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { number: '95%', label: 'Success Rate', icon: Trophy, color: 'text-violet-600', bgColor: 'bg-violet-50' },
    { number: '24/7', label: 'Available Learning', icon: Clock, color: 'text-cyan-600', bgColor: 'bg-cyan-50' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                IELTS Master
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors">Features</a>
              <a href="#skills" className="text-slate-600 hover:text-blue-600 transition-colors">Skills</a>
              <a href="#testimonials" className="text-slate-600 hover:text-blue-600 transition-colors">Reviews</a>
              <Link to="/login" className="text-slate-600 hover:text-blue-600 transition-colors">Sign In</Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                  <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-blue-700 text-sm font-medium">AI-Powered English Learning</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  Master Your
                  <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    English Skills
                  </span>
                  <span className="block text-slate-700">with Dictation</span>
                </h1>
                <p className="text-xl lg:text-2xl text-slate-600 leading-relaxed max-w-2xl">
                  Perfect your listening and writing through interactive dictation exercises. 
                  AI-powered feedback helps you achieve your IELTS goals faster.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-xl shadow-blue-500/25"
                >
                  <span>Start Learning Free</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white/80 backdrop-blur-sm border border-blue-200 text-blue-700 rounded-2xl font-semibold text-lg hover:bg-white transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </Link>
              </div>

              <div className="flex items-center space-x-8 text-slate-600">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full border-2 border-white"></div>
                    ))}
                  </div>
                  <span className="text-sm font-medium">50,000+ students</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-medium">4.9/5 rating</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 shadow-2xl shadow-blue-500/10">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl opacity-20"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl opacity-20"></div>
                
                <div className="relative space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-slate-800">Your Progress</h3>
                    <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-bold">8.5/9.0</span>
                  </div>
                  
                  <div className="space-y-4">
                    {['Dictation', 'Reading', 'Listening', 'Speaking'].map((skill, index) => (
                      <div key={skill} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-700 font-medium">{skill}</span>
                          <span className="text-slate-600">{8.0 + index * 0.2}/9.0</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-400 to-indigo-500 h-3 rounded-full transition-all duration-1000"
                            style={{ width: `${75 + index * 5}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t border-blue-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Weekly Goal</span>
                      <span className="text-emerald-600 font-semibold">12/15 lessons</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`w-16 h-16 ${stat.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-slate-800 mb-2">{stat.number}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
              <Heart className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-blue-700 text-sm font-medium">Why Choose Us</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
              Learn English the Smart Way
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI technology with proven teaching methods to deliver personalized learning experiences.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4 group">
                  <div className={`w-14 h-14 ${feature.bgColor} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-blue-500/10 p-8 border border-blue-100">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800">Live AI Feedback</h3>
                  <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium">Real-time</span>
                </div>
                
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <Volume2 className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-700 font-medium">Audio:</span>
                  </div>
                  <p className="text-slate-700 italic mb-4 text-lg">
                    "Climate change represents one of the most pressing challenges of our time."
                  </p>
                  <div className="text-sm text-slate-600 mb-2">Your transcription:</div>
                  <p className="text-slate-800 font-medium bg-white rounded-lg p-3 border border-blue-200">
                    "Climate change represents one of the most pressing challenges of our time."
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Accuracy</span>
                    <span className="text-sm font-bold text-emerald-600">100%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full w-full"></div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <p className="text-sm text-emerald-700">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Perfect! Excellent listening and writing accuracy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-violet-50 border border-violet-200 rounded-full mb-6">
              <Target className="w-4 h-4 text-violet-600 mr-2" />
              <span className="text-violet-700 text-sm font-medium">Master All Skills</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
              Complete English Learning Suite
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprehensive training across all English skills with interactive exercises and instant AI feedback.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skills.map((skill, index) => (
              <div key={index} className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg shadow-blue-500/5 border border-blue-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className={`w-16 h-16 bg-gradient-to-r ${skill.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <skill.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-slate-800 mb-3">{skill.name}</h3>
                <p className="text-slate-600 leading-relaxed mb-6">{skill.description}</p>
                
                <div className="flex items-center justify-between text-sm text-slate-500 mb-6">
                  <span>{skill.lessons} lessons</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>4.9</span>
                  </div>
                </div>

                <Link
                  to={skill.path}
                  className={`w-full ${skill.bgColor} text-slate-700 py-3 px-6 rounded-2xl hover:bg-opacity-80 transition-all font-medium text-center block group-hover:bg-gradient-to-r group-hover:${skill.color} group-hover:text-white`}
                >
                  Start Learning
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
              <Trophy className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-blue-700 text-sm font-medium">Success Stories</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-slate-800">
              Join Thousands of Successful Students
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              See how our students achieved their target IELTS scores with our AI-powered learning platform.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 hover:bg-white transition-all shadow-lg shadow-blue-500/5">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-slate-800">{testimonial.name}</h4>
                    <p className="text-slate-500 text-sm">{testimonial.country}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Trophy className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-600 font-bold">IELTS {testimonial.score}</span>
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed italic text-lg">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-500/90 to-indigo-600/90 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-20"></div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-white/90 border border-blue-200 rounded-full">
              <Zap className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-blue-700 text-sm font-medium">Ready to Start?</span>
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
              Achieve Your Target Score Today
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Join thousands of successful students and start your English learning journey with our AI-powered dictation platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/register"
                className="px-10 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="px-10 py-4 bg-white/20 backdrop-blur-sm border border-white/40 text-white rounded-2xl font-semibold text-lg hover:bg-white/30 transition-all duration-200"
              >
                Sign In
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-white/80">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Instant access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">IELTS Master</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Master your English skills with AI-powered dictation exercises and comprehensive IELTS preparation.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Learning</h4>
              <div className="space-y-2 text-slate-400">
                <a href="#" className="block hover:text-white transition-colors">Dictation Practice</a>
                <a href="#" className="block hover:text-white transition-colors">Reading Skills</a>
                <a href="#" className="block hover:text-white transition-colors">Listening Practice</a>
                <a href="#" className="block hover:text-white transition-colors">Speaking Training</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-slate-400">
                <a href="#" className="block hover:text-white transition-colors">Help Center</a>
                <a href="#" className="block hover:text-white transition-colors">Contact Us</a>
                <a href="#" className="block hover:text-white transition-colors">Community</a>
                <a href="#" className="block hover:text-white transition-colors">Blog</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-slate-400">
                <a href="#" className="block hover:text-white transition-colors">About Us</a>
                <a href="#" className="block hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="block hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="block hover:text-white transition-colors">Careers</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 IELTS Master. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;