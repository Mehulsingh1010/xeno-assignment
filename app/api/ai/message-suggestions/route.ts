import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AIService } from "@/lib/services/aiService"
import { z } from "zod"

const messageSuggestionsSchema = z.object({
  campaignObjective: z.string().min(1, "Campaign objective is required"),
  audienceDescription: z.string().min(1, "Audience description is required"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = messageSuggestionsSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 },
      )
    }

    const { campaignObjective, audienceDescription } = validationResult.data
    const messages = await AIService.generateMessageSuggestions(campaignObjective, audienceDescription)

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Error generating message suggestions:", error)
    return NextResponse.json({ error: "Failed to generate message suggestions" }, { status: 500 })
  }
}
