import { GoogleGenerativeAI } from "@google/generative-ai"
import type { AudienceRule } from "../models/campaign"

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing environment variable: "GEMINI_API_KEY"')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export class AIService {
  private static model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  static async naturalLanguageToRules(prompt: string): Promise<AudienceRule[]> {
    try {
      const systemPrompt = `
You are an expert at converting natural language descriptions into structured audience rules for a CRM system.

Available fields:
- totalSpends (number): Customer's total spending amount
- visits (number): Number of times customer visited
- lastVisit (date): Date of customer's last visit
- name (string): Customer's name
- email (string): Customer's email

Available operators:
- For numbers: gt (greater than), gte (greater than or equal), lt (less than), lte (less than or equal), eq (equal to)
- For strings: eq (equal to), contains, not_contains
- For dates: gt (after), lt (before), eq (on)

Logical operators: AND, OR

Convert the following natural language prompt into a JSON array of audience rules:
"${prompt}"

Return ONLY a valid JSON array with this structure:
[
  {
    "field": "totalSpends",
    "operator": "gt",
    "value": 10000,
    "logicalOperator": "AND"
  }
]

Rules:
1. First rule should not have logicalOperator
2. Use appropriate data types (numbers for totalSpends/visits, strings for dates in YYYY-MM-DD format)
3. Convert relative dates like "90 days ago" to actual dates
4. Convert currency amounts to numbers (remove ₹, $, etc.)
5. Return empty array if the prompt is unclear or invalid
`

      const result = await this.model.generateContent(systemPrompt)
      const response = await result.response
      const text = response.text()

      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error("No valid JSON found in AI response")
      }

      const rules = JSON.parse(jsonMatch[0]) as AudienceRule[]
      return rules
    } catch (error) {
      console.error("Error converting natural language to rules:", error)
      throw new Error("Failed to convert natural language to rules")
    }
  }

  static async generateMessageSuggestions(campaignObjective: string, audienceDescription: string): Promise<string[]> {
    try {
      const prompt = `
Generate 3 different marketing message variants for a CRM campaign with the following details:

Campaign Objective: ${campaignObjective}
Target Audience: ${audienceDescription}

Requirements:
1. Each message should be personalized (use {name} placeholder)
2. Keep messages under 160 characters for SMS compatibility
3. Include a clear call-to-action
4. Make them engaging and relevant to the objective
5. Vary the tone: professional, friendly, and urgent

Return ONLY a JSON array of 3 message strings:
["message1", "message2", "message3"]
`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error("No valid JSON found in AI response")
      }

      const messages = JSON.parse(jsonMatch[0]) as string[]
      return messages.slice(0, 3) // Ensure only 3 messages
    } catch (error) {
      console.error("Error generating message suggestions:", error)
      throw new Error("Failed to generate message suggestions")
    }
  }

  static async generateCampaignSummary(stats: {
    total: number
    sent: number
    failed: number
    pending: number
  }): Promise<string> {
    try {
      const deliveryRate = stats.total > 0 ? ((stats.sent / stats.total) * 100).toFixed(1) : "0"
      const failureRate = stats.total > 0 ? ((stats.failed / stats.total) * 100).toFixed(1) : "0"

      const prompt = `
Generate a human-readable campaign performance summary based on these statistics:

Total Messages: ${stats.total}
Successfully Sent: ${stats.sent}
Failed: ${stats.failed}
Pending: ${stats.pending}
Delivery Rate: ${deliveryRate}%
Failure Rate: ${failureRate}%

Create a concise, professional summary (2-3 sentences) that highlights:
1. Overall performance
2. Key insights or concerns
3. Actionable recommendations if needed

Make it sound natural and insightful, not just a repetition of numbers.
`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text().trim()
    } catch (error) {
      console.error("Error generating campaign summary:", error)
      return `Campaign reached ${stats.total} customers with ${stats.sent} messages delivered successfully. ${
        stats.failed > 0 ? `${stats.failed} messages failed delivery.` : "All messages were delivered successfully."
      }`
    }
  }

  static async suggestOptimalSendTime(audienceSize: number, campaignType: string): Promise<string> {
    try {
      const prompt = `
Based on marketing best practices, suggest the optimal time to send a campaign with these details:

Audience Size: ${audienceSize} customers
Campaign Type: ${campaignType}

Consider:
1. Day of the week
2. Time of day
3. Audience size considerations
4. Campaign type effectiveness

Provide a specific recommendation with reasoning in 1-2 sentences.
`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text().trim()
    } catch (error) {
      console.error("Error suggesting optimal send time:", error)
      return "For best engagement, consider sending on Tuesday-Thursday between 10 AM - 2 PM when customers are most active."
    }
  }

  static async generateCampaignTags(
    campaignName: string,
    message: string,
    audienceRules: AudienceRule[],
  ): Promise<string[]> {
    try {
      const rulesDescription = audienceRules.map((rule) => `${rule.field} ${rule.operator} ${rule.value}`).join(", ")

      const prompt = `
Analyze this campaign and generate 2-3 relevant tags:

Campaign Name: ${campaignName}
Message: ${message}
Audience Rules: ${rulesDescription}

Generate tags that categorize the campaign type (e.g., "Win-back", "High Value", "New Customer", "Retention", "Promotional", "Seasonal").

Return ONLY a JSON array of 2-3 tag strings:
["tag1", "tag2", "tag3"]
`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        return ["General", "Marketing"]
      }

      const tags = JSON.parse(jsonMatch[0]) as string[]
      return tags.slice(0, 3)
    } catch (error) {
      console.error("Error generating campaign tags:", error)
      return ["Marketing", "Campaign"]
    }
  }
}
