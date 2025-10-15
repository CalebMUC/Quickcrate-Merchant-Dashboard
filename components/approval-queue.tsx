"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, Clock } from "lucide-react"

const pendingProducts = [
  {
    id: "PRD-006",
    name: "Wireless Mouse",
    category: "Electronics",
    price: 49.99,
    submittedAt: "2024-01-15",
    image: "/wireless-mouse.png",
  },
  {
    id: "PRD-007",
    name: "Leather Wallet",
    category: "Accessories",
    price: 79.99,
    submittedAt: "2024-01-14",
    image: "/leather-wallet.jpg",
  },
  {
    id: "PRD-008",
    name: "Plant Pot",
    category: "Home",
    price: 19.99,
    submittedAt: "2024-01-13",
    image: "/terracotta-pot-succulent.png",
  },
]

export function ApprovalQueue() {
  const handleApprove = (productId: string) => {
    console.log("Approving product:", productId)
    // Handle approval logic
  }

  const handleReject = (productId: string) => {
    console.log("Rejecting product:", productId)
    // Handle rejection logic
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Approval Queue
        </CardTitle>
        <CardDescription>Products waiting for approval before going live</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="h-12 w-12 rounded-lg object-cover border border-border"
                />
                <div>
                  <h4 className="font-medium">{product.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{product.category}</Badge>
                    <span>${product.price}</span>
                    <span>•</span>
                    <span>Submitted {product.submittedAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700 bg-transparent"
                  onClick={() => handleApprove(product.id)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 bg-transparent"
                  onClick={() => handleReject(product.id)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
