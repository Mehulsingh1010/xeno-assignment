import { getDatabase } from "../mongodb"
import { type Campaign, type CommunicationLog, communicationLogValidationSchema } from "../models/campaign"
import { CustomerService } from "./customerService"
import { EmailService } from "./emailService"
import { ObjectId } from "mongodb"

export class CampaignService {
  [x: string]: any
  private static async getCommunicationLogsCollection() {
    const db = await getDatabase()
    const collection = db.collection<CommunicationLog>("communication_logs")

    // Ensure validation schema is applied
    try {
      await db.createCollection("communication_logs", {
        validator: communicationLogValidationSchema,
      })
    } catch (error) {
      try {
        await db.command({
          collMod: "communication_logs",
          validator: communicationLogValidationSchema,
        })
      } catch (modError) {
        console.log("Validation schema already applied or error updating:", modError)
      }
    }

    return collection
  }

  static async launchCampaign(campaignId: string): Promise<{ success: boolean; message: string; stats?: any }> {
    try {
      const db = await getDatabase()
      const campaignsCollection = db.collection<Campaign>("campaigns")

      // Get campaign details
      const campaign = await campaignsCollection.findOne({ _id: new ObjectId(campaignId) })
      if (!campaign) {
        return { success: false, message: "Campaign not found" }
      }

      // Get audience customers
      const customers = await CustomerService.getCustomersByRules(campaign.audienceRules)
      if (customers.length === 0) {
        return { success: false, message: "No customers match the campaign criteria" }
      }

      // Update campaign status to active
      await campaignsCollection.updateOne(
        { _id: new ObjectId(campaignId) },
        {
          $set: {
            status: "active",
            updatedAt: new Date(),
          },
        },
      )

      // Create communication logs for each customer
      const communicationLogs: Omit<CommunicationLog, "_id">[] = customers.map((customer) => ({
        campaignId: new ObjectId(campaignId),
        customerId: customer._id!,
        customerName: customer.name,
        customerEmail: customer.email,
        message: this.personalizeMessage(campaign.message, customer.name),
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      const logsCollection = await this.getCommunicationLogsCollection()
      const result = await logsCollection.insertMany(communicationLogs)

      this.processEmailDelivery(Object.values(result.insertedIds), campaign.name)

      return {
        success: true,
        message: `Campaign launched successfully! ${customers.length} emails queued for delivery.`,
        stats: {
          totalMessages: customers.length,
          pending: customers.length,
          sent: 0,
          failed: 0,
        },
      }
    } catch (error) {
      console.error("Error launching campaign:", error)
      return { success: false, message: "Failed to launch campaign" }
    }
  }

  private static personalizeMessage(template: string, customerName: string): string {
    return template.replace(/{name}/g, customerName)
  }

  private static async processEmailDelivery(logIds: ObjectId[], campaignName: string) {
    // Process emails asynchronously
    setTimeout(async () => {
      for (const logId of logIds) {
        // Add delay between emails to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000 + 1000))

        try {
          const logsCollection = await this.getCommunicationLogsCollection()
          const log = await logsCollection.findOne({ _id: logId })

          if (!log) continue

          // Send real email using EmailService
          const emailResult = await EmailService.sendEmail(
            log.customerEmail,
            `${campaignName} - Special Message for You`,
            log.message,
            log.customerName,
          )

          // Update log with delivery result
          await logsCollection.updateOne(
            { _id: logId },
            {
              $set: {
                status: emailResult.success ? "SENT" : "FAILED",
                sentAt: emailResult.success ? new Date() : undefined,
                messageId: emailResult.messageId,
                error: emailResult.error,
                updatedAt: new Date(),
              },
            },
          )

          console.log(`📧 Email ${emailResult.success ? "sent" : "failed"} to ${log.customerEmail}`)
          if (emailResult.error) {
            console.error(`📧 Error: ${emailResult.error}`)
          }
        } catch (error) {
          console.error("Error processing email delivery:", error)
          // Mark as failed
          const logsCollection = await this.getCommunicationLogsCollection()
          await logsCollection.updateOne(
            { _id: logId },
            {
              $set: {
                status: "FAILED",
                error: error instanceof Error ? error.message : "Unknown error",
                updatedAt: new Date(),
              },
            },
          )
        }
      }
    }, 1000)
  }

  static async getCampaignStats(campaignId: string) {
    try {
      const logsCollection = await this.getCommunicationLogsCollection()

      const stats = await logsCollection
        .aggregate([
          { $match: { campaignId: new ObjectId(campaignId) } },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ])
        .toArray()

      const result = {
        total: 0,
        sent: 0,
        failed: 0,
        pending: 0,
      }

      for (const stat of stats) {
        result.total += stat.count
        if (stat._id === "SENT") result.sent = stat.count
        else if (stat._id === "FAILED") result.failed = stat.count
        else if (stat._id === "PENDING") result.pending = stat.count
      }

      return result
    } catch (error) {
      console.error("Error getting campaign stats:", error)
      return { total: 0, sent: 0, failed: 0, pending: 0 }
    }
  }

  static async getCommunicationLogs(campaignId?: string) {
    try {
      const logsCollection = await this.getCommunicationLogsCollection()

      const query = campaignId ? { campaignId: new ObjectId(campaignId) } : {}
      const logs = await logsCollection.find(query).sort({ createdAt: -1 }).toArray()

      return logs
    } catch (error) {
      console.error("Error getting communication logs:", error)
      return []
    }
  }

  static async testEmailConnection(): Promise<boolean> {
    return await EmailService.testConnection()
  }
}
