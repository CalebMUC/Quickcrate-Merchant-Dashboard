"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, MessageSquare, Phone, Mail, Clock } from "lucide-react"

const supportTickets = [
  {
    id: "TICK-001",
    subject: "Payment processing issue",
    status: "open",
    priority: "high",
    createdAt: "2024-01-15",
    lastUpdate: "2024-01-16",
  },
  {
    id: "TICK-002",
    subject: "Product upload problem",
    status: "in-progress",
    priority: "medium",
    createdAt: "2024-01-12",
    lastUpdate: "2024-01-14",
  },
  {
    id: "TICK-003",
    subject: "Account verification",
    status: "resolved",
    priority: "low",
    createdAt: "2024-01-10",
    lastUpdate: "2024-01-11",
  },
]

const statusColors = {
  open: "bg-red-500/10 text-red-500 border-red-500/20",
  "in-progress": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  resolved: "bg-green-500/10 text-green-500 border-green-500/20",
}

const priorityColors = {
  high: "bg-red-500/10 text-red-500 border-red-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  low: "bg-green-500/10 text-green-500 border-green-500/20",
}

export default function SupportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate ticket submission
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Support</h1>
        <p className="text-muted-foreground">Get help with your account, raise tickets, or contact our support team.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Contact Support
            </CardTitle>
            <CardDescription>Multiple ways to get in touch with our support team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div className="p-2 rounded-lg bg-muted">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Live Chat</h4>
                  <p className="text-sm text-muted-foreground">Chat with our support team in real-time</p>
                </div>
                <Button variant="outline">Start Chat</Button>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div className="p-2 rounded-lg bg-muted">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Phone Support</h4>
                  <p className="text-sm text-muted-foreground">Call us at +1 (555) 123-4567</p>
                </div>
                <Button variant="outline">Call Now</Button>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div className="p-2 rounded-lg bg-muted">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Email Support</h4>
                  <p className="text-sm text-muted-foreground">Send us an email at support@merchanthub.com</p>
                </div>
                <Button variant="outline">Send Email</Button>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Support Hours</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Monday - Friday: 9:00 AM - 6:00 PM EST
                <br />
                Saturday - Sunday: 10:00 AM - 4:00 PM EST
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Create Ticket */}
        <Card>
          <CardHeader>
            <CardTitle>Create Support Ticket</CardTitle>
            <CardDescription>Submit a detailed support request for complex issues</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Brief description of your issue" required />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="account">Account Issues</SelectItem>
                      <SelectItem value="payments">Payment Problems</SelectItem>
                      <SelectItem value="products">Product Management</SelectItem>
                      <SelectItem value="technical">Technical Issues</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide detailed information about your issue..."
                  className="min-h-[120px]"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Ticket"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Support Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Your Support Tickets</CardTitle>
          <CardDescription>Track the status of your submitted support requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {supportTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{ticket.subject}</span>
                    <Badge variant="outline" className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                      {ticket.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{ticket.id}</span>
                    <span>•</span>
                    <span>Created {ticket.createdAt}</span>
                    <span>•</span>
                    <span>Updated {ticket.lastUpdate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={statusColors[ticket.status as keyof typeof statusColors]}>
                    {ticket.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
