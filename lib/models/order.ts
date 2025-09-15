import type { ObjectId } from "mongodb"

export interface Order {
  _id?: ObjectId
  customerId: ObjectId
  orderDate: Date
  amount: number
  status: "pending" | "completed" | "cancelled"
  items: OrderItem[]
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

export interface OrderInput {
  customerId: string
  orderDate: Date
  amount: number
  status: "pending" | "completed" | "cancelled"
  items: OrderItem[]
}

// MongoDB validation schema for orders collection
export const orderValidationSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["customerId", "orderDate", "amount", "status", "items", "createdAt", "updatedAt"],
    properties: {
      _id: {
        bsonType: "objectId",
      },
      customerId: {
        bsonType: "objectId",
        description: "Customer ID is required",
      },
      orderDate: {
        bsonType: "date",
        description: "Order date is required",
      },
      amount: {
        bsonType: "number",
        minimum: 0,
        description: "Amount must be a non-negative number",
      },
      status: {
        bsonType: "string",
        enum: ["pending", "completed", "cancelled"],
        description: "Status must be pending, completed, or cancelled",
      },
      items: {
        bsonType: "array",
        minItems: 1,
        items: {
          bsonType: "object",
          required: ["productId", "productName", "quantity", "price"],
          properties: {
            productId: {
              bsonType: "string",
              minLength: 1,
              description: "Product ID is required",
            },
            productName: {
              bsonType: "string",
              minLength: 1,
              description: "Product name is required",
            },
            quantity: {
              bsonType: "int",
              minimum: 1,
              description: "Quantity must be at least 1",
            },
            price: {
              bsonType: "number",
              minimum: 0,
              description: "Price must be non-negative",
            },
          },
        },
      },
      createdAt: {
        bsonType: "date",
        description: "Created date is required",
      },
      updatedAt: {
        bsonType: "date",
        description: "Updated date is required",
      },
    },
  },
}
