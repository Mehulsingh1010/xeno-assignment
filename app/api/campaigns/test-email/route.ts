import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { CampaignService } from "@/lib/services/campaignService"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isConnected = await CampaignService.testEmailConnection()
    return NextResponse.json({ connected: isConnected })
  } catch (error) {
    return NextResponse.json({ connected: false }, { status: 500 })
  }
}
