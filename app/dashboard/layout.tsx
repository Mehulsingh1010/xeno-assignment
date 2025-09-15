"use client"

import type React from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ProtectedRoute } from "@/components/protected-route"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 overflow-hidden">
        <DashboardSidebar />
        <main className="ml-72 h-full overflow-auto">
          {/* Main content area with proper spacing */}
          <div className="min-h-full p-6 lg:p-8 xl:p-12">
            {/* Content wrapper with max width and centering */}
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}