"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Wand2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { AudienceRule } from "@/lib/models/campaign"

interface AIRuleBuilderProps {
  onRulesGenerated: (rules: AudienceRule[]) => void
}

export function AIRuleBuilder({ onRulesGenerated }: AIRuleBuilderProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleGenerateRules = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description of your target audience",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai/natural-language-rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (response.ok) {
        onRulesGenerated(data.rules)
        toast({
          title: "Rules Generated!",
          description: `Generated ${data.rules.length} audience rules from your description`,
        })
        setPrompt("")
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to generate rules",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating rules:", error)
      toast({
        title: "Error",
        description: "Failed to generate rules",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const examplePrompts = [
    "Customers who spent more than ₹10,000 and visited less than 3 times",
    "People who haven't visited in the last 90 days but spent over ₹5,000",
    "High-value customers with more than 5 visits and total spending above ₹15,000",
    "New customers who joined in the last 30 days",
  ]

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <Sparkles className="w-5 h-5" />
          AI Rule Builder
        </CardTitle>
        <CardDescription>
          Describe your target audience in plain English, and AI will create the rules for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="ai-prompt">Describe your target audience</Label>
          <Input
            id="ai-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Customers who spent more than ₹10,000 and haven't visited in 3 months"
            className="mt-1"
          />
        </div>

        <Button onClick={handleGenerateRules} disabled={isGenerating || !prompt.trim()} className="w-full">
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating Rules...
            </div>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Rules with AI
            </>
          )}
        </Button>

        <div className="space-y-2">
          <Label className="text-sm text-gray-600">Try these examples:</Label>
          <div className="grid grid-cols-1 gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPrompt(example)}
                className="text-left text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-100 p-2 rounded border border-purple-200 transition-colors"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
