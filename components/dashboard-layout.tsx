"use client"

import type React from "react"
import { DashboardSidebar } from "./dashboard-sidebar"
import { ProtectedRoute } from "./protected-route"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
