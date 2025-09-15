import { getDatabase } from "../lib/mongodb.js"
import { customerValidationSchema } from "../lib/models/customer.js"
import { orderValidationSchema } from "../lib/models/order.js"
import { campaignValidationSchema, communicationLogValidationSchema } from "../lib/models/campaign.js"

async function setupDatabase() {
  try {
    console.log("Setting up database collections and validation...")

    const db = await getDatabase()

    // Create customers collection with validation
    try {
      await db.createCollection("customers", {
        validator: customerValidationSchema,
      })
      console.log("✓ Customers collection created with validation")
    } catch (error) {
      if (error.codeName === "NamespaceExists") {
        await db.command({
          collMod: "customers",
          validator: customerValidationSchema,
        })
        console.log("✓ Customers collection validation updated")
      }
    }

    // Create orders collection with validation
    try {
      await db.createCollection("orders", {
        validator: orderValidationSchema,
      })
      console.log("✓ Orders collection created with validation")
    } catch (error) {
      if (error.codeName === "NamespaceExists") {
        await db.command({
          collMod: "orders",
          validator: orderValidationSchema,
        })
        console.log("✓ Orders collection validation updated")
      }
    }

    // Create campaigns collection with validation
    try {
      await db.createCollection("campaigns", {
        validator: campaignValidationSchema,
      })
      console.log("✓ Campaigns collection created with validation")
    } catch (error) {
      if (error.codeName === "NamespaceExists") {
        await db.command({
          collMod: "campaigns",
          validator: campaignValidationSchema,
        })
        console.log("✓ Campaigns collection validation updated")
      }
    }

    // Create communication_logs collection with validation
    try {
      await db.createCollection("communication_logs", {
        validator: communicationLogValidationSchema,
      })
      console.log("✓ Communication logs collection created with validation")
    } catch (error) {
      if (error.codeName === "NamespaceExists") {
        await db.command({
          collMod: "communication_logs",
          validator: communicationLogValidationSchema,
        })
        console.log("✓ Communication logs collection validation updated")
      }
    }

    // Create indexes for better performance
    await db.collection("customers").createIndex({ email: 1 }, { unique: true })
    await db.collection("orders").createIndex({ customerId: 1 })
    await db.collection("campaigns").createIndex({ createdBy: 1 })
    await db.collection("communication_logs").createIndex({ campaignId: 1 })
    await db.collection("communication_logs").createIndex({ customerId: 1 })

    console.log("✓ Database indexes created")
    console.log("🎉 Database setup completed successfully!")
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    process.exit(1)
  }
}

setupDatabase()
