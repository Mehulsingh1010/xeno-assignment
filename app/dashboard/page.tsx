"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Users, ShoppingCart, MessageSquare, TrendingUp, ArrowUp, Clock, Activity } from "lucide-react"

interface DashboardStats {
  totalCustomers: number
  totalOrders: number
  totalCampaigns: number
  totalRevenue: number
}

interface LoadingState {
  customers: boolean
  orders: boolean
  campaigns: boolean
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalOrders: 0,
    totalCampaigns: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState<LoadingState>({
    customers: true,
    orders: true,
    campaigns: true,
  })
  const [recentActivities, setRecentActivities] = useState<any[]>([])

  useEffect(() => {
    // Fetch all data and compile recent activities
    const fetchAllData = async () => {
      const activities: any[] = []

      try {
        // Fetch customers
        const customersRes = await fetch("/api/customers")
        const customersData = await customersRes.json()
        setStats(prev => ({ 
          ...prev, 
          totalCustomers: customersData.customers?.length || 0 
        }))
        
        // Add recent customers to activities
        if (customersData.customers?.length > 0) {
          const recentCustomers = customersData.customers
            .slice(-3) // Get last 3 customers
            .map((customer: any) => ({
              id: `customer-${customer.id}`,
              message: `New customer ${customer.name || 'Unknown'} registered`,
              time: new Date(customer.createdAt || Date.now()).toLocaleString(),
              type: "customer"
            }))
          activities.push(...recentCustomers)
        }
        
        setLoading(prev => ({ ...prev, customers: false }))
      } catch (error) {
        console.error("Error fetching customers:", error)
        setLoading(prev => ({ ...prev, customers: false }))
      }

      try {
        // Fetch orders
        const ordersRes = await fetch("/api/orders")
        const ordersData = await ordersRes.json()
        const totalRevenue = ordersData.orders?.reduce((sum: number, order: any) => sum + order.amount, 0) || 0
        
        setStats(prev => ({ 
          ...prev, 
          totalOrders: ordersData.orders?.length || 0,
          totalRevenue 
        }))

        // Add recent orders to activities
        if (ordersData.orders?.length > 0) {
          const recentOrders = ordersData.orders
            .slice(-3) // Get last 3 orders
            .map((order: any) => ({
              id: `order-${order.id}`,
              message: `Order #${order.id} ${order.status || 'completed'} - ₹${order.amount || 0}`,
              time: new Date(order.createdAt || Date.now()).toLocaleString(),
              type: "order"
            }))
          activities.push(...recentOrders)
        }

        setLoading(prev => ({ ...prev, orders: false }))
      } catch (error) {
        console.error("Error fetching orders:", error)
        setLoading(prev => ({ ...prev, orders: false }))
      }

      try {
        // Fetch campaigns
        const campaignsRes = await fetch("/api/campaigns")
        const campaignsData = await campaignsRes.json()
        setStats(prev => ({ 
          ...prev, 
          totalCampaigns: campaignsData.campaigns?.length || 0 
        }))

        // Add recent campaigns to activities
        if (campaignsData.campaigns?.length > 0) {
          const recentCampaigns = campaignsData.campaigns
            .slice(-2) // Get last 2 campaigns
            .map((campaign: any) => ({
              id: `campaign-${campaign.id}`,
              message: `Campaign "${campaign.name || 'Untitled'}" ${campaign.status || 'launched'}`,
              time: new Date(campaign.createdAt || Date.now()).toLocaleString(),
              type: "campaign"
            }))
          activities.push(...recentCampaigns)
        }

        setLoading(prev => ({ ...prev, campaigns: false }))
      } catch (error) {
        console.error("Error fetching campaigns:", error)
        setLoading(prev => ({ ...prev, campaigns: false }))
      }

      // Sort activities by most recent and limit to 5
      const sortedActivities = activities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5)
      
      setRecentActivities(sortedActivities)
    }

    fetchAllData()
  }, [])

  const statCards = [
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      change: "+12%",
      description: "Active customers in your database",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      loading: loading.customers,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      change: "+8%",
      description: "Orders processed this month",
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-50",
      loading: loading.orders,
    },
    {
      title: "Active Campaigns",
      value: stats.totalCampaigns,
      change: "+23%",
      description: "Marketing campaigns running",
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      loading: loading.campaigns,
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      change: "+15%",
      description: "Revenue generated this month",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      loading: loading.orders,
    },
  ]

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 -mx-6 -mt-6 px-6 py-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              Welcome back, {session?.user?.name?.split(" ")[0] || "User"}!
            </h1>
            <p className="text-gray-600">Here's what's happening with your CRM today</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">Today</div>
              <div className="text-xs text-gray-500">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Connected Design */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
          {statCards.map((stat, index) => (
            <div key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    {stat.loading ? (
                      <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                    ) : (
                      <>
                        <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                        <div className="flex items-center">
                          <ArrowUp className="w-3 h-3 text-green-600 mr-1" />
                          <span className="text-sm font-medium text-green-600">{stat.change}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">Common tasks to get you started</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <a
                href="/dashboard/customers"
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Add Customer</p>
                  <p className="text-sm text-gray-500">Create new customer profile</p>
                </div>
              </a>
              <a
                href="/dashboard/campaigns"
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50/50 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">New Campaign</p>
                  <p className="text-sm text-gray-500">Create marketing campaign</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">Latest updates from your CRM</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'customer' ? 'bg-blue-500' :
                      activity.type === 'order' ? 'bg-green-500' :
                      activity.type === 'campaign' ? 'bg-purple-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <Clock className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-xs text-gray-400">Activity will appear here as you use the system</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}