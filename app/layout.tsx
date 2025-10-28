import type React from "react"
import type { Metadata } from "next"
// import { Inter } from "next/font/google"
// import "./globals.css"
import "../styles/globals.css"
import { AuthProvider } from "@/lib/contexts/AuthContext"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"

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
          <SonnerToaster 
            position="top-right" 
            richColors={true}
            closeButton={true}
            expand={true}
            visibleToasts={4}
            duration={4000}
            toastOptions={{
              style: {
                borderRadius: '8px',
                fontSize: '14px',
                padding: '16px',
                border: '1px solid',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                backdropFilter: 'blur(8px)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
