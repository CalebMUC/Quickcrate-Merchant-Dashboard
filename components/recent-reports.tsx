import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Calendar } from "lucide-react"

const recentReports = [
  {
    id: "RPT-001",
    name: "Monthly Sales Report",
    type: "Sales",
    generatedAt: "2024-01-15",
    format: "PDF",
    size: "2.4 MB",
    status: "ready",
  },
  {
    id: "RPT-002",
    name: "Inventory Analysis",
    type: "Inventory",
    generatedAt: "2024-01-12",
    format: "CSV",
    size: "1.8 MB",
    status: "ready",
  },
  {
    id: "RPT-003",
    name: "Q4 Financial Summary",
    type: "Financial",
    generatedAt: "2024-01-10",
    format: "Excel",
    size: "3.2 MB",
    status: "ready",
  },
  {
    id: "RPT-004",
    name: "Customer Analytics",
    type: "Analytics",
    generatedAt: "2024-01-08",
    format: "PDF",
    size: "1.9 MB",
    status: "expired",
  },
]

const statusColors = {
  ready: "bg-green-500/10 text-green-500 border-green-500/20",
  expired: "bg-red-500/10 text-red-500 border-red-500/20",
  generating: "bg-blue-500/10 text-blue-500 border-blue-500/20",
}

export function RecentReports() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reports</CardTitle>
        <CardDescription>Your previously generated reports and downloads</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentReports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{report.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {report.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{report.generatedAt}</span>
                    <span>•</span>
                    <span>{report.format}</span>
                    <span>•</span>
                    <span>{report.size}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={statusColors[report.status as keyof typeof statusColors]}>
                  {report.status}
                </Badge>
                {report.status === "ready" && (
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
