"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, User, Shield, Palette, Bell, Settings } from "lucide-react"
import Link from "next/link"

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your personal information and account preferences.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and contact information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <User className="mx-auto h-12 w-12 mb-4" />
              <p>Profile management interface coming soon...</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Manage your business details and merchant information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Settings className="mx-auto h-12 w-12 mb-4" />
              <p>Business settings interface coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}