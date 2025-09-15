import nodemailer from "nodemailer"

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null

  private static getTransporter() {
    if (!this.transporter) {
      const config: EmailConfig = {
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number.parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER || "",
          pass: process.env.SMTP_PASS || "",
        },
      }

      this.transporter = nodemailer.createTransport(config)
    }

    return this.transporter
  }

  static async sendEmail(
    to: string,
    subject: string,
    message: string,
    customerName: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const transporter = this.getTransporter()

      // Personalize the message
      const personalizedMessage = message.replace(/{name}/g, customerName)

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || "Xeno CRM"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Xeno CRM</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <p style="font-size: 16px; line-height: 1.6; color: #333; margin: 0;">
                  ${personalizedMessage.replace(/\n/g, "<br>")}
                </p>
              </div>
            </div>
            <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
              <p>This email was sent from Xeno CRM Platform</p>
              <p>If you no longer wish to receive these emails, please contact us.</p>
            </div>
          </div>
        `,
        text: personalizedMessage,
      }

      const info = await transporter.sendMail(mailOptions)

      return {
        success: true,
        messageId: info.messageId,
      }
    } catch (error) {
      console.error("Email sending error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  static async sendBulkEmails(
    recipients: Array<{
      email: string
      name: string
    }>,
    subject: string,
    message: string,
    onProgress?: (sent: number, total: number) => void,
  ): Promise<{
    successful: number
    failed: number
    results: Array<{
      email: string
      success: boolean
      messageId?: string
      error?: string
    }>
  }> {
    const results = []
    let successful = 0
    let failed = 0

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i]

      try {
        // Add delay between emails to avoid rate limiting
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }

        const result = await this.sendEmail(recipient.email, subject, message, recipient.name)

        if (result.success) {
          successful++
        } else {
          failed++
        }

        results.push({
          email: recipient.email,
          success: result.success,
          messageId: result.messageId,
          error: result.error,
        })

        // Call progress callback
        if (onProgress) {
          onProgress(i + 1, recipients.length)
        }
      } catch (error) {
        failed++
        results.push({
          email: recipient.email,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return {
      successful,
      failed,
      results,
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      const transporter = this.getTransporter()
      await transporter.verify()
      return true
    } catch (error) {
      console.error("SMTP connection test failed:", error)
      return false
    }
  }
}
