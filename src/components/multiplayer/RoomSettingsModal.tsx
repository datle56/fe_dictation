import React, { useState } from 'react';

interface RoomSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings?: {
    timeLimit: number;
    maxRetries: number;
    showRealTimeScore: boolean;
    allowHints: boolean;
  };
  onSettingsUpdated: (settings: any) => void;
}

const RoomSettingsModal: React.FC<RoomSettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSettingsUpdated
}) => {
  const [settings, setSettings] = useState({
    timeLimit: currentSettings?.timeLimit || 600, // 10 minutes default
    maxRetries: currentSettings?.maxRetries || 2,
    showRealTimeScore: currentSettings?.showRealTimeScore ?? true,
    allowHints: currentSettings?.allowHints ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSettingsUpdated(settings);
    onClose();
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Room Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Limit per Sentence (seconds)
            </label>
            <input
              type="number"
              min="30"
              max="300"
              value={settings.timeLimit}
              onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">30-300 seconds</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Retries per Sentence
            </label>
            <input
              type="number"
              min="0"
              max="5"
              value={settings.maxRetries}
              onChange={(e) => handleInputChange('maxRetries', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">0-5 retries</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Show Real-time Score
              </label>
              <input
                type="checkbox"
                checked={settings.showRealTimeScore}
                onChange={(e) => handleInputChange('showRealTimeScore', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Allow Hints
              </label>
              <input
                type="checkbox"
                checked={settings.allowHints}
                onChange={(e) => handleInputChange('allowHints', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          </div>

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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Update Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomSettingsModal;