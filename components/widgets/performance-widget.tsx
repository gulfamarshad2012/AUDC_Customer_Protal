"use client"

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Gauge } from "lucide-react"

interface PerformanceWidgetProps {
  onRemove: () => void
}

export function PerformanceWidget({ onRemove }: PerformanceWidgetProps) {
  const metrics = [
    { label: "Response Time", value: "245ms", status: "good" },
    { label: "Uptime", value: "99.9%", status: "excellent" },
    { label: "Error Rate", value: "0.02%", status: "good" },
    { label: "Throughput", value: "1.2k/s", status: "good" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-500"
      case "good":
        return "text-blue-500"
      case "warning":
        return "text-yellow-500"
      case "critical":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4 text-primary" />
          Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm text-foreground">{metric.label}</span>
            </div>
            <span className={`text-sm font-medium ${getStatusColor(metric.status)}`}>{metric.value}</span>
          </div>
        ))}
      </CardContent>
    </div>
  )
}
