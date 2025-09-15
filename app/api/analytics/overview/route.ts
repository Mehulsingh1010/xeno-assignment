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

    // Get overall statistics
    const [totalCustomers, totalOrders, totalCampaigns, orderStats, topSpendingCustomers] = await Promise.all([
      db.collection("customers").countDocuments(),
      db.collection("orders").countDocuments(),
      db.collection("campaigns").countDocuments(),
      db
        .collection("orders")
        .aggregate([
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$amount" },
              avgOrderValue: { $avg: "$amount" },
            },
          },
        ])
        .toArray(),
      db.collection("customers").find({}).sort({ totalSpends: -1 }).limit(10).toArray(),
    ])

    const stats = orderStats[0] || { totalRevenue: 0, avgOrderValue: 0 }

    return NextResponse.json({
      totalCustomers,
      totalOrders,
      totalCampaigns,
      totalRevenue: stats.totalRevenue,
      avgOrderValue: stats.avgOrderValue,
      topSpendingCustomers,
    })
  } catch (error) {
    console.error("Error fetching overview analytics:", error)
    return NextResponse.json({ error: "Failed to fetch overview analytics" }, { status: 500 })
  }
}
