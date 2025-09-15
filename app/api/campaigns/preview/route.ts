import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { CustomerService } from "@/lib/services/customerService"
import { z } from "zod"

const audienceRuleSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(["gt", "lt", "eq", "gte", "lte", "contains", "not_contains"]),
  value: z.union([z.string(), z.number(), z.date()]),
  logicalOperator: z.enum(["AND", "OR"]).optional(),
})

const previewSchema = z.object({
  audienceRules: z.array(audienceRuleSchema).min(1, "At least one audience rule is required"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate input data
    const validationResult = previewSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 },
      )
    }

    const { audienceRules } = validationResult.data

    // Get matching customers
    const customers = await CustomerService.getCustomersByRules(audienceRules)

    return NextResponse.json({
      audienceSize: customers.length,
      sampleCustomers: customers.slice(0, 5), // Return first 5 for preview
    })
  } catch (error) {
    console.error("Error previewing audience:", error)
    return NextResponse.json({ error: "Failed to preview audience" }, { status: 500 })
  }
}
