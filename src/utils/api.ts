// Use direct API URL for development
const API_BASE_URL = "http://localhost:8080/api/v1"

// Utility function to get the full API URL
const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`
}

// Helper function to get authenticated headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('accessToken')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

// Types
interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  email: string
  full_name: string
  password: string
}

interface User {
  id: number
  email: string
  full_name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Skill {
  id: number
  name: string
  description: string
  icon: string
  color: string
  path: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Category {
  id: string
  title: string // maps to name from API
  name?: string // original name from API
  description: string
  difficulty?: string
  accent?: string
  duration?: number
  lessonsCount?: number
  icon?: string
  color?: string
  createdAt?: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
  path?: string
}

interface ApiResponse<T> {
  success: boolean
  status: number
  message: string
  error?: string
  data: T
}

interface LoginResponse {
  token: string
  user: User
}

// API functions
export const api = {
  // Authentication
  async login(data: LoginData): Promise<ApiResponse<LoginResponse>> {
    const response = await fetch(getApiUrl('/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async register(data: RegisterData): Promise<ApiResponse<User>> {
    const response = await fetch(getApiUrl('/auth/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // Skills
  async getSkills(): Promise<ApiResponse<Skill[]>> {
    try {
      const response = await fetch(getApiUrl('/skills/'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Skills API fetch error:', error)
      throw error
    }
  },

  // Categories
  async getCategoriesBySkill(skillId: string): Promise<ApiResponse<Category[]>> {
    try {
      const response = await fetch(getApiUrl(`/skills/${skillId}/categories`), {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      
      const data = await response.json()
      // Transform the response data to match the expected format
      if (data.success && data.data) {
        const transformedData = data.data.map((cat: any) => ({
          id: cat.id.toString(),
          title: cat.name,
          description: cat.description,
          difficulty: "medium", // Default value since not provided in new API
          accent: "neutral", // Default value since not provided in new API
          duration: 0, // Default value since not provided in new API
          lessonsCount: 0, // Default value since not provided in new API
          icon: cat.icon,
          color: cat.color
        }))
        return {
          ...data,
          data: transformedData
        }
      }
      return data
    } catch (error) {
      console.error('Categories API fetch error:', error)
      throw error
    }
  },

  // Lessons - Using working endpoint structure
  async getLessonsByCategory(categoryId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(getApiUrl(`/categories/${categoryId}/lessons`), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Lessons API fetch error:', error)
      throw error
    }
  },

  // PK Room API functions
  async getActiveRooms(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(getApiUrl('/pk/rooms/public'))
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Active rooms API fetch error:', error)
      throw error
    }
  },

  async getCurrentRoom(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(getApiUrl('/protected/pk/rooms/active'), {
        headers: getAuthHeaders(),
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Current room API fetch error:', error)
      throw error
    }
  },

  async createRoom(roomData: {
    room_name: string
    category_id: number
    lesson_id: number
    max_players: number
    game_mode: string
    time_limit_seconds: number
    is_public: boolean
    password: string
  }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(getApiUrl('/protected/pk/rooms'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(roomData),
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Create room API error:', error)
      throw error
    }
  },

  async joinRoom(roomCode: string, password: string = ""): Promise<ApiResponse<any>> {
    // This will be handled via WebSocket, but keeping for reference
    return Promise.resolve({
      success: true,
      status: 200,
      message: "Join request sent via WebSocket",
      data: null
    })
  },

  async leaveRoom(): Promise<ApiResponse<any>> {
    // This will be handled via WebSocket, but keeping for reference
    return Promise.resolve({
      success: true,
      status: 200,
      message: "Leave request sent via WebSocket", 
      data: null
    })
  },

  // WebSocket URL helper
  getWebSocketUrl(roomId?: string): string {
    const token = localStorage.getItem('accessToken')
    const wsBaseUrl = API_BASE_URL.replace('http', 'ws')
    
    if (roomId) {
      return `${wsBaseUrl}/protected/pk/ws?room_id=${roomId}&token=${encodeURIComponent(token || '')}`
    } else {
      return `${wsBaseUrl}/protected/pk/ws?token=${encodeURIComponent(token || '')}`
    }
  },

  // Legacy functions (keeping for compatibility but updating implementation)
  async getRoomDetailsInMemory(roomId: string): Promise<any> {
    try {
      const response = await fetch(getApiUrl(`/protected/pk/rooms/active`), {
        headers: getAuthHeaders(),
      })
      const data = await response.json()
      
      if (response.ok && data.data && data.data.id === roomId) {
        return {
          success: true,
          data: data.data
        }
      } else {
        return {
          success: false,
          status: 404,
          message: "Room not found"
        }
      }
    } catch (error) {
      console.error('Room details API fetch error:', error)
      return {
        success: false,
        message: "Network error"
      }
    }
  },

  async getLessonsByCategoryTitle(categoryTitle: string): Promise<any> {
    try {
      // First get categories to find the category ID
      const categoriesResponse = await this.getCategoriesBySkill("4") // Dictation skill ID
      if (categoriesResponse.success && categoriesResponse.data) {
        const category = categoriesResponse.data.find((cat: any) => cat.title === categoryTitle || cat.name === categoryTitle)
        if (category) {
          // Then get lessons by category ID
          const lessonsResponse = await this.getLessonsByCategory(category.id)
          return lessonsResponse
        }
      }
      
      return {
        success: false,
        message: "Category not found"
      }
    } catch (error) {
      console.error('Lessons by category title error:', error)
      return {
        success: false,
        message: "Network error"
      }
    }
  },

  async updateRoomSettings(roomId: string, settings: any): Promise<any> {
    // This will be handled via WebSocket/SignalR
    return Promise.resolve({
      success: true,
      data: settings
    })
  },

  async selectLessonInRoom(roomId: string, lessonId: string): Promise<any> {
    // This will be handled via WebSocket/SignalR
    return Promise.resolve({
      success: true,
      data: { lessonId }
    })
  },

  // Get lesson by ID - Real API implementation
  async getLessonById(lessonId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(getApiUrl(`/lessons/${lessonId}`), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Lesson detail API fetch error:', error)
      throw error
    }
  },

  async readyPlayerInMemory(roomId: string, isReady: boolean): Promise<any> {
    // This will be handled via WebSocket
    return Promise.resolve({
      success: true,
      data: { isReady }
    })
  },

  async kickPlayerInMemory(roomId: string, playerId: string): Promise<any> {
    // This will be handled via WebSocket  
    return Promise.resolve({
      success: true,
      data: { playerId, kicked: true }
    })
  },

  // Additional helper functions
  async createGameRoomInMemory(roomData: {
    roomName: string
    maxPlayers: number
    categoryId: string
  }): Promise<any> {
    // Convert to API format and call createRoom
    try {
      const response = await this.createRoom({
        room_name: roomData.roomName,
        category_id: parseInt(roomData.categoryId),
        lesson_id: 1, // Default lesson
        max_players: roomData.maxPlayers,
        game_mode: "dictation",
        time_limit_seconds: 300,
        is_public: true,
        password: ""
      })
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.room_code || response.data.id
        }
      } else {
        return {
          success: false,
          message: response.error || "Failed to create room"
        }
      }
    } catch (error) {
      return {
        success: false,
        message: "Network error"
      }
    }
  },

  async joinGameRoomInMemory(roomCode: string): Promise<any> {
    // This will be handled via WebSocket
    return Promise.resolve({
      success: true,
      data: roomCode,
      message: "Join request sent successfully"
    })
  },

  async getActiveRoomsInMemory(): Promise<any> {
    try {
      const response = await this.getActiveRooms()
      return response
    } catch (error) {
      return {
        success: false,
        message: "Network error"
      }
    }
  },
}

export type { LoginData, RegisterData, User, Skill, Category, ApiResponse, LoginResponse }
