import { getDatabase } from "../mongodb"
import { type Customer, type CustomerInput, customerValidationSchema } from "../models/customer"
import { ObjectId } from "mongodb"

export class CustomerService {
  private static async getCollection() {
    const db = await getDatabase()
    const collection = db.collection<Customer>("customers")

    // Ensure validation schema is applied
    try {
      await db.createCollection("customers", {
        validator: customerValidationSchema,
      })
    } catch (error) {
      // Collection might already exist, try to update validation
      try {
        await db.command({
          collMod: "customers",
          validator: customerValidationSchema,
        })
      } catch (modError) {
        console.log("Validation schema already applied or error updating:", modError)
      }
    }

    return collection
  }

  static async createCustomer(customerData: CustomerInput): Promise<Customer> {
    const collection = await this.getCollection()

    const customer: Omit<Customer, "_id"> = {
      ...customerData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    try {
      const result = await collection.insertOne(customer)
      return { ...customer, _id: result.insertedId }
    } catch (error) {
      console.error("Error creating customer:", error)
      throw new Error("Failed to create customer: " + (error as Error).message)
    }
  }

  static async getAllCustomers(): Promise<Customer[]> {
    const collection = await this.getCollection()
    return await collection.find({}).toArray()
  }

  static async getCustomerById(id: string): Promise<Customer | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ _id: new ObjectId(id) })
  }

  static async updateCustomer(id: string, updateData: Partial<CustomerInput>): Promise<Customer | null> {
    const collection = await this.getCollection()

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    return result
  }

  static async deleteCustomer(id: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  static async deleteAllCustomers(): Promise<{ deletedCount: number }> {
    const collection = await this.getCollection()
    const result = await collection.deleteMany({})
    return { deletedCount: result.deletedCount }
  }

  static async getCustomersByRules(rules: any[]): Promise<Customer[]> {
    const collection = await this.getCollection()

    // Build MongoDB query from rules
    const query = this.buildQueryFromRules(rules)
    return await collection.find(query).toArray()
  }

  private static buildQueryFromRules(rules: any[]): any {
    if (rules.length === 0) return {}

    const conditions: any[] = []

    for (const rule of rules) {
      const condition: any = {}

      switch (rule.operator) {
        case "gt":
          condition[rule.field] = { $gt: rule.value }
          break
        case "lt":
          condition[rule.field] = { $lt: rule.value }
          break
        case "gte":
          condition[rule.field] = { $gte: rule.value }
          break
        case "lte":
          condition[rule.field] = { $lte: rule.value }
          break
        case "eq":
          condition[rule.field] = rule.value
          break
        case "contains":
          condition[rule.field] = { $regex: rule.value, $options: "i" }
          break
        case "not_contains":
          condition[rule.field] = { $not: { $regex: rule.value, $options: "i" } }
          break
      }

      conditions.push(condition)
    }

    if (conditions.length === 1) {
      return conditions[0]
    }

    // For simplicity, using $and for multiple conditions
    // In a real implementation, you'd parse the logical operators
    return { $and: conditions }
  }
}
