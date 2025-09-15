import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { type Campaign, campaignValidationSchema } from "@/lib/models/campaign"
import { CustomerService } from "@/lib/services/customerService"
import { z } from "zod"

const audienceRuleSchema = z.object({
  field: z.string().min(1, "Field is required"),
  operator: z.enum(["gt", "lt", "eq", "gte", "lte", "contains", "not_contains"]),
  value: z.union([z.string(), z.number(), z.date()]),
  logicalOperator: z.enum(["AND", "OR"]).optional(),
})

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").max(200, "Name must be less than 200 characters"),
  audienceRules: z.array(audienceRuleSchema).min(1, "At least one audience rule is required"),
  message: z.string().min(1, "Message is required").max(1000, "Message must be less than 1000 characters"),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const campaigns = await db.collection<Campaign>("campaigns").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate input data
    const validationResult = campaignSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 },
      )
    }

    const { name, audienceRules, message } = validationResult.data

    // Calculate audience size
    const audienceCustomers = await CustomerService.getCustomersByRules(audienceRules)
    const audienceSize = audienceCustomers.length

    const db = await getDatabase()

    // Ensure campaigns collection has validation
    try {
      await db.createCollection("campaigns", {
        validator: campaignValidationSchema,
      })
    } catch (error) {
      // Collection might already exist
    }

    const campaign: Omit<Campaign, "_id"> = {
      name,
      audienceRules,
      message,
      audienceSize,
      status: "draft",
      createdBy: session.user?.email || "unknown",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection<Campaign>("campaigns").insertOne(campaign)

    return NextResponse.json(
      {
        message: "Campaign created successfully",
        campaign: { ...campaign, _id: result.insertedId },
        audienceSize,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating campaign:", error)
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const result = await db.collection("campaigns").deleteMany({})

    return NextResponse.json({
      message: "All campaigns deleted successfully",
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Error deleting all campaigns:", error)
    return NextResponse.json({ error: "Failed to delete all campaigns" }, { status: 500 })
  }
}
