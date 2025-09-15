import { getDatabase } from "../mongodb"
import { type Order, type OrderInput, orderValidationSchema } from "../models/order"
import { ObjectId } from "mongodb"

export class OrderService {
  private static async getCollection() {
    const db = await getDatabase()
    const collection = db.collection<Order>("orders")

    // Ensure validation schema is applied
    try {
      await db.createCollection("orders", {
        validator: orderValidationSchema,
      })
    } catch (error) {
      try {
        await db.command({
          collMod: "orders",
          validator: orderValidationSchema,
        })
      } catch (modError) {
        console.log("Validation schema already applied or error updating:", modError)
      }
    }

    return collection
  }

  static async createOrder(orderData: OrderInput): Promise<Order> {
    const collection = await this.getCollection()

    const order: Omit<Order, "_id"> = {
      ...orderData,
      customerId: new ObjectId(orderData.customerId),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    try {
      const result = await collection.insertOne(order)
      return { ...order, _id: result.insertedId }
    } catch (error) {
      console.error("Error creating order:", error)
      throw new Error("Failed to create order: " + (error as Error).message)
    }
  }

  static async getAllOrders(): Promise<Order[]> {
    const collection = await this.getCollection()
    return await collection.find({}).toArray()
  }

  static async getOrdersByCustomerId(customerId: string): Promise<Order[]> {
    const collection = await this.getCollection()
    return await collection.find({ customerId: new ObjectId(customerId) }).toArray()
  }

  static async getOrderById(id: string): Promise<Order | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ _id: new ObjectId(id) })
  }

  static async updateOrder(id: string, updateData: Partial<OrderInput>): Promise<Order | null> {
    const collection = await this.getCollection()

    const updateDoc: any = { ...updateData, updatedAt: new Date() }
    if (updateData.customerId) {
      updateDoc.customerId = new ObjectId(updateData.customerId)
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: "after" },
    )

    return result
  }

  static async deleteOrder(id: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  static async deleteAllOrders(): Promise<{ deletedCount: number }> {
    const collection = await this.getCollection()
    const result = await collection.deleteMany({})
    return { deletedCount: result.deletedCount }
  }
}
