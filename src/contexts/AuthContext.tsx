import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react"
import { api } from "../utils/api"

interface User {
    id: number
    email: string
    full_name: string
    is_active: boolean
    created_at: string
    updated_at: string
}

interface AuthContextType {
    user: User | null
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
    isAuthenticated: boolean
    updateProfile: (updates: Partial<User>) => void
    forceClear: () => void
    getValidAccessToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

// Export the hook after its implementation
export { useAuth }

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const savedUser = localStorage.getItem("ielts_user")
        const token = localStorage.getItem("accessToken")
        if (savedUser && token) {
            setUser(JSON.parse(savedUser))
        }
    }, [])

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await api.login({ email, password });

            if (response.success && response.data) {
                // Store the bearer token
                const token = response.data.token;
                localStorage.setItem("accessToken", token);

                // Store user data
                const userData = response.data.user;
                setUser(userData);
                localStorage.setItem("ielts_user", JSON.stringify(userData));
                return true;
            }
            console.error('Login failed:', response.message);
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }

    const logout = () => {
        setUser(null);
        localStorage.removeItem("ielts_user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("ielts_progress");
    }

    const forceClear = () => {
        localStorage.clear();
        setUser(null);
    }

    const updateProfile = (updates: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);
            localStorage.setItem("ielts_user", JSON.stringify(updatedUser));
        }
    }

    const getValidAccessToken = async (): Promise<string | null> => {
        return localStorage.getItem("accessToken");
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated: !!user,
                updateProfile,
                forceClear,
                getValidAccessToken
            }}>
            {children}
        </AuthContext.Provider>
    );
}
