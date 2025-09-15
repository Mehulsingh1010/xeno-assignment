import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { z } from "zod"

const deliveryReceiptSchema = z.object({
  logId: z.string().min(1, "Log ID is required"),
  status: z.enum(["SENT", "FAILED"]),
  timestamp: z.string().transform((str) => new Date(str)),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input data
    const validationResult = deliveryReceiptSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 },
      )
    }

    const { logId, status, timestamp } = validationResult.data

    // Update communication log
    const db = await getDatabase()
    const logsCollection = db.collection("communication_logs")

    const result = await logsCollection.updateOne(
      { _id: new ObjectId(logId) },
      {
        $set: {
          status,
          sentAt: status === "SENT" ? timestamp : undefined,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Communication log not found" }, { status: 404 })
    }

    console.log(`📧 Delivery Receipt: Log ${logId} updated to ${status}`)

    return NextResponse.json({ message: "Delivery receipt processed successfully" })
  } catch (error) {
    console.error("Error processing delivery receipt:", error)
    return NextResponse.json({ error: "Failed to process delivery receipt" }, { status: 500 })
  }
}
