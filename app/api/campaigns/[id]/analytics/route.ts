import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { CampaignService } from "@/lib/services/campaignService"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const campaignService = new CampaignService()
    const campaign = await campaignService.getCampaignById(params.id)

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const analytics = {
      sent: campaign.audienceSize || 0,
      delivered: Math.floor((campaign.audienceSize || 0) * 0.85), // 85% delivery rate simulation
      failed: Math.floor((campaign.audienceSize || 0) * 0.15), // 15% failure rate simulation
      deliveryRate: 85,
      lastSent: campaign.status === "completed" || campaign.status === "active" ? campaign.createdAt : undefined,
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Error fetching campaign analytics:", error)
    return NextResponse.json({ error: "Failed to fetch campaign analytics" }, { status: 500 })
  }
}
