import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { CampaignService } from "@/lib/services/campaignService"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await CampaignService.launchCampaign(params.id)

    if (result.success) {
      return NextResponse.json({
        message: result.message,
        stats: result.stats,
      })
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
  } catch (error) {
    console.error("Error launching campaign:", error)
    return NextResponse.json({ error: "Failed to launch campaign" }, { status: 500 })
  }
}
