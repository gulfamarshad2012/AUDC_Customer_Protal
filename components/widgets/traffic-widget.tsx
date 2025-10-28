"use client"

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe } from "lucide-react"

interface TrafficWidgetProps {
  onRemove: () => void
}

export function TrafficWidget({ onRemove }: TrafficWidgetProps) {
  const sources = [
    { name: "Direct", percentage: 45, color: "bg-blue-500" },
    { name: "Google", percentage: 32, color: "bg-green-500" },
    { name: "Social", percentage: 15, color: "bg-purple-500" },
    { name: "Email", percentage: 8, color: "bg-yellow-500" },
  ]

  return (
    <div className="h-full">
      <CardHeader className="pb-3 bg-white">
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="h-4 w-4 text-primary" />
          Traffic Sources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 bg-white">
        {sources.map((source, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">{source.name}</span>
              <span className="text-muted-foreground">{source.percentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className={`h-2 rounded-full ${source.color}`} style={{ width: `${source.percentage}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </div>
  )
}
