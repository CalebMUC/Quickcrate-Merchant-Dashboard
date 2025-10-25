"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreditCard, Building2, Smartphone, Plus, MoreVertical, Star, Trash2, Edit } from "lucide-react"
import { AddPaymentMethodModal } from "./add-payment-method-modal"

const paymentMethods = [
  {
    id: "pm-1",
    type: "bank",
    name: "Chase Business Checking",
    details: "****1234",
    status: "active",
    primary: true,
    icon: Building2,
    addedDate: "2024-01-10",
    lastUsed: "2024-01-15",
  },
  {
    id: "pm-2",
    type: "card",
    name: "Business Credit Card",
    details: "****5678",
    status: "active",
    primary: false,
    icon: CreditCard,
    addedDate: "2024-01-05",
    lastUsed: "2024-01-12",
  },
  {
    id: "pm-3",
    type: "digital",
    name: "PayPal Business",
    details: "business@example.com",
    status: "pending",
    primary: false,
    icon: Smartphone,
    addedDate: "2024-01-14",
    lastUsed: null,
  },
]

const statusColors = {
  active: "bg-green-500/10 text-green-500 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  inactive: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

export function PaymentMethods() {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <>
      <Card className="animate-in fade-in-50 duration-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage how you receive payments from customers</CardDescription>
            </div>
            <Button onClick={() => setShowAddModal(true)} className="hover:scale-105 transition-transform">
              <Plus className="mr-2 h-4 w-4" />
              Add Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method, index) => {
              const IconComponent = method.icon
              return (
                <div
                  key={method.id}
                  className="group flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 hover:shadow-md transition-all duration-200 animate-in slide-in-from-left-5"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg transition-colors ${
                        method.status === "active" ? "bg-green-100 dark:bg-green-900/20" : "bg-muted"
                      }`}
                    >
                      <IconComponent
                        className={`h-5 w-5 ${method.status === "active" ? "text-green-600 dark:text-green-400" : ""}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{method.name}</span>
                        {method.primary && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                              Primary
                            </Badge>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{method.details}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Added {method.addedDate}</span>
                        {method.lastUsed && <span>Last used {method.lastUsed}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={`${statusColors[method.status as keyof typeof statusColors]} transition-colors`}
                    >
                      {method.status}
                    </Badge>
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
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {!method.primary && (
                          <DropdownMenuItem>
                            <Star className="mr-2 h-4 w-4" />
                            Set as Primary
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Empty State */}
          {paymentMethods.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No payment methods</h3>
              <p className="text-muted-foreground mb-4">
                Add a payment method to start receiving payouts from your sales.
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Payment Method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AddPaymentMethodModal open={showAddModal} onOpenChange={setShowAddModal} />
    </>
  )
}
