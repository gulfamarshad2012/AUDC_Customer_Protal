"use client"

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, ArrowUp, ArrowDown } from "lucide-react"

interface GrowthWidgetProps {
  onRemove: () => void
}

export function GrowthWidget({ onRemove }: GrowthWidgetProps) {
  const metrics = [
    { label: "Monthly Growth", value: "+23.5%", trend: "up", period: "vs last month" },
    { label: "User Acquisition", value: "+18.2%", trend: "up", period: "this quarter" },
    { label: "Churn Rate", value: "-2.1%", trend: "down", period: "improvement" },
  ]

  return (
    <div className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-primary" />
          Growth Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">{metric.label}</span>
              <div className={`flex items-center gap-1 ${metric.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                {metric.trend === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                <span className="text-sm font-medium">{metric.value}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{metric.period}</p>
          </div>
        ))}
      </CardContent>
    </div>
  )
}
