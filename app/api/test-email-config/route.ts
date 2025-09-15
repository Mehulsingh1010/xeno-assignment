import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { EmailService } from "@/lib/services/emailService"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isConnected = await EmailService.testConnection()

    return NextResponse.json({
      connected: isConnected,
      message: isConnected ? "Email service is configured correctly" : "Email service configuration error",
    })
  } catch (error) {
    console.error("Error testing email configuration:", error)
    return NextResponse.json(
      {
        connected: false,
        error: "Failed to test email configuration",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
