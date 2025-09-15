"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AIMessageSuggestionsProps {
  onMessageSelected: (message: string) => void
}

export function AIMessageSuggestions({ onMessageSelected }: AIMessageSuggestionsProps) {
  const [campaignObjective, setCampaignObjective] = useState("")
  const [audienceDescription, setAudienceDescription] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const { toast } = useToast()

  const handleGenerateSuggestions = async () => {
    if (!campaignObjective.trim() || !audienceDescription.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both campaign objective and audience description",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai/message-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignObjective,
          audienceDescription,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuggestions(data.messages)
        toast({
          title: "Messages Generated!",
          description: "AI has created 3 message variants for your campaign",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to generate message suggestions",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating message suggestions:", error)
      toast({
        title: "Error",
        description: "Failed to generate message suggestions",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyMessage = async (message: string, index: number) => {
    try {
      await navigator.clipboard.writeText(message)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      })
    } catch (error) {
      console.error("Error copying message:", error)
    }
  }

  const handleUseMessage = (message: string) => {
    onMessageSelected(message)
    toast({
      title: "Message Applied!",
      description: "The selected message has been added to your campaign",
    })
  }

  return (
    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <Sparkles className="w-5 h-5" />
          AI Message Suggestions
        </CardTitle>
        <CardDescription>Get AI-powered message variants tailored to your campaign goals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="campaign-objective">Campaign Objective</Label>
            <Input
              id="campaign-objective"
              value={campaignObjective}
              onChange={(e) => setCampaignObjective(e.target.value)}
              placeholder="e.g., Win back inactive customers"
            />
          </div>
          <div>
            <Label htmlFor="audience-description">Audience Description</Label>
            <Input
              id="audience-description"
              value={audienceDescription}
              onChange={(e) => setAudienceDescription(e.target.value)}
              placeholder="e.g., High-value customers who haven't visited recently"
            />
          </div>
        </div>

        <Button
          onClick={handleGenerateSuggestions}
          disabled={isGenerating || !campaignObjective.trim() || !audienceDescription.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating Messages...
            </div>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Message Suggestions
            </>
          )}
        </Button>

        {suggestions.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-green-700">AI-Generated Messages:</Label>
            {suggestions.map((message, index) => (
              <div key={index} className="p-4 bg-white rounded-lg border border-green-200 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Variant {index + 1}
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyMessage(message, index)}
                      className="h-8"
                    >
                      {copiedIndex === index ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                    <Button size="sm" onClick={() => handleUseMessage(message)} className="h-8">
                      Use This
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
                <p className="text-xs text-gray-500">{message.length} characters</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
