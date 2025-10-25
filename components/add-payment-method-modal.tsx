"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { CreditCard, Building2, Smartphone, Shield, CheckCircle } from "lucide-react"

interface AddPaymentMethodModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPaymentMethodModal({ open, onOpenChange }: AddPaymentMethodModalProps) {
  const [selectedMethod, setSelectedMethod] = useState("bank")
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    accountName: "",
    accountNumber: "",
    routingNumber: "",
    bankName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    email: "",
    setPrimary: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsLoading(false)
    onOpenChange(false)

    // Reset form
    setFormData({
      accountName: "",
      accountNumber: "",
      routingNumber: "",
      bankName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
      email: "",
      setPrimary: false,
    })
  }

  const paymentMethods = [
    {
      id: "bank",
      name: "Bank Account",
      description: "Direct bank transfer - Lower fees",
      icon: Building2,
      recommended: true,
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      description: "Instant payouts available",
      icon: CreditCard,
      recommended: false,
    },
    {
      id: "digital",
      name: "Digital Wallet",
      description: "PayPal, Apple Pay, Google Pay",
      icon: Smartphone,
      recommended: false,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Add Payment Method
          </DialogTitle>
          <DialogDescription>
            Add a new payment method to receive payouts from your sales. All information is encrypted and secure.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Method Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Choose Payment Method</Label>
            <div className="grid gap-3">
              {paymentMethods.map((method) => {
                const IconComponent = method.icon
                return (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedMethod === method.id
                        ? "ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                        : "hover:bg-accent/50"
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              selectedMethod === method.id ? "bg-blue-500 text-white" : "bg-muted"
                            }`}
                          >
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{method.name}</span>
                              {method.recommended && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                          </div>
                        </div>
                        {selectedMethod === method.id && <CheckCircle className="h-5 w-5 text-blue-500" />}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Form Fields */}
          <Tabs value={selectedMethod} className="space-y-4">
            <TabsContent value="bank" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Holder Name</Label>
                  <Input
                    id="accountName"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="Chase Bank"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="1234567890"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input
                    id="routingNumber"
                    value={formData.routingNumber}
                    onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
                    placeholder="021000021"
                    required
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="card" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    value={formData.cardholderName}
                    onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                    placeholder="123"
                    required
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="digital" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    You'll be redirected to complete the setup with your chosen digital wallet provider.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Set as Primary */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="setPrimary"
              checked={formData.setPrimary}
              onCheckedChange={(checked) => setFormData({ ...formData, setPrimary: checked as boolean })}
            />
            <Label htmlFor="setPrimary" className="text-sm">
              Set as primary payment method
            </Label>
          </div>

          {/* Security Notice */}
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Your information is secure</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  All payment information is encrypted using bank-level security and never stored on our servers.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Payment Method"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
