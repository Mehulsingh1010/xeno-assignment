import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { CampaignService } from "@/lib/services/campaignService"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const campaign = await db.collection("campaigns").findOne({ _id: new ObjectId(params.id) })

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Launch the campaign again
    const result = await CampaignService.launchCampaign(params.id)

    return NextResponse.json({
      message: "Campaign resent successfully",
      campaign: result.campaign,
      emailsSent: result.emailsSent,
    })
  } catch (error) {
    console.error("Error resending campaign:", error)
    return NextResponse.json({ error: "Failed to resend campaign" }, { status: 500 })
  }
}
