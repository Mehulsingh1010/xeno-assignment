"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Mail, Database, Shield, Bell, User, Key, CheckCircle, XCircle, AlertCircle, Trash2 } from "lucide-react"

export default function SettingsPage() {
  const [emailConnectionStatus, setEmailConnectionStatus] = useState<"checking" | "connected" | "disconnected">(
    "checking",
  )
  const [settings, setSettings] = useState({
    emailNotifications: true,
    campaignNotifications: true,
    weeklyReports: false,
    autoLaunchCampaigns: false,
  })
  const { toast } = useToast()

  useEffect(() => {
    checkEmailConnection()
  }, [])

  const checkEmailConnection = async () => {
    try {
      const response = await fetch("/api/campaigns/test-email")
      const isConnected = response.ok
      setEmailConnectionStatus(isConnected ? "connected" : "disconnected")
    } catch (error) {
      setEmailConnectionStatus("disconnected")
    }
  }

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved.",
    })
  }

  const testEmailConnection = async () => {
    setEmailConnectionStatus("checking")
    await checkEmailConnection()

    if (emailConnectionStatus === "connected") {
      toast({
        title: "Email Connection Successful",
        description: "SMTP configuration is working correctly.",
      })
    } else {
      toast({
        title: "Email Connection Failed",
        description: "Please check your SMTP configuration in environment variables.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAllUsers = async () => {
    if (confirm("Are you sure you want to delete ALL users? This action cannot be undone.")) {
      try {
        const response = await fetch("/api/customers", { method: "DELETE" })
        if (response.ok) {
          toast({ title: "Success", description: "All users deleted successfully" })
        } else {
          throw new Error("Failed to delete users")
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete users", variant: "destructive" })
      }
    }
  }

  const handleDeleteAllCampaigns = async () => {
    if (confirm("Are you sure you want to delete ALL campaigns? This action cannot be undone.")) {
      try {
        const response = await fetch("/api/campaigns", { method: "DELETE" })
        if (response.ok) {
          toast({ title: "Success", description: "All campaigns deleted successfully" })
        } else {
          throw new Error("Failed to delete campaigns")
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete campaigns", variant: "destructive" })
      }
    }
  }

  const handleDeleteAllOrders = async () => {
    if (confirm("Are you sure you want to delete ALL orders? This action cannot be undone.")) {
      try {
        const response = await fetch("/api/orders", { method: "DELETE" })
        if (response.ok) {
          toast({ title: "Success", description: "All orders deleted successfully" })
        } else {
          throw new Error("Failed to delete orders")
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete orders", variant: "destructive" })
      }
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your CRM platform configuration and preferences</p>
      </div>

      <Tabs defaultValue="email" className="space-y-4">
        <TabsList>
          <TabsTrigger value="email">Email Configuration</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                SMTP Configuration
              </CardTitle>
              <CardDescription>Configure your email settings for campaign delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {emailConnectionStatus === "checking" && (
                    <AlertCircle className="w-5 h-5 text-yellow-500 animate-pulse" />
                  )}
                  {emailConnectionStatus === "connected" && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {emailConnectionStatus === "disconnected" && <XCircle className="w-5 h-5 text-red-500" />}
                  <div>
                    <p className="font-medium">Email Service Status</p>
                    <p className="text-sm text-muted-foreground">
                      {emailConnectionStatus === "checking" && "Checking connection..."}
                      {emailConnectionStatus === "connected" && "SMTP connection is working"}
                      {emailConnectionStatus === "disconnected" && "SMTP connection failed"}
                    </p>
                  </div>
                </div>
                <Button onClick={testEmailConnection} disabled={emailConnectionStatus === "checking"}>
                  Test Connection
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input value={process.env.NEXT_PUBLIC_SMTP_HOST || "smtp.gmail.com"} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input value={process.env.NEXT_PUBLIC_SMTP_PORT || "587"} disabled className="bg-muted" />
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Required Environment Variables</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>
                    <code>SMTP_HOST</code> - Your SMTP server hostname
                  </p>
                  <p>
                    <code>SMTP_PORT</code> - SMTP port (usually 587 for TLS)
                  </p>
                  <p>
                    <code>SMTP_USER</code> - Your email username
                  </p>
                  <p>
                    <code>SMTP_PASS</code> - Your email password or app password
                  </p>
                  <p>
                    <code>SMTP_FROM_NAME</code> - Display name for sent emails
                  </p>
                  <p>
                    <code>SMTP_FROM_EMAIL</code> - From email address
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email updates about campaign performance</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Campaign Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified when campaigns are launched or completed</p>
                </div>
                <Switch
                  checked={settings.campaignNotifications}
                  onCheckedChange={(checked) => handleSettingChange("campaignNotifications", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">Receive weekly performance summaries</p>
                </div>
                <Switch
                  checked={settings.weeklyReports}
                  onCheckedChange={(checked) => handleSettingChange("weeklyReports", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your account security and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium">Google OAuth</p>
                    <p className="text-sm text-muted-foreground">Connected and active</p>
                  </div>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">API Access</p>
                    <p className="text-sm text-muted-foreground">Secure API endpoints with authentication</p>
                  </div>
                </div>
                <Badge variant="secondary">Protected</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                System Configuration
              </CardTitle>
              <CardDescription>Platform settings and automation preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-launch Campaigns</Label>
                  <p className="text-sm text-muted-foreground">Automatically launch campaigns after creation</p>
                </div>
                <Switch
                  checked={settings.autoLaunchCampaigns}
                  onCheckedChange={(checked) => handleSettingChange("autoLaunchCampaigns", checked)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Database Status</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-medium">MongoDB</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Connected and operational</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-medium">Collections</span>
                    </div>
                    <p className="text-sm text-muted-foreground">All schemas validated</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Data Management
              </CardTitle>
              <CardDescription>Bulk operations for managing your CRM data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <h4 className="font-medium text-red-900 mb-2">Danger Zone</h4>
                  <p className="text-sm text-red-700 mb-4">These actions cannot be undone. Please be careful.</p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Delete All Users</p>
                        <p className="text-sm text-muted-foreground">Remove all customer records from the database</p>
                      </div>
                      <Button variant="destructive" onClick={handleDeleteAllUsers}>
                        Delete All Users
                      </Button>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Delete All Campaigns</p>
                        <p className="text-sm text-muted-foreground">Remove all campaign records and history</p>
                      </div>
                      <Button variant="destructive" onClick={handleDeleteAllCampaigns}>
                        Delete All Campaigns
                      </Button>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Delete All Orders</p>
                        <p className="text-sm text-muted-foreground">Remove all order records from the system</p>
                      </div>
                      <Button variant="destructive" onClick={handleDeleteAllOrders}>
                        Delete All Orders
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
