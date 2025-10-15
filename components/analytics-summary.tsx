import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

const metrics = [
  {
    title: "Conversion Rate",
    value: "3.2%",
    change: "+0.5%",
    trend: "up",
    description: "from last month",
  },
  {
    title: "Average Order Value",
    value: "$127.50",
    change: "+$12.30",
    trend: "up",
    description: "from last month",
  },
  {
    title: "Customer Retention",
    value: "68%",
    change: "-2%",
    trend: "down",
    description: "from last month",
  },
  {
    title: "Return Rate",
    value: "2.1%",
    change: "0%",
    trend: "neutral",
    description: "from last month",
  },
]

export function AnalyticsSummary() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            {metric.trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
            {metric.trend === "down" && <TrendingDown className="h-4 w-4 text-red-500" />}
            {metric.trend === "neutral" && <Minus className="h-4 w-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">
              <span
                className={
                  metric.trend === "up"
                    ? "text-green-500"
                    : metric.trend === "down"
                      ? "text-red-500"
                      : "text-muted-foreground"
                }
              >
                {metric.change}
              </span>{" "}
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
