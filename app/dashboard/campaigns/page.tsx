"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { RuleBuilder } from "@/components/rule-builder"
import { AIRuleBuilder } from "@/components/ai-rule-builder"
import { AIMessageSuggestions } from "@/components/ai-message-suggestions"
import {
  Plus,
  Users,
  Calendar,
  Send,
  Play,
  BarChart3,
  Sparkles,
  Edit,
  Trash2,
  RotateCcw,
  Mail,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Campaign, AudienceRule } from "@/lib/models/campaign"

interface CampaignAnalytics {
  sent: number
  delivered: number
  failed: number
  deliveryRate: number
  lastSent?: string
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [launchingCampaigns, setLaunchingCampaigns] = useState<Set<string>>(new Set())
  const [audienceSize, setAudienceSize] = useState(-1)
  const [formData, setFormData] = useState({
    name: "",
    message: "",
  })
  const [rules, setRules] = useState<AudienceRule[]>([])
  const [selectedAnalytics, setSelectedAnalytics] = useState<CampaignAnalytics | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [rerunningCampaigns, setRerunningCampaigns] = useState<Set<string>>(new Set())
  const [deletingCampaigns, setDeletingCampaigns] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/campaigns")
      const data = await response.json()
      setCampaigns(data.campaigns || [])
    } catch (error) {
      console.error("Error fetching campaigns:", error)
      toast({
        title: "Error",
        description: "Failed to fetch campaigns",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCampaignAnalytics = async (campaignId: string) => {
    setAnalyticsLoading(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/analytics`)
      const data = await response.json()

      if (response.ok) {
        setSelectedAnalytics(data.analytics)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch analytics",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
      toast({
        title: "Error",
        description: "Failed to fetch campaign analytics",
        variant: "destructive",
      })
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const handlePreview = async () => {
    if (rules.length === 0) return

    setIsPreviewLoading(true)
    try {
      const response = await fetch("/api/campaigns/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audienceRules: rules }),
      })

      const data = await response.json()
      if (response.ok) {
        setAudienceSize(data.audienceSize)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to preview audience",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error previewing audience:", error)
      toast({
        title: "Error",
        description: "Failed to preview audience",
        variant: "destructive",
      })
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rules.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one audience rule",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          message: formData.message,
          audienceRules: rules,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: `Campaign created successfully! Audience size: ${data.audienceSize} customers`,
        })
        setShowCreateForm(false)
        setFormData({ name: "", message: "" })
        setRules([])
        setAudienceSize(-1)
        fetchCampaigns()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create campaign",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating campaign:", error)
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCampaign) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/campaigns/${editingCampaign._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          message: formData.message,
          audienceRules: rules,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Campaign updated successfully!",
        })
        setEditingCampaign(null)
        setFormData({ name: "", message: "" })
        setRules([])
        fetchCampaigns()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update campaign",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating campaign:", error)
      toast({
        title: "Error",
        description: "Failed to update campaign",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLaunchCampaign = async (campaignId: string) => {
    setLaunchingCampaigns((prev) => new Set(prev).add(campaignId))

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/launch`, {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Campaign Launched!",
          description: data.message,
        })
        fetchCampaigns()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to launch campaign",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error launching campaign:", error)
      toast({
        title: "Error",
        description: "Failed to launch campaign",
        variant: "destructive",
      })
    } finally {
      setLaunchingCampaigns((prev) => {
        const newSet = new Set(prev)
        newSet.delete(campaignId)
        return newSet
      })
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    setDeletingCampaigns((prev) => new Set(prev).add(campaignId))

    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Campaign deleted successfully!",
        })
        fetchCampaigns()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete campaign",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting campaign:", error)
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      })
    } finally {
      setDeletingCampaigns((prev) => {
        const newSet = new Set(prev)
        newSet.delete(campaignId)
        return newSet
      })
    }
  }

  const handleRerunCampaign = async (campaignId: string) => {
    setRerunningCampaigns((prev) => new Set(prev).add(campaignId))

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/resend`, {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Campaign Re-launched!",
          description: data.message,
        })
        fetchCampaigns()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to re-run campaign",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error re-running campaign:", error)
      toast({
        title: "Error",
        description: "Failed to re-run campaign",
        variant: "destructive",
      })
    } finally {
      setRerunningCampaigns((prev) => {
        const newSet = new Set(prev)
        newSet.delete(campaignId)
        return newSet
      })
    }
  }

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setFormData({
      name: campaign.name,
      message: campaign.message,
    })
    setRules(campaign.audienceRules || [])
    setAudienceSize(campaign.audienceSize)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (showCreateForm || editingCampaign) {
    const isEditing = !!editingCampaign

    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{isEditing ? "Edit Campaign" : "Create Campaign"}</h1>
              <p className="text-gray-600 mt-2">
                {isEditing
                  ? "Update your campaign details and audience"
                  : "Define your audience and create a personalized campaign"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateForm(false)
                setEditingCampaign(null)
                setFormData({ name: "", message: "" })
                setRules([])
                setAudienceSize(-1)
              }}
            >
              Back to Campaigns
            </Button>
          </div>

          <form onSubmit={isEditing ? handleUpdateCampaign : handleSubmit} className="space-y-6">
            {/* Campaign Details */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
                <CardDescription>Basic information about your campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Win-back Campaign for Inactive Users"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Hi {name}, here's 10% off on your next order!"
                    rows={4}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Use {"{name}"} to personalize the message with customer names
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI Message Suggestions */}
            {!isEditing && (
              <AIMessageSuggestions onMessageSelected={(message) => setFormData({ ...formData, message })} />
            )}

            {/* Audience Rules */}
            <Tabs defaultValue="manual" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Manual Rule Builder</TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Rule Builder
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual">
                <RuleBuilder
                  rules={rules}
                  onRulesChange={setRules}
                  onPreview={handlePreview}
                  audienceSize={audienceSize}
                  isPreviewLoading={isPreviewLoading}
                />
              </TabsContent>

              <TabsContent value="ai">
                <div className="space-y-4">
                  <AIRuleBuilder onRulesGenerated={setRules} />
                  {rules.length > 0 && (
                    <RuleBuilder
                      rules={rules}
                      onRulesChange={setRules}
                      onPreview={handlePreview}
                      audienceSize={audienceSize}
                      isPreviewLoading={isPreviewLoading}
                    />
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingCampaign(null)
                  setFormData({ name: "", message: "" })
                  setRules([])
                  setAudienceSize(-1)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={(isEditing ? isUpdating : isCreating) || rules.length === 0}>
                {(isEditing ? isUpdating : isCreating) ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </div>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {isEditing ? "Update Campaign" : "Create Campaign"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-gray-600 mt-2">Create and manage your marketing campaigns</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Campaign History */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign History</CardTitle>
            <CardDescription>All your campaigns and their performance</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Audience Size</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No campaigns found. Create your first campaign to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    campaigns.map((campaign) => (
                      <TableRow key={campaign._id?.toString()}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{campaign.name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">{campaign.message}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>{campaign.audienceSize} customers</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {campaign.status === "draft" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleLaunchCampaign(campaign._id?.toString() || "")}
                                disabled={launchingCampaigns.has(campaign._id?.toString() || "")}
                              >
                                {launchingCampaigns.has(campaign._id?.toString() || "") ? (
                                  <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                    Launching...
                                  </div>
                                ) : (
                                  <>
                                    <Play className="w-3 h-3 mr-1" />
                                    Launch
                                  </>
                                )}
                              </Button>
                            )}

                            {/* Analytics Dialog */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => fetchCampaignAnalytics(campaign._id?.toString() || "")}
                                >
                                  <BarChart3 className="w-3 h-3 mr-1" />
                                  Stats
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Campaign Analytics</DialogTitle>
                                  <DialogDescription>Performance metrics for "{campaign.name}"</DialogDescription>
                                </DialogHeader>
                                {analyticsLoading ? (
                                  <div className="flex items-center justify-center py-8">
                                    <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                                  </div>
                                ) : selectedAnalytics ? (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <Mail className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-blue-600">{selectedAnalytics.sent}</p>
                                        <p className="text-sm text-gray-600">Sent</p>
                                      </div>
                                      <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-green-600">
                                          {selectedAnalytics.delivered}
                                        </p>
                                        <p className="text-sm text-gray-600">Delivered</p>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="text-center p-4 bg-red-50 rounded-lg">
                                        <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-red-600">{selectedAnalytics.failed}</p>
                                        <p className="text-sm text-gray-600">Failed</p>
                                      </div>
                                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <BarChart3 className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-gray-600">
                                          {selectedAnalytics.deliveryRate}%
                                        </p>
                                        <p className="text-sm text-gray-600">Success Rate</p>
                                      </div>
                                    </div>
                                    {selectedAnalytics.lastSent && (
                                      <div className="text-center text-sm text-gray-500">
                                        Last sent: {new Date(selectedAnalytics.lastSent).toLocaleString()}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-gray-500">No analytics data available</div>
                                )}
                              </DialogContent>
                            </Dialog>

                            {/* Edit Button */}
                            <Button variant="outline" size="sm" onClick={() => handleEditCampaign(campaign)}>
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>

                            {/* Re-run Button (for completed campaigns) */}
                            {(campaign.status === "completed" || campaign.status === "active") && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRerunCampaign(campaign._id?.toString() || "")}
                                disabled={rerunningCampaigns.has(campaign._id?.toString() || "")}
                              >
                                {rerunningCampaigns.has(campaign._id?.toString() || "") ? (
                                  <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                    Re-running...
                                  </div>
                                ) : (
                                  <>
                                    <RotateCcw className="w-3 h-3 mr-1" />
                                    Re-run
                                  </>
                                )}
                              </Button>
                            )}

                            {/* Delete Button */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 bg-transparent"
                                  disabled={deletingCampaigns.has(campaign._id?.toString() || "")}
                                >
                                  {deletingCampaigns.has(campaign._id?.toString() || "") ? (
                                    <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3 h-3" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{campaign.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteCampaign(campaign._id?.toString() || "")}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
