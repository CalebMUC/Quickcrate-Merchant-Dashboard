import type React from "react"
import type { Metadata } from "next"
// import { Inter } from "next/font/google"
import "../styles/globals.css"
import { AuthProvider } from "@/lib/contexts/AuthContext"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Toaster } from "@/components/ui/toaster"

// const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MerchantHub - E-Commerce Dashboard",
  description: "Professional merchant dashboard for managing your online store",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <DashboardLayout>{children}</DashboardLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
