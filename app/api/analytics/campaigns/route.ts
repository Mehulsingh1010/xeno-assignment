import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Get campaigns with their communication logs
    const campaigns = await db
      .collection("campaigns")
      .aggregate([
        {
          $lookup: {
            from: "communication_logs",
            localField: "_id",
            foreignField: "campaignId",
            as: "logs",
          },
        },
        {
          $addFields: {
            messagesSent: {
              $size: {
                $filter: {
                  input: "$logs",
                  cond: { $eq: ["$$this.status", "SENT"] },
                },
              },
            },
            messagesFailed: {
              $size: {
                $filter: {
                  input: "$logs",
                  cond: { $eq: ["$$this.status", "FAILED"] },
                },
              },
            },
            messagesPending: {
              $size: {
                $filter: {
                  input: "$logs",
                  cond: { $eq: ["$$this.status", "PENDING"] },
                },
              },
            },
          },
        },
        {
          $addFields: {
            deliveryRate: {
              $cond: {
                if: { $gt: ["$audienceSize", 0] },
                then: { $multiply: [{ $divide: ["$messagesSent", "$audienceSize"] }, 100] },
                else: 0,
              },
            },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray()

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error("Error fetching campaign analytics:", error)
    return NextResponse.json({ error: "Failed to fetch campaign analytics" }, { status: 500 })
  }
}
