import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/components/auth-provider"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Xeno CRM - Customer Relationship Management",
  description: "Mini CRM Platform for customer segmentation and campaign management",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            
            <main className="">
                {children}
            </main>
           </AuthProvider>
        </Suspense>
      </body>
    </html>
  )
}
