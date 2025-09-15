import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { CampaignService } from "@/lib/services/campaignService"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stats = await CampaignService.getCampaignStats(params.id)
    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error fetching campaign stats:", error)
    return NextResponse.json({ error: "Failed to fetch campaign stats" }, { status: 500 })
  }
}
