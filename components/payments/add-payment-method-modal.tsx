"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { paymentsService } from "@/lib/api/payments"
import { MerchantPaymentMethod, CreatePaymentMethodRequest } from "@/types"

interface AddPaymentMethodModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingMethod?: MerchantPaymentMethod | null
  onSuccess?: () => void
}

export function AddPaymentMethodModal({
  open,
  onOpenChange,
  editingMethod,
  onSuccess,
}: AddPaymentMethodModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreatePaymentMethodRequest>({
    type: "BankTransfer",
    name: "",
    isPrimary: false,
  })

  useEffect(() => {
    if (editingMethod) {
      setFormData({
        type: editingMethod.type as any,
        name: editingMethod.name,
        isPrimary: editingMethod.isPrimary,
        bankName: editingMethod.bankName,
        accountHolderName: editingMethod.accountHolderName,
        mobileMoneyProvider: editingMethod.mobileMoneyProvider,
        payPalEmail: editingMethod.payPalEmail,
      })
    } else {
      setFormData({
        type: "BankTransfer",
        name: "",
        isPrimary: false,
      })
    }
  }, [editingMethod, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingMethod) {
        await paymentsService.updatePaymentMethod(editingMethod.paymentMethodId, formData)
      } else {
        await paymentsService.createPaymentMethod(formData)
      }
      onSuccess?.()
    } catch (error) {
      console.error("Error saving payment method:", error)
      alert("Failed to save payment method. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case "BankTransfer":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name *</Label>
              <Input
                id="bankName"
                value={formData.bankName || ""}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="e.g., Chase Bank"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber || ""}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="Enter account number"
                type="password"
                required
                disabled={!!editingMethod}
              />
              {editingMethod && (
                <p className="text-xs text-muted-foreground">Account number cannot be changed</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountHolderName">Account Holder Name *</Label>
              <Input
                id="accountHolderName"
                value={formData.accountHolderName || ""}
                onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                placeholder="Full name on account"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="routingNumber">Routing Number (Optional)</Label>
              <Input
                id="routingNumber"
                value={formData.routingNumber || ""}
                onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
                placeholder="9-digit routing number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="swiftCode">SWIFT/BIC Code (Optional)</Label>
              <Input
                id="swiftCode"
                value={formData.swiftCode || ""}
                onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                placeholder="For international transfers"
              />
            </div>
          </>
        )

      case "MobileMoney":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="mobileMoneyProvider">Provider *</Label>
              <Select
                value={formData.mobileMoneyProvider || ""}
                onValueChange={(value) => setFormData({ ...formData, mobileMoneyProvider: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                  <SelectItem value="Airtel Money">Airtel Money</SelectItem>
                  <SelectItem value="MTN Mobile Money">MTN Mobile Money</SelectItem>
                  <SelectItem value="Vodafone Cash">Vodafone Cash</SelectItem>
                  <SelectItem value="Orange Money">Orange Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number *</Label>
              <Input
                id="mobileNumber"
                value={formData.mobileNumber || ""}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                placeholder="+1234567890"
                type="tel"
                required
                disabled={!!editingMethod}
              />
              {editingMethod && (
                <p className="text-xs text-muted-foreground">Mobile number cannot be changed</p>
              )}
            </div>
          </>
        )

      case "PayPal":
        return (
          <div className="space-y-2">
            <Label htmlFor="payPalEmail">PayPal Email *</Label>
            <Input
              id="payPalEmail"
              type="email"
              value={formData.payPalEmail || ""}
              onChange={(e) => setFormData({ ...formData, payPalEmail: e.target.value })}
              placeholder="your@email.com"
              required
              disabled={!!editingMethod}
            />
            {editingMethod && (
              <p className="text-xs text-muted-foreground">PayPal email cannot be changed</p>
            )}
          </div>
        )

      case "DebitCard":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                value={formData.cardNumber || ""}
                onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value.replace(/\s/g, "") })}
                placeholder="1234 5678 9012 3456"
                maxLength={16}
                required
                disabled={!!editingMethod}
              />
              {editingMethod && (
                <p className="text-xs text-muted-foreground">Card number cannot be changed</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardHolderName">Cardholder Name *</Label>
              <Input
                id="cardHolderName"
                value={formData.cardHolderName || ""}
                onChange={(e) => setFormData({ ...formData, cardHolderName: e.target.value })}
                placeholder="Name on card"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date (MM/YY) *</Label>
              <Input
                id="expiryDate"
                value={formData.expiryDate || ""}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                placeholder="12/25"
                maxLength={5}
                required
                disabled={!!editingMethod}
              />
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingMethod ? "Edit Payment Method" : "Add Payment Method"}</DialogTitle>
          <DialogDescription>
            {editingMethod
              ? "Update your payment method details"
              : "Add a new payment method to receive payouts"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Payment Method Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              disabled={!!editingMethod}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BankTransfer">Bank Transfer</SelectItem>
                <SelectItem value="MobileMoney">Mobile Money</SelectItem>
                <SelectItem value="PayPal">PayPal</SelectItem>
                <SelectItem value="DebitCard">Debit Card</SelectItem>
                <SelectItem value="Cryptocurrency">Cryptocurrency</SelectItem>
              </SelectContent>
            </Select>
            {editingMethod && (
              <p className="text-xs text-muted-foreground">Payment type cannot be changed</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Display Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Primary Business Account"
              required
            />
          </div>

          {renderTypeSpecificFields()}

          <div className="flex items-center space-x-2 py-4">
            <Checkbox
              id="isPrimary"
              checked={formData.isPrimary}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isPrimary: checked as boolean })
              }
            />
            <Label htmlFor="isPrimary" className="text-sm font-normal cursor-pointer">
              Set as primary payment method
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingMethod ? "Update Method" : "Add Method"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
