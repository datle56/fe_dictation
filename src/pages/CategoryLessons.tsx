import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
// import { getLessonsByCategoryTitle } from '../utils/api';
import { Play } from 'lucide-react';

const CategoryLessons = () => {
  const { categoryTitle } = useParams<{ categoryTitle: string }>();
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!categoryTitle) return;
    getLessonsByCategoryTitle(categoryTitle).then(res => {
      setLessons(res.data || []);
      setLoading(false);
    });
  }, [categoryTitle]);

  if (loading) return <div>Loading lessons...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-8 text-center text-slate-800">Lessons in "{categoryTitle}"</h2>
      <div className="grid gap-6">
        {lessons.map(lesson => (
          <div
            key={lesson.lessonId}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between hover:shadow-xl transition-all duration-200"
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-slate-800 mb-2 truncate">{lesson.title}</h3>
              <p className="text-slate-600 mb-3 line-clamp-2">{lesson.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">Level: {lesson.level}</span>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg">Accent: {lesson.accent}</span>
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg">Duration: {lesson.duration} min</span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/dashboard/lesson/dictation/${lesson.lessonId}`)}
              className="mt-4 md:mt-0 md:ml-6 flex items-center px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-semibold shadow hover:from-pink-700 hover:to-rose-700 transition-all duration-200 focus:ring-4 focus:ring-pink-300/30"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Lesson
            </button>
          </div>
        ))}
        {lessons.length === 0 && <div className="text-center text-slate-500 italic">No lessons found for this category.</div>}
      </div>
    </div>
  );
};

export default CategoryLessons; 