import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface MultiplayerRoom {
  id: string;
  room_name: string;
  room_code: string;
  host_user_id: string;
  // Add other room properties as needed
}

interface MultiplayerContextType {
  activeRoom: MultiplayerRoom | null;
  setActiveRoom: (room: MultiplayerRoom | null) => void;
  updateActiveRoom: (room: MultiplayerRoom | null) => void;
  clearActiveRoom: () => void;
  isInRoom: boolean;
}

const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined);

export const MultiplayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRoom, setActiveRoom] = useState<MultiplayerRoom | null>(null);

  const updateActiveRoom = useCallback((room: MultiplayerRoom | null) => {
    console.log('MultiplayerContext: Updating active room:', room?.room_name || 'null');
    setActiveRoom(room);
  }, []);

  const clearActiveRoom = useCallback(() => {
    console.log('MultiplayerContext: Clearing active room');
    setActiveRoom(null);
  }, []);

  // Check for active room on mount and when context is created
  useEffect(() => {
    const checkActiveRoom = async () => {
      try {
        // This will be handled by individual components that need to check for active rooms
        // The context just provides the state management
        console.log('MultiplayerContext: Initialized');
      } catch (error) {
        console.error('MultiplayerContext: Error checking active room:', error);
      }
    };

    checkActiveRoom();
  }, []);

  const value = {
    activeRoom,
    setActiveRoom,
    updateActiveRoom,
    clearActiveRoom,
    isInRoom: !!activeRoom,
  };

  return (
    <MultiplayerContext.Provider value={value}>
      {children}
    </MultiplayerContext.Provider>
  );
};

export const useMultiplayer = () => {
  const context = useContext(MultiplayerContext);
  if (context === undefined) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider');
  }
  return context;
};
