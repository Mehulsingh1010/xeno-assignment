"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, Users, Mail, Target } from "lucide-react"

interface CampaignStats {
  _id: string
  name: string
  status: string
  audienceSize: number
  messagesSent: number
  messagesFailed: number
  messagesPending: number
  createdAt: string
  deliveryRate: number
}

interface OverallStats {
  totalCustomers: number
  totalOrders: number
  totalCampaigns: number
  totalRevenue: number
  avgOrderValue: number
  topSpendingCustomers: Array<{
    name: string
    email: string
    totalSpends: number
  }>
}

interface LoadingState {
  campaigns: boolean
  overview: boolean
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function AnalyticsPage() {
  const [campaignStats, setCampaignStats] = useState<CampaignStats[]>([])
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null)
  const [loading, setLoading] = useState<LoadingState>({
    campaigns: true,
    overview: true,
  })
  const [selectedPeriod, setSelectedPeriod] = useState("30")

  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod])

  const fetchAnalytics = async () => {
    // Reset loading states
    setLoading({ campaigns: true, overview: true })

    // Parallel API calls - both fire simultaneously
    const fetchCampaigns = async () => {
      try {
        const campaignResponse = await fetch("/api/analytics/campaigns")
        const campaigns = await campaignResponse.json()
        setCampaignStats(campaigns)
      } catch (error) {
        console.error("Error fetching campaign analytics:", error)
      } finally {
        setLoading(prev => ({ ...prev, campaigns: false }))
      }
    }

    const fetchOverview = async () => {
      try {
        const overallResponse = await fetch("/api/analytics/overview")
        const overall = await overallResponse.json()
        setOverallStats(overall)
      } catch (error) {
        console.error("Error fetching overview analytics:", error)
      } finally {
        setLoading(prev => ({ ...prev, overview: false }))
      }
    }

    // 🚀 Both API calls start simultaneously
    fetchCampaigns()
    fetchOverview()
  }

  const campaignPerformanceData = campaignStats.map((campaign) => ({
    name: campaign.name.substring(0, 15) + "...",
    sent: campaign.messagesSent,
    failed: campaign.messagesFailed,
    rate: campaign.deliveryRate,
  }))

  const deliveryStatusData = campaignStats.reduce(
    (acc, campaign) => {
      acc.sent += campaign.messagesSent
      acc.failed += campaign.messagesFailed
      acc.pending += campaign.messagesPending
      return acc
    },
    { sent: 0, failed: 0, pending: 0 },
  )

  const pieData = [
    { name: "Sent", value: deliveryStatusData.sent, color: "#00C49F" },
    { name: "Failed", value: deliveryStatusData.failed, color: "#FF8042" },
    { name: "Pending", value: deliveryStatusData.pending, color: "#FFBB28" },
  ]

  const LoadingSkeleton = ({ className = "" }: { className?: string }) => (
    <div className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse ${className}`} 
         style={{
           backgroundSize: '200% 100%',
           animation: 'shimmer 1.5s ease-in-out infinite'
         }} />
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Insights</h1>
          <p className="text-muted-foreground">Comprehensive view of your CRM performance</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedPeriod === "7" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("7")}
          >
            7 Days
          </Button>
          <Button
            variant={selectedPeriod === "30" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("30")}
          >
            30 Days
          </Button>
          <Button
            variant={selectedPeriod === "90" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("90")}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Overview Cards with Individual Loading States */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading.overview ? <LoadingSkeleton className="w-16 h-6" /> : overallStats?.totalCustomers || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active customer base</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading.overview ? <LoadingSkeleton className="w-20 h-6" /> : `₹${overallStats?.totalRevenue?.toLocaleString() || 0}`}
            </div>
            <p className="text-xs text-muted-foreground">
              From {loading.overview ? "..." : overallStats?.totalOrders || 0} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaigns Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading.campaigns ? <LoadingSkeleton className="w-12 h-6" /> : campaignStats.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading.campaigns ? "Loading..." : `${deliveryStatusData.sent} messages delivered`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading.overview ? <LoadingSkeleton className="w-16 h-6" /> : `₹${overallStats?.avgOrderValue?.toFixed(0) || 0}`}
            </div>
            <p className="text-xs text-muted-foreground">Per customer transaction</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaign Performance</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
          <TabsTrigger value="delivery">Message Delivery</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Messages sent vs failed by campaign</CardDescription>
              </CardHeader>
              <CardContent>
                {loading.campaigns ? (
                  <div className="w-full h-[300px] flex items-center justify-center">
                    <div className="space-y-3">
                      <LoadingSkeleton className="w-full h-4" />
                      <LoadingSkeleton className="w-3/4 h-4" />
                      <LoadingSkeleton className="w-full h-4" />
                      <LoadingSkeleton className="w-5/6 h-4" />
                      <div className="text-center text-sm text-gray-500 mt-4">Loading chart data...</div>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={campaignPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sent" fill="#00C49F" name="Sent" />
                      <Bar dataKey="failed" fill="#FF8042" name="Failed" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Success Rate</CardTitle>
                <CardDescription>Overall message delivery performance</CardDescription>
              </CardHeader>
              <CardContent>
                {loading.campaigns ? (
                  <div className="w-full h-[300px] flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-4 border-gray-200 animate-pulse"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>Latest campaign performance details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading.campaigns ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2 flex-1">
                        <LoadingSkeleton className="w-48 h-4" />
                        <LoadingSkeleton className="w-32 h-3" />
                      </div>
                      <div className="flex items-center gap-4">
                        <LoadingSkeleton className="w-16 h-6 rounded-full" />
                        <div className="text-right space-y-1">
                          <LoadingSkeleton className="w-12 h-4" />
                          <LoadingSkeleton className="w-16 h-3" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  campaignStats.slice(0, 5).map((campaign) => (
                    <div key={campaign._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{campaign.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {campaign.audienceSize} recipients • {new Date(campaign.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={campaign.status === "completed" ? "default" : "secondary"}>
                          {campaign.status}
                        </Badge>
                        <div className="text-right">
                          <p className="font-medium">{campaign.deliveryRate.toFixed(1)}%</p>
                          <p className="text-sm text-muted-foreground">delivery rate</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Spending Customers</CardTitle>
              <CardDescription>Your most valuable customers by total spend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading.overview ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <LoadingSkeleton className="w-8 h-8 rounded-full" />
                        <div className="space-y-2">
                          <LoadingSkeleton className="w-32 h-4" />
                          <LoadingSkeleton className="w-48 h-3" />
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <LoadingSkeleton className="w-16 h-5" />
                        <LoadingSkeleton className="w-12 h-3" />
                      </div>
                    </div>
                  ))
                ) : overallStats?.topSpendingCustomers?.slice(0, 10).map((customer, index) => (
                  <div key={customer.email} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{customer.name}</h4>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{customer.totalSpends.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">total spent</p>
                    </div>
                  </div>
                )) || <p className="text-center text-muted-foreground py-8">No customer data available</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Successfully Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading.campaigns ? <LoadingSkeleton className="w-16 h-8" /> : deliveryStatusData.sent}
                </div>
                <p className="text-sm text-muted-foreground">Messages delivered</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Failed Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading.campaigns ? <LoadingSkeleton className="w-16 h-8" /> : deliveryStatusData.failed}
                </div>
                <p className="text-sm text-muted-foreground">Messages failed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-600">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading.campaigns ? <LoadingSkeleton className="w-16 h-8" /> : deliveryStatusData.pending}
                </div>
                <p className="text-sm text-muted-foreground">Messages pending</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Timeline</CardTitle>
              <CardDescription>Message delivery performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.campaigns ? (
                <div className="w-full h-[300px] flex items-center justify-center">
                  <div className="space-y-3 w-full">
                    <LoadingSkeleton className="w-full h-4" />
                    <LoadingSkeleton className="w-4/5 h-4" />
                    <LoadingSkeleton className="w-full h-4" />
                    <LoadingSkeleton className="w-3/4 h-4" />
                    <div className="text-center text-sm text-gray-500 mt-4">Loading timeline chart...</div>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={campaignPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="rate" stroke="#8884d8" strokeWidth={2} name="Delivery Rate %" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}
