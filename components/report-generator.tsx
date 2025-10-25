"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Download, FileText, BarChart3, Package, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

const reportTypes = [
  {
    id: "sales",
    name: "Sales Report",
    description: "Revenue, orders, and sales performance",
    icon: DollarSign,
  },
  {
    id: "inventory",
    name: "Inventory Report",
    description: "Stock levels, low inventory alerts",
    icon: Package,
  },
  {
    id: "analytics",
    name: "Analytics Report",
    description: "Customer behavior and conversion metrics",
    icon: BarChart3,
  },
  {
    id: "financial",
    name: "Financial Report",
    description: "Revenue vs expenses, profit margins",
    icon: FileText,
  },
]

export function ReportGenerator() {
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [format, setFormat] = useState("pdf")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleReportToggle = (reportId: string) => {
    setSelectedReports((prev) => (prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]))
  }

  const handleGenerate = async () => {
    if (selectedReports.length === 0) return

    setIsGenerating(true)
    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsGenerating(false)
    // Handle download logic here
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Reports</CardTitle>
        <CardDescription>Create custom reports for your business analytics and record keeping</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Types */}
        <div>
          <Label className="text-base font-medium">Select Report Types</Label>
          <div className="grid gap-4 mt-3 md:grid-cols-2">
            {reportTypes.map((report) => {
              const IconComponent = report.icon
              return (
                <div
                  key={report.id}
                  className={cn(
                    "flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors",
                    selectedReports.includes(report.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent/50",
                  )}
                  onClick={() => handleReportToggle(report.id)}
                >
                  <Checkbox
                    checked={selectedReports.includes(report.id)}
                    onChange={() => handleReportToggle(report.id)}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <span className="font-medium">{report.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Date Range */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>From Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-2",
                    !dateFrom && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP") : "Select start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>To Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal mt-2", !dateTo && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP") : "Select end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <Label>Export Format</Label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF Document</SelectItem>
              <SelectItem value="csv">CSV Spreadsheet</SelectItem>
              <SelectItem value="xlsx">Excel Workbook</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Generate Button */}
        <Button onClick={handleGenerate} disabled={selectedReports.length === 0 || isGenerating} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating Reports..." : "Generate & Download Reports"}
        </Button>
      </CardContent>
    </Card>
  )
}
