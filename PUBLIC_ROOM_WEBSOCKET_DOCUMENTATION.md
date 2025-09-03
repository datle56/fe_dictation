# Public Room WebSocket Event-Driven System Documentation

## 🚀 Architecture Overview

The Public Room system has been completely rewritten to use WebSocket event-driven architecture instead of REST API polling. This provides real-time updates and significantly better performance.

### System Flow
1. **Frontend**: Connects to WebSocket and subscribes to public room events
2. **Backend**: Automatically broadcasts events when rooms are created/updated/deleted
3. **Frontend**: Receives events and updates UI in real-time

---

## 🔌 WebSocket Connection

### Base WebSocket URL
```
ws://localhost:8080/api/v1/protected/pk/ws
```

### Authentication
- Include JWT token in Authorization header when establishing WebSocket connection
- Connection will be rejected if authentication fails

### Connection Types

#### 1. General Connection (Public Room Events)
```javascript
// Connect without room_id parameter for general/public room events
const socket = new WebSocket('ws://localhost:8080/api/v1/protected/pk/ws', [], {
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  }
});
```

#### 2. Room-Specific Connection (Game Events)
```javascript
// Connect with room_id parameter for room-specific events
const socket = new WebSocket('ws://localhost:8080/api/v1/protected/pk/ws?room_id=123', [], {
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  }
});
```

---

## 📨 WebSocket Message Format

All WebSocket messages follow this structure:

```javascript
{
  "type": "message_type",
  "data": {
    // Message-specific data
  },
  "room_id": 123,  // Optional, only for room-specific events
  "user_id": 456   // Optional, only for user-specific events
}
```

---

## 🏠 Public Room Events

### 1. Subscribe to Public Room Events

**Frontend → Backend**
```javascript
socket.send(JSON.stringify({
  "type": "subscribe_public_rooms",
  "data": {}
}));
```

**Backend → Frontend (Response)**
```javascript
{
  "type": "public_rooms_subscription_response",
  "data": {
    "success": true,
    "message": "Subscribed to public room events",
    "user_id": 123
  }
}
```

### 2. Get Public Rooms List (One-time)

**Frontend → Backend**
```javascript
socket.send(JSON.stringify({
  "type": "get_public_rooms",
  "data": {
    "page": 1,        // Optional, default: 1
    "limit": 10,      // Optional, default: 10, max: 100
    "category_id": 5  // Optional, filter by category
  }
}));
```

**Backend → Frontend (Response)**
```javascript
{
  "type": "public_rooms_response",
  "data": {
    "success": true,
    "rooms": [
      {
        "id": 1,
        "room_name": "English Challenge",
        "room_code": "ABC123",
        "host_user_id": 123,
        "category_id": 5,
        "lesson_id": 10,
        "max_players": 4,
        "current_players": 2,
        "room_status": "waiting",
        "game_mode": "dictation",
        "time_limit_seconds": 300,
        "is_public": true,
        "created_at": "2024-01-15T10:30:00Z",
        "lesson": {
          "id": 10,
          "title": "Basic Dictation",
          "description": "Learn basic dictation skills"
        },
        "participants": [
          {
            "id": 1,
            "user_id": 123,
            "current_score": 0,
            "is_ready": true,
            "is_host": true,
            "is_connected": true,
            "user": {
              "id": 123,
              "full_name": "John Doe"
            }
          }
        ]
      }
    ],
    "total_count": 25,
    "page": 1,
    "limit": 10
  }
}
```

### 3. Room Created Event (Auto-broadcast)

**Backend → Frontend (Auto-broadcast to all subscribed users)**
```javascript
{
  "type": "public_room_created",
  "data": {
    "room": {
      // Full room object (same structure as above)
    }
  }
}
```

### 4. Room Updated Event (Auto-broadcast)

**Backend → Frontend (Auto-broadcast to all subscribed users)**
```javascript
{
  "type": "public_room_updated",
  "data": {
    "room": {
      // Full updated room object
    }
  }
}
```

