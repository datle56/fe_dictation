import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../utils/api';

interface PKWebSocketHook {
  generalWs: WebSocket | null;
  roomWs: WebSocket | null;
  isGeneralConnected: boolean;
  isRoomConnected: boolean;
  connectGeneral: () => void;
  connectRoom: (roomId: string) => void;
  disconnectGeneral: () => void;
  disconnectRoom: () => void;
  joinRoom: (roomCode: string, password?: string) => void;
  leaveRoom: (roomId: string) => void;
  toggleReady: (isReady: boolean) => void;
  startGame: () => void;
  error: string | null;
}

export const usePKWebSocket = (
  onJoinRoomResponse?: (success: boolean, room?: any, error?: string) => void,
  onLeaveRoomResponse?: (success: boolean, message?: string) => void,
  onRoomUpdate?: (room: any) => void,
  onPlayerJoined?: (participant: any) => void,
  onPlayerLeft?: (userId: string) => void,
  onRoomDeleted?: (message: string) => void,
  onGameStarted?: (roomId: string) => void
): PKWebSocketHook => {
  const [generalWs, setGeneralWs] = useState<WebSocket | null>(null);
  const [roomWs, setRoomWs] = useState<WebSocket | null>(null);
  const [isGeneralConnected, setIsGeneralConnected] = useState(false);
  const [isRoomConnected, setIsRoomConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldReconnect, setShouldReconnect] = useState(true);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  const connectGeneral = useCallback(() => {
    try {
      if (generalWs && generalWs.readyState === WebSocket.OPEN) {
        return; // Already connected
      }

      const wsUrl = api.getWebSocketUrl(); // General WebSocket without room_id
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('🔌 General WebSocket connected');
        setIsGeneralConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log(`📥 General WS: ${message.type}`, message.data);

          switch (message.type) {
            case 'join_room_response':
              if (onJoinRoomResponse) {
                if (message.data.success) {
                  onJoinRoomResponse(true, message.data.room);
                } else {
                  onJoinRoomResponse(false, undefined, message.data.error);
                }
              }
              break;
            case 'active_room_response':
              if (message.data.success && message.data.room && onRoomUpdate) {
                onRoomUpdate(message.data.room);
              }
              break;
            default:
              console.log('📥 General WS unhandled message:', message);
          }
        } catch (error) {
          console.log('📥 General WS Raw:', event.data);
        }
      };

      ws.onclose = () => {
        console.log('❌ General WebSocket disconnected');
        setIsGeneralConnected(false);
        setGeneralWs(null);
        // Auto-reconnect after 3 seconds only if should reconnect
        if (shouldReconnect) {
          setTimeout(() => {
            if (shouldReconnect && (!generalWs || generalWs.readyState === WebSocket.CLOSED)) {
              connectGeneral();
            }
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.log('🚨 General WebSocket error:', error);
        setError('General WebSocket connection error');
      };

      setGeneralWs(ws);
    } catch (err) {
      console.error('Failed to connect general WebSocket:', err);
      setError('Failed to establish general connection');
    }
  }, [generalWs, onJoinRoomResponse, onRoomUpdate]);

  const connectRoom = useCallback((roomId: string) => {
    try {
      if (roomWs && roomWs.readyState === WebSocket.OPEN) {
        roomWs.close(); // Close existing connection
      }

      const wsUrl = api.getWebSocketUrl(roomId);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('🔌 Room WebSocket connected and authenticated');
        setIsRoomConnected(true);
        setCurrentRoomId(roomId);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log(`📥 Room WS: ${message.type}`, message.data);

          switch (message.type) {
            case 'room_update':
              if (onRoomUpdate) {
                // Refresh room info when we get updates
                setTimeout(() => {
                  // This would normally trigger a room data refresh
                  console.log('Room update received, should refresh room data');
                }, 500);
              }
              break;
            case 'leave_room_response':
              if (onLeaveRoomResponse) {
                if (message.data.success) {
                  onLeaveRoomResponse(true, message.data.message);
                } else {
                  onLeaveRoomResponse(false, message.data.error);
                }
              }
              break;
            case 'player_joined':
              if (onPlayerJoined) {
                onPlayerJoined(message.data.participant);
              }
              break;
            case 'player_left':
              if (onPlayerLeft) {
                onPlayerLeft(message.data.user_id);
              }
              break;
            case 'room_deleted':
              if (onRoomDeleted) {
                onRoomDeleted(message.data.message);
              }
              disconnectRoom();
              break;
            case 'game_started':
              if (onGameStarted) {
                onGameStarted(roomId);
              }
              break;
            default:
              console.log('📥 Room WS unhandled message:', message);
          }
        } catch (error) {
          console.log('📥 Room WS Raw:', event.data);
        }
      };

      ws.onclose = () => {
        console.log('❌ Room WebSocket disconnected');
        setIsRoomConnected(false);
        setRoomWs(null);
        setCurrentRoomId(null);
      };

      ws.onerror = (error) => {
        console.log('🚨 Room WebSocket error:', error);
        setError('Room WebSocket connection error');
      };

      setRoomWs(ws);
    } catch (err) {
      console.error('Failed to connect room WebSocket:', err);
      setError('Failed to establish room connection');
    }
  }, [roomWs, onRoomUpdate, onLeaveRoomResponse, onPlayerJoined, onPlayerLeft, onRoomDeleted, onGameStarted]);

  const disconnectGeneral = useCallback(() => {
    if (generalWs) {
      generalWs.close();
      setGeneralWs(null);
      setIsGeneralConnected(false);
    }
  }, [generalWs]);

  const disconnectRoom = useCallback(() => {
    if (roomWs) {
      roomWs.close();
      setRoomWs(null);
      setIsRoomConnected(false);
      setCurrentRoomId(null);
    }
  }, [roomWs]);

  const joinRoom = useCallback((roomCode: string, password: string = "") => {
    if (!generalWs || generalWs.readyState !== WebSocket.OPEN) {
      console.log('❌ General WebSocket not connected');
      return;
    }

    generalWs.send(JSON.stringify({
      type: "join_room",
      data: {
        room_code: roomCode,
        password: password,
      },
    }));
    console.log(`🔄 Joining room: ${roomCode}...`);
  }, [generalWs]);

  const leaveRoom = useCallback((roomId: string) => {
    if (!roomWs || roomWs.readyState !== WebSocket.OPEN) {
      console.log('❌ Room WebSocket not connected');
      return;
    }

    roomWs.send(JSON.stringify({
      type: "leave_room",
      data: { room_id: roomId },
    }));
    console.log(`🔄 Leaving room: ${roomId}...`);
  }, [roomWs]);

  const toggleReady = useCallback((isReady: boolean) => {
    if (!roomWs || roomWs.readyState !== WebSocket.OPEN) {
      console.log('❌ Room WebSocket not connected');
      return;
    }

    roomWs.send(JSON.stringify({
      type: "ready_status",
      data: { is_ready: isReady },
    }));
    console.log(`🎯 Set ready status: ${isReady}`);
  }, [roomWs]);

  const startGame = useCallback(() => {
    if (!roomWs || roomWs.readyState !== WebSocket.OPEN) {
      console.log('❌ Room WebSocket not connected');
      return;
    }

    roomWs.send(JSON.stringify({
      type: "start_game",
      data: {},
    }));
    console.log('🎮 Starting game...');
  }, [roomWs]);

  // Auto-connect general WebSocket on mount
  useEffect(() => {
    connectGeneral();
    
    return () => {
      setShouldReconnect(false); // Stop reconnection attempts
      disconnectGeneral();
      disconnectRoom();
    };
  }, []); // Empty dependency array for mount/unmount only

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (generalWs) {
        generalWs.close();
      }
      if (roomWs) {
        roomWs.close();
      }
    };
  }, [generalWs, roomWs]);

  return {
    generalWs,
    roomWs,
    isGeneralConnected,
    isRoomConnected,
    connectGeneral,
    connectRoom,
    disconnectGeneral,
    disconnectRoom,
    joinRoom,
    leaveRoom,
    toggleReady,
    startGame,
    error,
  };
};
