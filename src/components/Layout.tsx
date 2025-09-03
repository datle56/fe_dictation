import React, { useState } from "react"
import { Outlet, Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import Header from "./Header"
import Sidebar from "./Sidebar"

const Layout: React.FC = () => {
    const { isAuthenticated } = useAuth()
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />
            <div className="flex pt-16">
                <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
                <main
                    className={`flex-1 transition-all duration-300 ${
                        sidebarCollapsed ? "ml-16" : "ml-64"
                    } p-6`}
                >
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default Layout