**Room updates are triggered by:**
- Player joins/leaves room
- Ready status changes
- Host transfers
- Player gets kicked
- Room settings updated
- Game status changes

### 5. Room Removed Event (Auto-broadcast)

**Backend → Frontend (Auto-broadcast to all subscribed users)**
```javascript
{
  "type": "public_room_removed",
  "data": {
    "room_id": 123,
    "room_code": "ABC123"
  }
}
```

### 6. Unsubscribe from Public Room Events

**Frontend → Backend**
```javascript
socket.send(JSON.stringify({
  "type": "unsubscribe_public_rooms",
  "data": {}
}));
```

**Backend → Frontend (Response)**
```javascript
{
  "type": "public_rooms_unsubscription_response",
  "data": {
    "success": true,
    "message": "Unsubscribed from public room events",
    "user_id": 123
  }
}
```

---

## 🎮 Room-Specific Events

These events require connecting with a specific `room_id` parameter.

### 1. Room State Updates

**Backend → Frontend (Auto-broadcast to room participants)**
```javascript
{
  "type": "room_update",
  "data": {
    "room": {
      // Full room object with updated state
    }
  }
}
```

### 2. Player Joined

**Backend → Frontend (Auto-broadcast to room participants)**
```javascript
{
  "type": "player_joined",
  "data": {
    "participant": {
      "id": 2,
      "user_id": 456,
      "current_score": 0,
      "is_ready": false,
      "is_host": false,
      "is_connected": true,
      "user": {
        "id": 456,
        "full_name": "Jane Smith"
      }
    }
  }
}
```

### 3. Player Left

**Backend → Frontend (Auto-broadcast to room participants)**
```javascript
{
  "type": "player_left",
  "data": {
    "user_id": 456
  }
}
```

### 4. Player Ready Status

**Frontend → Backend**
```javascript
socket.send(JSON.stringify({
  "type": "ready_status",
  "data": {
    "is_ready": true
  }
}));
```

**Backend → Frontend (Auto-broadcast to room participants)**
```javascript
{
  "type": "player_ready",
  "data": {
    "user_id": 456,
    "is_ready": true
  }
}
```

### 5. Game Start

**Frontend → Backend (Host only)**
```javascript
socket.send(JSON.stringify({
  "type": "start_game",
  "data": {}
}));
```

**Backend → Frontend (Auto-broadcast to room participants)**
```javascript
{
  "type": "game_start",
  "data": {
    "lesson": {
      "id": 10,
      "title": "Basic Dictation"
    },
    "challenges": [
      {
        "id": 1,
        "content": "Hello world",
        "audio_url": "/audio/hello.mp3"
      }
    ],
    "start_time": "2024-01-15T10:35:00Z"
  }
}
```

### 6. Challenge Submission

**Frontend → Backend**
```javascript
socket.send(JSON.stringify({
  "type": "challenge_submission",
  "data": {
    "challenge_id": 1,
    "user_input": "Hello world",
    "is_correct": true,
    "score_earned": 150,
    "time_taken_seconds": 8
  }
}));
```

**Backend → Frontend (Auto-broadcast to room participants)**
```javascript
{
  "type": "challenge_submission",
  "data": {
    "user_id": 456,
    "challenge_id": 1,
    "user_input": "Hello world",
    "is_correct": true,
    "score_earned": 150,
    "time_taken_seconds": 8,
    "current_score": 150
  }
}
```

### 7. Score Update

**Backend → Frontend (Auto-broadcast to room participants)**
```javascript
{
  "type": "score_update",
  "data": {
    "participants": [
      {
        "id": 1,
        "user_id": 123,
        "current_score": 200,
        "current_challenge_position": 2,
        "total_correct_answers": 2,
        "user": {
          "id": 123,
          "full_name": "John Doe"
        }
      }
    ]
  }
}
```

---

