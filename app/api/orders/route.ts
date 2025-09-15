import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { OrderService } from "@/lib/services/orderService"
import { z } from "zod"

const orderItemSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be non-negative"),
  productId: z.string().optional().default(""),
})

const orderSchema = z
  .object({
    customerId: z.string().min(1, "Customer ID is required"),
    totalAmount: z.number().min(0, "Total amount must be non-negative"),
    status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
    items: z.array(orderItemSchema).min(1, "At least one item is required"),
  })
  .transform((data) => ({
    customerId: data.customerId,
    orderDate: new Date(), // Auto-set current date
    amount: data.totalAmount,
    status:
      data.status === "processing"
        ? "pending"
        : data.status === "shipped" || data.status === "delivered"
          ? "completed"
          : data.status,
    items: data.items.map((item) => ({
      ...item,
      productId: item.productId || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    })),
  }))

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get("customerId")

    let orders
    if (customerId) {
      orders = await OrderService.getOrdersByCustomerId(customerId)
    } else {
      orders = await OrderService.getAllOrders()
    }

    const transformedOrders = orders.map((order) => ({
      ...order,
      totalAmount: order.amount,
      status: order.status === "completed" ? "delivered" : order.status,
    }))

    return NextResponse.json({ orders: transformedOrders })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
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
    const validationResult = orderSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 },
      )
    }

    const orderData = validationResult.data

    // Create order
    const order = await OrderService.createOrder(orderData)

    const transformedOrder = {
      ...order,
      totalAmount: order.amount,
      status: order.status === "completed" ? "delivered" : order.status,
    }

    return NextResponse.json(
      {
        message: "Order created successfully",
        order: transformedOrder,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating order:", error)

    if (error instanceof Error && error.message.includes("Document failed validation")) {
      return NextResponse.json(
        {
          error: "Document validation failed",
          message: "Please ensure all required fields are provided with correct data types",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await OrderService.deleteAllOrders()

    return NextResponse.json({
      message: "All orders deleted successfully",
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Error deleting all orders:", error)
    return NextResponse.json({ error: "Failed to delete all orders" }, { status: 500 })
  }
}
