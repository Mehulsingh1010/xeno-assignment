import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { CustomerService } from "@/lib/services/customerService"
import { z } from "zod"

// Validation schema for customer input
const customerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Valid email is required"),
  phone: z.string().max(20, "Phone must be less than 20 characters").optional(),
  totalSpends: z.number().min(0, "Total spends must be non-negative"),
  visits: z.number().int().min(0, "Visits must be a non-negative integer"),
  lastVisit: z.string().transform((str) => new Date(str)),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const customers = await CustomerService.getAllCustomers()
    return NextResponse.json({ customers })
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
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
    const validationResult = customerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 },
      )
    }

    const customerData = validationResult.data

    // Create customer
    const customer = await CustomerService.createCustomer(customerData)

    return NextResponse.json(
      {
        message: "Customer created successfully",
        customer,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating customer:", error)

    // Handle MongoDB validation errors
    if (error instanceof Error && error.message.includes("Document failed validation")) {
      return NextResponse.json(
        {
          error: "Document validation failed",
          message: "Please ensure all required fields are provided with correct data types",
        },
        { status: 400 },
      )
    }

    // Handle duplicate email errors
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return NextResponse.json(
        {
          error: "Email already exists",
          message: "A customer with this email already exists",
        },
        { status: 409 },
      )
    }

    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await CustomerService.deleteAllCustomers()

    return NextResponse.json({
      message: "All customers deleted successfully",
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Error deleting all customers:", error)
    return NextResponse.json({ error: "Failed to delete all customers" }, { status: 500 })
  }
}
