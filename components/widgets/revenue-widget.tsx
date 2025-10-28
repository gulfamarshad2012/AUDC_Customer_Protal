"use client"

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp } from "lucide-react"

interface RevenueWidgetProps {
  onRemove: () => void
}

export function RevenueWidget({ onRemove }: RevenueWidgetProps) {
  return (
    <div className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="h-4 w-4 text-primary" />
          Revenue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-foreground">$45,231</p>
          <p className="text-sm text-muted-foreground">This month</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Today</span>
            <span className="text-foreground">$1,429</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Yesterday</span>
            <span className="text-foreground">$1,234</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Growth</span>
            <span className="flex items-center gap-1 text-green-500">
              <TrendingUp className="h-3 w-3" />
              +15.3%
            </span>
          </div>
        </div>
      </CardContent>
    </div>
  )
}
