"use client"
import Image from "next/image"

const data = [
  {
    name: "Wireless Headphones",
    sales: 1240,
    image: "/diverse-people-listening-headphones.png",
    revenue: "$24,800",
  },
  {
    name: "Smart Watch",
    sales: 980,
    image: "/modern-smartwatch.png",
    revenue: "$19,600",
  },
  {
    name: "White T-Shirt",
    sales: 756,
    image: "/plain-white-tshirt.png",
    revenue: "$15,120",
  },
  {
    name: "Yoga Mat",
    sales: 642,
    image: "/rolled-yoga-mat.png",
    revenue: "$12,840",
  },
  {
    name: "Coffee Mug",
    sales: 534,
    image: "/ceramic-coffee-mug.jpg",
    revenue: "$10,680",
  },
]

export function TopProductsChart() {
  return (
    <div className="animate-in slide-in-from-right-5 duration-700">
      <div className="space-y-4">
        {data.map((product, index) => (
          <div
            key={product.name}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200 animate-in fade-in-0 slide-in-from-left-5"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 group">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-110"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm truncate">{product.name}</h4>
                <span className="text-sm font-bold text-primary">{product.revenue}</span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${(product.sales / Math.max(...data.map((d) => d.sales))) * 100}%`,
                      animationDelay: `${index * 200}ms`,
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium min-w-fit">{product.sales} sales</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
