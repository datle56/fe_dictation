import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { User, Target, Trophy, Clock, BookOpen, TrendingUp, Save } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { getOverallStats } = useProgress();
  const stats = getOverallStats();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    level: user?.level || 'intermediate',
    targetScore: user?.targetScore || 7.0
  });

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  const achievements = [
    { name: 'First Lesson', description: 'Complete your first lesson', earned: stats.totalLessons > 0 },
    { name: 'Dedicated Learner', description: 'Complete 5 lessons', earned: stats.completedLessons >= 5 },
    { name: 'High Achiever', description: 'Achieve average score of 8.0', earned: stats.averageScore >= 8.0 },
    { name: 'Consistent Practice', description: 'Complete 10 lessons', earned: stats.completedLessons >= 10 },
  ];

  const skillProgress = [
    { skill: 'Reading', progress: 75, color: 'bg-blue-500' },
    { skill: 'Writing', progress: 60, color: 'bg-green-500' },
    { skill: 'Listening', progress: 45, color: 'bg-purple-500' },
    { skill: 'Speaking', progress: 30, color: 'bg-red-500' },
    { skill: 'Vocabulary', progress: 80, color: 'bg-orange-500' },
    { skill: 'Grammar', progress: 55, color: 'bg-indigo-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Profile</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-white" />
              </div>
              
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Full Name"
                  />
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  <input
                    type="number"
                    step="0.5"
                    min="4.0"
                    max="9.0"
                    value={formData.targetScore}
                    onChange={(e) => setFormData({ ...formData, targetScore: parseFloat(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Target Score"
                  />
                  <button
                    onClick={handleSave}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-slate-800">{user?.fullName}</h2>
                  <p className="text-slate-600">{user?.email}</p>
                  <div className="flex items-center justify-center space-x-4 mt-4">
                    <div className="text-center">
                      <div className="text-sm text-slate-500">Level</div>
                      <div className="font-medium text-slate-800 capitalize">{user?.level}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-slate-500">Target</div>
                      <div className="font-medium text-slate-800">{user?.targetScore}</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">{stats.averageScore.toFixed(1)}</div>
              <div className="text-sm text-slate-600">Avg Score</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
              <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">{stats.completedLessons}</div>
              <div className="text-sm text-slate-600">Completed</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overall Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Learning Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Current Score</span>
                  <span className="text-sm font-bold text-slate-800">{stats.averageScore.toFixed(1)}/10</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(stats.averageScore / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Target Progress</span>
                  <span className="text-sm font-bold text-slate-800">{Math.min(100, (stats.averageScore / (user?.targetScore || 7)) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (stats.averageScore / (user?.targetScore || 7)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Skill Breakdown</h3>
            <div className="space-y-4">
              {skillProgress.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{skill.skill}</span>
                    <span className="text-sm text-slate-600">{skill.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`${skill.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${skill.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <div key={index} className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.earned 
                    ? 'border-yellow-300 bg-yellow-50' 
                    : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      achievement.earned ? 'bg-yellow-500' : 'bg-slate-300'
                    }`}>
                      <Trophy className={`w-5 h-5 ${achievement.earned ? 'text-white' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <h4 className={`font-medium ${achievement.earned ? 'text-yellow-800' : 'text-slate-600'}`}>
                        {achievement.name}
                      </h4>
                      <p className={`text-sm ${achievement.earned ? 'text-yellow-700' : 'text-slate-500'}`}>
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Study Statistics */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Study Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-slate-800">{stats.totalLessons}</div>
                <div className="text-sm text-slate-600">Total Lessons</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-slate-800">{Math.floor(stats.totalSentences * 2.5 / 60)}h</div>
                <div className="text-sm text-slate-600">Study Time</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-slate-800">{stats.totalSentences}</div>
                <div className="text-sm text-slate-600">Sentences Practiced</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;