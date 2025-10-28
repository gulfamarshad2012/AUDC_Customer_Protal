"use client"

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react"

interface AnalyticsWidgetProps {
  onRemove: () => void
}

export function AnalyticsWidget({ onRemove }: AnalyticsWidgetProps) {
  const metrics = [
    { label: "Page Views", value: "124,532", change: "+12.5%", trend: "up" },
    { label: "Sessions", value: "45,231", change: "+8.2%", trend: "up" },
    { label: "Bounce Rate", value: "32.1%", change: "-2.4%", trend: "down" },
  ]

  return (
    <div className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-primary" />
          Analytics Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{metric.label}</p>
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
            </div>
            <div
              className={`flex items-center gap-1 text-sm ${metric.trend === "up" ? "text-green-500" : "text-red-500"}`}
            >
              {metric.trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {metric.change}
            </div>
          </div>
        ))}
      </CardContent>
    </div>
  )
}