## 🔨 Frontend Implementation Guide

### 1. Basic Setup

```javascript
class PKWebSocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.publicRooms = [];
    this.currentRoom = null;
  }

  connect(token, roomId = null) {
    const baseUrl = 'ws://localhost:8080/api/v1/protected/pk/ws';
    const url = roomId ? `${baseUrl}?room_id=${roomId}` : baseUrl;
    
    this.socket = new WebSocket(url);
    
    // Set authorization header (implementation depends on WebSocket library)
    // For browsers, you might need to pass token via query params or use a library
    
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Subscribe to public room events if no specific room
      if (!roomId) {
        this.subscribeToPublicRooms();
      }
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
      this.attemptReconnect(token, roomId);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  handleMessage(message) {
    switch (message.type) {
      case 'public_room_created':
        this.handlePublicRoomCreated(message.data);
        break;
      case 'public_room_updated':
        this.handlePublicRoomUpdated(message.data);
        break;
      case 'public_room_removed':
        this.handlePublicRoomRemoved(message.data);
        break;
      case 'public_rooms_response':
        this.handlePublicRoomsResponse(message.data);
        break;
      case 'room_update':
        this.handleRoomUpdate(message.data);
        break;
      case 'player_joined':
        this.handlePlayerJoined(message.data);
        break;
      case 'player_left':
        this.handlePlayerLeft(message.data);
        break;
      case 'game_start':
        this.handleGameStart(message.data);
        break;
      case 'challenge_submission':
        this.handleChallengeSubmission(message.data);
        break;
      case 'score_update':
        this.handleScoreUpdate(message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  // Public room management
  subscribeToPublicRooms() {
    this.send({
      type: 'subscribe_public_rooms',
      data: {}
    });
  }

  getPublicRooms(page = 1, limit = 10, categoryId = null) {
    this.send({
      type: 'get_public_rooms',
      data: {
        page,
        limit,
        category_id: categoryId
      }
    });
  }

  // Event handlers
  handlePublicRoomCreated(data) {
    this.publicRooms.unshift(data.room);
    this.updateUI('room_created', data.room);
  }

  handlePublicRoomUpdated(data) {
    const index = this.publicRooms.findIndex(room => room.id === data.room.id);
    if (index !== -1) {
      this.publicRooms[index] = data.room;
      this.updateUI('room_updated', data.room);
    }
  }

  handlePublicRoomRemoved(data) {
    this.publicRooms = this.publicRooms.filter(room => room.id !== data.room_id);
    this.updateUI('room_removed', data);
  }

  handlePublicRoomsResponse(data) {
    if (data.success) {
      this.publicRooms = data.rooms;
      this.updateUI('rooms_loaded', data);
    }
  }

  // Utility methods
  send(message) {
    if (this.isConnected) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected');
    }
  }

  updateUI(eventType, data) {
    // Dispatch custom events or call UI update methods
    window.dispatchEvent(new CustomEvent('pk_room_event', {
      detail: { type: eventType, data }
    }));
  }

  attemptReconnect(token, roomId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect(token, roomId);
      }, 1000 * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
}
```

### 2. Usage Examples

#### Public Room List Page
```javascript
const wsManager = new PKWebSocketManager();

// Initialize WebSocket connection for public rooms
wsManager.connect(jwtToken);

// Load initial room list
wsManager.getPublicRooms(1, 10);

// Listen for room updates
window.addEventListener('pk_room_event', (event) => {
  const { type, data } = event.detail;
  
  switch (type) {
    case 'rooms_loaded':
      renderRoomList(data.rooms);
      break;
    case 'room_created':
      addRoomToList(data);
      break;
    case 'room_updated':
      updateRoomInList(data);
      break;
    case 'room_removed':
      removeRoomFromList(data.room_id);
      break;
  }
});

function renderRoomList(rooms) {
  const roomListElement = document.getElementById('room-list');
  roomListElement.innerHTML = '';
  
  rooms.forEach(room => {
    const roomElement = createRoomElement(room);
    roomListElement.appendChild(roomElement);
  });
}

function createRoomElement(room) {
  const element = document.createElement('div');
  element.className = 'room-card';
  element.id = `room-${room.id}`;
  element.innerHTML = `
    <h3>${room.room_name}</h3>
    <p>Code: ${room.room_code}</p>
    <p>Players: ${room.current_players}/${room.max_players}</p>
    <p>Status: ${room.room_status}</p>
    <button onclick="joinRoom('${room.room_code}')">Join</button>
  `;
  return element;
}
```

