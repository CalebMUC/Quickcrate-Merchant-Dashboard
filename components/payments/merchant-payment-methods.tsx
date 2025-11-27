"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreVertical, Star, Trash2, Edit, CheckCircle2, AlertCircle } from "lucide-react"
import { PaymentMethodIcon } from "./payment-method-icon"
import { AddPaymentMethodModal } from "./add-payment-method-modal"
import { paymentsService } from "@/lib/api/payments"
import { MerchantPaymentMethod } from "@/types"
import { cn } from "@/lib/utils"

export function MerchantPaymentMethods() {
  const [methods, setMethods] = useState<MerchantPaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMethod, setEditingMethod] = useState<MerchantPaymentMethod | null>(null)

  useEffect(() => {
    loadPaymentMethods()
  }, [])

  const loadPaymentMethods = async () => {
    try {
      const data = await paymentsService.getMerchantPaymentMethods()
      setMethods(data)
    } catch (error) {
      console.error("Error loading payment methods:", error)
      // Use mock data for development
      setMethods([])
    } finally {
      setLoading(false)
    }
  }

  const handleSetPrimary = async (methodId: string) => {
    try {
      await paymentsService.setPrimaryPaymentMethod(methodId)
      await loadPaymentMethods()
    } catch (error) {
      console.error("Error setting primary method:", error)
    }
  }

  const handleDelete = async (methodId: string) => {
    if (!confirm("Are you sure you want to delete this payment method?")) {
      return
    }

    try {
      await paymentsService.deletePaymentMethod(methodId)
      await loadPaymentMethods()
    } catch (error) {
      console.error("Error deleting payment method:", error)
      alert("Failed to delete payment method. It may have pending payouts.")
    }
  }

  const handleEdit = (method: MerchantPaymentMethod) => {
    setEditingMethod(method)
    setShowAddModal(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <>
      <Card className="animate-in fade-in-50 duration-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage how you receive payouts from your sales
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setEditingMethod(null)
                setShowAddModal(true)
              }}
              className="hover:scale-105 transition-transform"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Loading payment methods...</p>
            </div>
          ) : methods.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-muted rounded-full">
                  <AlertCircle className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">No payment methods</h3>
                  <p className="text-muted-foreground mb-4">
                    Add a payment method to start receiving payouts from your sales.
                  </p>
                  <Button
                    onClick={() => {
                      setEditingMethod(null)
                      setShowAddModal(true)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Payment Method
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {methods.map((method, index) => (
                <div
                  key={method.paymentMethodId}
                  className={cn(
                    "group flex items-center justify-between p-4 rounded-lg border transition-all duration-200",
                    "hover:bg-accent/50 hover:shadow-md animate-in slide-in-from-left-5",
                    method.isActive
                      ? "border-border bg-background"
                      : "border-dashed border-muted-foreground/30 bg-muted/20"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <PaymentMethodIcon
                      type={method.type}
                      className={cn(!method.isActive && "opacity-50")}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("font-medium", !method.isActive && "text-muted-foreground")}>
                          {method.name}
                        </span>
                        {method.isPrimary && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <Badge
                              variant="outline"
                              className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
                            >
                              Primary
                            </Badge>
                          </div>
                        )}
                        {method.isVerified ? (
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
                          >
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pending Verification
                          </Badge>
                        )}
                      </div>

                      {/* Method Details */}
                      <div className="space-y-0.5">
                        {method.type === "BankTransfer" && (
                          <>
                            <p className="text-sm text-muted-foreground">
                              {method.bankName} • {method.maskedAccountNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">{method.accountHolderName}</p>
                          </>
                        )}
                        {method.type === "MobileMoney" && (
                          <p className="text-sm text-muted-foreground">
                            {method.mobileMoneyProvider} • {method.maskedMobileNumber}
                          </p>
                        )}
                        {method.type === "PayPal" && (
                          <p className="text-sm text-muted-foreground">{method.payPalEmail}</p>
                        )}
                        {method.type === "DebitCard" && (
                          <p className="text-sm text-muted-foreground">
                            {method.cardBrand} •••• {method.cardLast4}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Added {formatDate(method.createdOn)}</span>
                        {method.lastUsedOn && (
                          <>
                            <span>•</span>
                            <span>Last used {formatDate(method.lastUsedOn)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!method.isActive && (
                      <Badge
                        variant="outline"
                        className="bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
                      >
                        Inactive
                      </Badge>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(method)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {!method.isPrimary && method.isActive && (
                          <DropdownMenuItem onClick={() => handleSetPrimary(method.paymentMethodId)}>
                            <Star className="mr-2 h-4 w-4" />
                            Set as Primary
                          </DropdownMenuItem>
                        )}
                        {!method.isPrimary && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(method.paymentMethodId)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Help Text */}
          {methods.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    About Payment Methods
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Your primary payment method will be used for all automatic payouts. You can change your
                    primary method at any time. Verified methods enable faster payout processing.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AddPaymentMethodModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        editingMethod={editingMethod}
        onSuccess={() => {
          loadPaymentMethods()
          setShowAddModal(false)
          setEditingMethod(null)
        }}
      />
    </>
  )
}
