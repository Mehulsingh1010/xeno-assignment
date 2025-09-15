"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Customers",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    name: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    name: "Campaigns",
    href: "/dashboard/campaigns",
    icon: MessageSquare,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  const getUserName = () => {
    return session?.user?.name?.split(" ")[0] || "User"
  }

  return (
    <div className="fixed left-4 top-4 bottom-4 z-50 flex w-64 flex-col bg-white/95 backdrop-blur-md shadow-2xl border border-gray-200/50 rounded-2xl overflow-hidden">
      {/* Logo Section */}
      <div className="flex h-16 items-center px-4 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/80 to-white/80">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">X</span>
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">Xeno CRM</span>
            <p className="text-xs text-gray-500 font-medium">Customer Management</p>
          </div>
        </Link>
      </div>

      {/* User Profile Card */}
      <div className="p-3 bg-gradient-to-br from-gray-50/50 to-white/50">
        <div className="rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 p-3 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/20 text-white font-medium text-sm">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{getUserName()}</p>
              <p className="text-xs text-blue-100/90 truncate">Admin Account</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Customer Button */}
      <div className="p-3">
        <Link href="/dashboard/customers">
          <Button className="w-full justify-between group bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md rounded-lg h-10">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="text-sm">Add Customer</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-80 group-hover:translate-x-1 transition-transform rotate-[-90deg]" />
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group ${
                isActive
                  ? "bg-blue-50/80 text-blue-600 shadow-sm before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-2/3 before:w-1 before:bg-blue-600 before:rounded-r-full"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/80"
              }`}
            >
              <div
                className={`p-1 rounded-md transition-colors ${
                  isActive 
                    ? "bg-blue-100/80 text-blue-600" 
                    : "bg-gray-100/80 text-gray-600 group-hover:bg-gray-200/80"
                }`}
              >
                <item.icon className="w-4 h-4" />
              </div>
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Profile Dropdown */}
      <div className="p-3 border-t border-gray-100/50 bg-gradient-to-br from-gray-50/50 to-white/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 h-auto p-2 hover:bg-gray-50/80 rounded-lg">
              <Avatar className="w-7 h-7">
                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                <AvatarFallback className="bg-blue-100 text-blue-700 font-medium text-xs">
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name || "User"}</p>
                <p className="text-xs text-gray-500 truncate">{session?.user?.email || ""}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Footer */}
        <div className="text-center mt-2">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Xeno CRM</p>
        </div>
      </div>
    </div>
  )
}