#### Game Room Page
```javascript
const wsManager = new PKWebSocketManager();

// Connect to specific room
wsManager.connect(jwtToken, roomId);

// Listen for game events
window.addEventListener('pk_room_event', (event) => {
  const { type, data } = event.detail;
  
  switch (type) {
    case 'room_update':
      updateRoomState(data.room);
      break;
    case 'player_joined':
      addPlayerToRoom(data.participant);
      break;
    case 'player_left':
      removePlayerFromRoom(data.user_id);
      break;
    case 'game_start':
      startGame(data);
      break;
    case 'challenge_submission':
      showChallengeResult(data);
      break;
    case 'score_update':
      updateScoreboard(data.participants);
      break;
  }
});

// Game actions
function setReady(isReady) {
  wsManager.send({
    type: 'ready_status',
    data: { is_ready: isReady }
  });
}

function submitChallenge(challengeId, userInput, isCorrect, scoreEarned, timeTaken) {
  wsManager.send({
    type: 'challenge_submission',
    data: {
      challenge_id: challengeId,
      user_input: userInput,
      is_correct: isCorrect,
      score_earned: scoreEarned,
      time_taken_seconds: timeTaken
    }
  });
}
```

---

## 📋 Migration Checklist

### Backend Changes ✅
- [x] Added WebSocket message types for public room events
- [x] Created global WebSocket connection management
- [x] Implemented event broadcasting system
- [x] Updated all PKRoomService methods to broadcast events
- [x] Wired up dependencies in main.go

### Frontend Changes Required
- [ ] Remove REST API calls for public room listing
- [ ] Implement WebSocket connection management
- [ ] Add event listeners for real-time updates
- [ ] Update UI components to handle WebSocket events
- [ ] Add reconnection logic for connection failures

### API Endpoints Status
- ✅ **Keep**: `GET /api/v1/pk/rooms/public` (for initial page load only)
- ✅ **Keep**: All other existing REST endpoints
- ✅ **New**: WebSocket events for real-time updates

---

## 🚨 Important Notes

1. **Initial Load**: Frontend should still call `GET /api/v1/pk/rooms/public` once when the page loads to get the initial snapshot
2. **Real-time Updates**: All subsequent updates come via WebSocket events
3. **Connection Management**: Implement proper reconnection logic for network failures
4. **Error Handling**: Handle WebSocket disconnections gracefully
5. **Performance**: WebSocket events are only sent for public rooms to reduce bandwidth
6. **Backward Compatibility**: All existing REST endpoints still work

---

## 🔧 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if JWT token is valid
   - Verify WebSocket URL is correct
   - Ensure server is running

2. **Not Receiving Events**
   - Confirm subscription to public room events
   - Check if room is actually public
   - Verify WebSocket connection is active

3. **Duplicate Events**
   - Ensure only one WebSocket connection per user
   - Check for multiple event listeners

### Debug Endpoints

```bash
# Check WebSocket connection status
GET /health/websocket

# Response:
{
  "success": true,
  "websocket": {
    "total_connections": 15,
    "active_rooms": 3,
    "global_connections": 12,
    "room_stats": {
      "1": 2,
      "2": 3,
      "3": 1
    }
  },
  "timestamp": 1642234567
}
```

This completes the WebSocket event-driven architecture for the Public Room system! 🎉
