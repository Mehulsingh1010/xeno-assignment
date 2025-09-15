import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AIService } from "@/lib/services/aiService"
import { z } from "zod"

const nlRulesSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validationResult = nlRulesSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 },
      )
    }

    const { prompt } = validationResult.data
    const rules = await AIService.naturalLanguageToRules(prompt)

    return NextResponse.json({ rules })
  } catch (error) {
    console.error("Error converting natural language to rules:", error)
    return NextResponse.json({ error: "Failed to convert natural language to rules" }, { status: 500 })
  }
}
