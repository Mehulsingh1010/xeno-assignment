import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AIService } from "@/lib/services/aiService"
import { CampaignService } from "@/lib/services/campaignService"
import { z } from "zod"

const campaignSummarySchema = z.object({
  campaignId: z.string().min(1, "Campaign ID is required"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = campaignSummarySchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 },
      )
    }

    const { campaignId } = validationResult.data
    const stats = await CampaignService.getCampaignStats(campaignId)
    const summary = await AIService.generateCampaignSummary(stats)

    return NextResponse.json({ summary, stats })
  } catch (error) {
    console.error("Error generating campaign summary:", error)
    return NextResponse.json({ error: "Failed to generate campaign summary" }, { status: 500 })
  }
}
