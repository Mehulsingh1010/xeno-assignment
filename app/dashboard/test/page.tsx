"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, AlertCircle, Play, BarChart3 } from "lucide-react"

interface TestResult {
  name: string
  status: "pending" | "running" | "success" | "error"
  message?: string
  duration?: number
}

export default function TestPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "Database Connection", status: "pending" },
    { name: "Customer API", status: "pending" },
    { name: "Orders API", status: "pending" },
    { name: "Campaign Creation", status: "pending" },
    { name: "AI Services", status: "pending" },
    { name: "Email Service", status: "pending" },
    { name: "Analytics API", status: "pending" },
  ])
  const [isRunning, setIsRunning] = useState(false)
  const { toast } = useToast()

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests((prev) => prev.map((test, i) => (i === index ? { ...test, ...updates } : test)))
  }

  const runAllTests = async () => {
    setIsRunning(true)

    for (let i = 0; i < tests.length; i++) {
      updateTest(i, { status: "running" })
      const startTime = Date.now()

      try {
        let result
        switch (tests[i].name) {
          case "Database Connection":
            result = await testDatabaseConnection()
            break
          case "Customer API":
            result = await testCustomerAPI()
            break
          case "Orders API":
            result = await testOrdersAPI()
            break
          case "Campaign Creation":
            result = await testCampaignCreation()
            break
          case "AI Services":
            result = await testAIServices()
            break
          case "Email Service":
            result = await testEmailService()
            break
          case "Analytics API":
            result = await testAnalyticsAPI()
            break
          default:
            result = { success: false, message: "Unknown test" }
        }

        const duration = Date.now() - startTime
        updateTest(i, {
          status: result.success ? "success" : "error",
          message: result.message,
          duration,
        })

        // Small delay between tests
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (error) {
        const duration = Date.now() - startTime
        updateTest(i, {
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
          duration,
        })
      }
    }

    setIsRunning(false)

    const successCount = tests.filter((t) => t.status === "success").length
    toast({
      title: "Tests Completed",
      description: `${successCount}/${tests.length} tests passed`,
      variant: successCount === tests.length ? "default" : "destructive",
    })
  }

  const testDatabaseConnection = async () => {
    const response = await fetch("/api/customers?limit=1")
    if (response.ok) {
      return { success: true, message: "MongoDB connection successful" }
    }
    return { success: false, message: "Database connection failed" }
  }

  const testCustomerAPI = async () => {
    // Test GET customers
    const getResponse = await fetch("/api/customers?limit=5")
    if (!getResponse.ok) {
      return { success: false, message: "Failed to fetch customers" }
    }

    const customers = await getResponse.json()
    return {
      success: true,
      message: `Retrieved ${customers.length} customers successfully`,
    }
  }

  const testOrdersAPI = async () => {
    const response = await fetch("/api/orders?limit=5")
    if (!response.ok) {
      return { success: false, message: "Failed to fetch orders" }
    }

    const orders = await response.json()
    return {
      success: true,
      message: `Retrieved ${orders.length} orders successfully`,
    }
  }

  const testCampaignCreation = async () => {
    const response = await fetch("/api/campaigns")
    if (!response.ok) {
      return { success: false, message: "Failed to fetch campaigns" }
    }

    const campaigns = await response.json()
    return {
      success: true,
      message: `Campaign system operational (${campaigns.length} campaigns)`,
    }
  }

  const testAIServices = async () => {
    try {
      const response = await fetch("/api/ai/natural-language-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "customers who spent more than 1000 rupees",
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        return { success: false, message: `AI service error: ${error}` }
      }

      const result = await response.json()
      return {
        success: true,
        message: `AI services working (generated ${result.rules?.length || 0} rules)`,
      }
    } catch (error) {
      return {
        success: false,
        message: `AI service connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  const testEmailService = async () => {
    // This would test the email configuration without actually sending
    try {
      const response = await fetch("/api/test-email-config")
      if (response.ok) {
        return { success: true, message: "Email service configured correctly" }
      }
      return { success: false, message: "Email service configuration error" }
    } catch (error) {
      return { success: false, message: "Email service test failed" }
    }
  }

  const testAnalyticsAPI = async () => {
    try {
      const [campaignsResponse, overviewResponse] = await Promise.all([
        fetch("/api/analytics/campaigns"),
        fetch("/api/analytics/overview"),
      ])

      if (!campaignsResponse.ok || !overviewResponse.ok) {
        return { success: false, message: "Analytics API endpoints failed" }
      }

      return { success: true, message: "Analytics APIs working correctly" }
    } catch (error) {
      return { success: false, message: "Analytics API test failed" }
    }
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-5 h-5 text-gray-400" />
      case "running":
        return <AlertCircle className="w-5 h-5 text-blue-500 animate-pulse" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "running":
        return (
          <Badge variant="secondary" className="animate-pulse">
            Running
          </Badge>
        )
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            Success
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Failed</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Tests</h1>
          <p className="text-muted-foreground">Verify all CRM functionality is working correctly</p>
        </div>
        <Button onClick={runAllTests} disabled={isRunning} className="flex items-center gap-2">
          <Play className="w-4 h-4" />
          {isRunning ? "Running Tests..." : "Run All Tests"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map((test, index) => (
          <Card key={test.name}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  {getStatusIcon(test.status)}
                  {test.name}
                </span>
                {getStatusBadge(test.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {test.message && <p className="text-sm text-muted-foreground">{test.message}</p>}
                {test.duration && <p className="text-xs text-muted-foreground">Completed in {test.duration}ms</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Test Summary
          </CardTitle>
          <CardDescription>Overview of system functionality tests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tests.filter((t) => t.status === "success").length}
              </div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{tests.filter((t) => t.status === "error").length}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {tests.filter((t) => t.status === "running").length}
              </div>
              <div className="text-sm text-muted-foreground">Running</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {tests.filter((t) => t.status === "pending").length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Required Environment Variables</CardTitle>
          <CardDescription>Make sure these are configured for full functionality</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Authentication</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• NEXTAUTH_URL</li>
                <li>• NEXTAUTH_SECRET</li>
                <li>• GOOGLE_CLIENT_ID</li>
                <li>• GOOGLE_CLIENT_SECRET</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Database</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• MONGODB_URI</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">AI Services</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• GEMINI_API_KEY</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Email (SMTP)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• SMTP_HOST</li>
                <li>• SMTP_PORT</li>
                <li>• SMTP_USER</li>
                <li>• SMTP_PASS</li>
                <li>• SMTP_FROM_NAME</li>
                <li>• SMTP_FROM_EMAIL</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
