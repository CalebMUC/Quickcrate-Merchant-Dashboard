"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, MessageSquare, Phone, Mail, Calendar } from "lucide-react"
import Link from "next/link"

export default function ContactSupportPage() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/support">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Contact Support</h1>
          </div>
          <p className="text-muted-foreground">
            Get in touch with our support team for assistance.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Live Chat
            </CardTitle>
            <CardDescription>
              Chat with our support team in real-time for immediate assistance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-500" />
              Email Support
            </CardTitle>
            <CardDescription>
              Send us an email and we'll get back to you within 24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-purple-500" />
              Phone Support
            </CardTitle>
            <CardDescription>
              Call our support hotline for urgent issues and complex problems.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              Call Now
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              Schedule Meeting
            </CardTitle>
            <CardDescription>
              Book a one-on-one session with our technical specialists.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Book Meeting
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            Our support team is available to help you with any questions or issues.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-medium">Live Chat</h3>
              <p className="text-sm text-muted-foreground">Available 24/7</p>
            </div>
            <div className="text-center">
              <Mail className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-medium">Email</h3>
              <p className="text-sm text-muted-foreground">support@merchanthub.com</p>
            </div>
            <div className="text-center">
              <Phone className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <h3 className="font-medium">Phone</h3>
              <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}