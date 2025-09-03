import { useEffect, useRef, useCallback } from "react";
import { HubConnectionBuilder, HubConnection, LogLevel, HubConnectionState } from "@microsoft/signalr";
import { GameRoomSettingsDTO } from "../types/multiplayer";

export function useGameRoomSignalR(
  onPlayerJoined?: (userId: string, userName: string) => void,
  onPlayerLeft?: (userId: string) => void,
  onSettingsUpdated?: (settings: GameRoomSettingsDTO) => void,
  onJoinFailed?: (message: string) => void,
  onRoomCreated?: (roomData: any) => void,
  onRoomClosed?: (roomId: string) => void,
  onRoomUpdated?: (roomData: any) => void,
  onLessonSelected?: (lessonId: string, lessonTitle: string, lessonData?: any) => void,
  onUpdateSettingsFailed?: (message: string) => void,
  onPlayerReady?: (roomId: string) => void,
  onPlayerKicked?: (roomId: string, kickedUserId: string) => void,
  onGameStarted?: (roomId: string) => void,
  onPlayerAnswered?: (answerData: any) => void
) {
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl("http://localhost:5285/hubs/gameRoom", {
        accessTokenFactory: () => localStorage.getItem('accessToken') || ""
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();
    connectionRef.current = connection;

    connection.on("PlayerJoined", (userId, userName) => {
      onPlayerJoined && onPlayerJoined(userId, userName);
    });
    connection.on("PlayerLeft", (userId) => {
      onPlayerLeft && onPlayerLeft(userId);
    });
    connection.on("SettingsUpdated", (settings) => {
      console.log("[SignalR] SettingsUpdated event received:", settings);
      console.log("[SignalR] SettingsUpdated event type:", typeof settings);
      console.log("[SignalR] SettingsUpdated event keys:", Object.keys(settings));
      onSettingsUpdated && onSettingsUpdated(settings);
    });
    connection.on("UpdateSettingsFailed", (message) => {
      console.error("[SignalR] UpdateSettingsFailed event received:", message);
      onUpdateSettingsFailed && onUpdateSettingsFailed(message);
    });
    connection.on("JoinFailed", (message) => {
      onJoinFailed && onJoinFailed(message);
    });
    connection.on("RoomCreated", (roomData) => {
      console.log("[SignalR] RoomCreated event received:", roomData);
      onRoomCreated && onRoomCreated(roomData);
    });
    connection.on("RoomClosed", (roomId) => {
      console.log("[SignalR] RoomClosed event received:", roomId);
      onRoomClosed && onRoomClosed(roomId);
    });
    connection.on("RoomUpdated", (roomData) => {
      console.log("[SignalR] RoomUpdated event received:", roomData);
      onRoomUpdated && onRoomUpdated(roomData);
    });
    // Lắng nghe sự kiện LessonSelected
    connection.on("LessonSelected", (lessonId, lessonTitle, lessonData) => {
      console.log("[SignalR] LessonSelected event received:", lessonId, lessonTitle, lessonData);
      onLessonSelected && onLessonSelected(lessonId, lessonTitle, lessonData);
    });

    // Lắng nghe sự kiện PlayerReady
    connection.on("PlayerReady", (roomId) => {
      console.log("[SignalR] PlayerReady event received:", roomId);
      onPlayerReady && onPlayerReady(roomId);
    });

    // Lắng nghe sự kiện PlayerKicked
    connection.on("PlayerKicked", (roomId, kickedUserId) => {
      console.log("[SignalR] PlayerKicked event received:", roomId, "kicked user:", kickedUserId);
      onPlayerKicked && onPlayerKicked(roomId, kickedUserId);
    });

    // Lắng nghe sự kiện GameStarted
    connection.on("GameStarted", (roomId) => {
      console.log("[SignalR] GameStarted event received:", roomId);
      onGameStarted && onGameStarted(roomId);
    });

    // Lắng nghe sự kiện PlayerAnswered
    connection.on("PlayerAnswered", (answerData) => {
      console.log("[SignalR] PlayerAnswered event received:", answerData);
      onPlayerAnswered && onPlayerAnswered(answerData);
    });

    // Lắng nghe sự kiện GameFinished
    connection.on("GameFinished", () => {
      console.log("[SignalR] GameFinished event received");
    });

    // Lắng nghe sự kiện GameResultSaved
    connection.on("GameResultSaved", (gameSessionId) => {
      console.log("[SignalR] GameResultSaved event received:", gameSessionId);
    });

    connection.on("TestResponse", (message) => {
      console.log("[SignalR] TestResponse received:", message);
    });

    connection.on("TestUpdateSettingsResponse", (message) => {
      console.log("[SignalR] TestUpdateSettingsResponse received:", message);
    });

    connection.start()
      .then(() => {
        console.log("[SignalR] Connected successfully");
        console.log("[SignalR] Connection state:", connection.state);
        console.log("[SignalR] Connection ID:", connection.connectionId);
      })
      .catch((error) => {
        console.error("[SignalR] Connection failed:", error);
      });
    return () => {
      connection.stop();
    };
    // eslint-disable-next-line
  }, []);

  const isConnected = () => connectionRef.current?.state === HubConnectionState.Connected;

  const joinRoom = useCallback(async (roomId: string, userId: string, userName: string) => {
    console.log("[SignalR] Attempting to join room:", roomId, userId, userName);
    console.log("[SignalR] Connection state:", connectionRef.current?.state);
    console.log("[SignalR] Is connected:", isConnected());
    
    if (isConnected()) {
      try {
        await connectionRef.current?.invoke("JoinRoom", roomId, userId, userName);
        console.log("[SignalR] Successfully joined room:", roomId, userId);
      } catch (error) {
        console.error("[SignalR] Failed to join room:", error);
      }
    } else {
      console.warn("SignalR not connected yet! joinRoom skipped.");
      // Retry after a short delay
      setTimeout(() => {
        if (isConnected()) {
          console.log("[SignalR] Retrying join room after delay...");
          connectionRef.current?.invoke("JoinRoom", roomId, userId, userName);
        }
      }, 1000);
    }
  }, []);

  const leaveRoom = useCallback(async (roomId: string, userId: string) => {
    if (isConnected()) {
      try {
        await connectionRef.current?.invoke("LeaveRoom", roomId, userId);
        console.log("[SignalR] Successfully left room:", roomId, userId);
      } catch (error) {
        console.error("[SignalR] Failed to leave room:", error);
      }
    } else {
      console.warn("SignalR not connected yet! leaveRoom skipped.");
    }
  }, []);

  const updateSettings = useCallback(async (roomId: string, settings: GameRoomSettingsDTO) => {
    if (isConnected()) {
      try {
        await connectionRef.current?.invoke("UpdateSettings", roomId, settings);
        console.log("[SignalR] UpdateSettings sent successfully:", settings);
      } catch (error) {
        console.error("[SignalR] Failed to update settings:", error);
        throw error;
      }
    } else {
      console.warn("SignalR not connected yet! updateSettings skipped.");
      throw new Error("SignalR not connected");
    }
  }, []);

  // Game events methods
  const submitAnswer = useCallback((roomId: string, data: {
    playerId: string;
    sentenceIndex: number;
    answer: string;
    score: number;
    isCorrect: boolean;
    timeSpent: number;
  }) => {
    if (isConnected()) {
      connectionRef.current?.invoke("SubmitAnswer", roomId, data);
    } else {
      console.warn("SignalR not connected yet! submitAnswer skipped.");
    }
  }, []);

  const startGame = useCallback((roomId: string, lessonId: string) => {
    if (isConnected()) {
      connectionRef.current?.invoke("StartGame", roomId, lessonId);
    } else {
      console.warn("SignalR not connected yet! startGame skipped.");
    }
  }, []);

  const nextSentence = useCallback((roomId: string) => {
    if (isConnected()) {
      connectionRef.current?.invoke("NextSentence", roomId);
    } else {
      console.warn("SignalR not connected yet! nextSentence skipped.");
    }
  }, []);



  const testConnection = useCallback(async () => {
    if (isConnected()) {
      try {
        await connectionRef.current?.invoke("TestConnection");
        console.log("[SignalR] TestConnection sent successfully");
      } catch (error) {
        console.error("[SignalR] TestConnection failed:", error);
      }
    } else {
      console.warn("SignalR not connected yet! testConnection skipped.");
    }
  }, []);

  const testUpdateSettings = useCallback(async (roomId: string) => {
    if (isConnected()) {
      try {
        await connectionRef.current?.invoke("TestUpdateSettings", roomId, "test-data");
        console.log("[SignalR] TestUpdateSettings sent successfully");
      } catch (error) {
        console.error("[SignalR] TestUpdateSettings failed:", error);
      }
    } else {
      console.warn("SignalR not connected yet! testUpdateSettings skipped.");
    }
  }, []);

  return {
    joinRoom,
    leaveRoom,
    updateSettings,
    submitAnswer,
    startGame,
    nextSentence,
    testConnection,
    testUpdateSettings,
    connection: connectionRef.current,
  };
} 