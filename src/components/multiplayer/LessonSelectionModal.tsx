import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

interface LessonSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  onLessonSelected: (lesson: any) => void;
}

const LessonSelectionModal: React.FC<LessonSelectionModalProps> = ({
  isOpen,
  onClose,
  categoryId,
  onLessonSelected
}) => {
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && categoryId) {
      loadLessons();
    }
  }, [isOpen, categoryId]);

  const loadLessons = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.getLessonsByCategory(categoryId);
      if (response.success && response.data) {
        setLessons(response.data);
        if (response.data.length > 0) {
          setSelectedLesson(response.data[0].id.toString());
        }
      } else {
        setError('Failed to load lessons');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson) return;

    const lesson = lessons.find(l => l.id.toString() === selectedLesson);
    if (lesson) {
      onLessonSelected(lesson);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Select Lesson</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading lessons...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadLessons}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedLesson === lesson.id.toString()
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedLesson(lesson.id.toString())}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {lesson.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {lesson.description || 'No description available'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Level: {lesson.level || 'Intermediate'}</span>
                        <span>Duration: {lesson.duration || '5'}min</span>
                        <span>ID: {lesson.id}</span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="lesson"
                      value={lesson.id.toString()}
                      checked={selectedLesson === lesson.id.toString()}
                      onChange={() => setSelectedLesson(lesson.id.toString())}
                      className="ml-2"
                    />
                  </div>
                </div>
              ))}
            </div>

            {lessons.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                No lessons available for this category.
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedLesson || lessons.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Select Lesson
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LessonSelectionModal;