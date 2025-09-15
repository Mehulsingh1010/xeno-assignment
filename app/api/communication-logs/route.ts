import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { CampaignService } from "@/lib/services/campaignService"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get("campaignId")

    const logs = await CampaignService.getCommunicationLogs(campaignId || undefined)
    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Error fetching communication logs:", error)
    return NextResponse.json({ error: "Failed to fetch communication logs" }, { status: 500 })
  }
}
