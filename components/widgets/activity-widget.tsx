"use client"

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Clock } from "lucide-react"

interface ActivityWidgetProps {
  onRemove: () => void
}

export function ActivityWidget({ onRemove }: ActivityWidgetProps) {
  const activities = [
    { action: "New user registered", time: "2 min ago", type: "user" },
    { action: "Payment processed", time: "5 min ago", type: "payment" },
    { action: "Database backup completed", time: "12 min ago", type: "system" },
    { action: "New order received", time: "18 min ago", type: "order" },
  ]

  const getActivityColor = (type: string) => {
    switch (type) {
      case "user":
        return "text-blue-500"
      case "payment":
        return "text-green-500"
      case "system":
        return "text-yellow-500"
      case "order":
        return "text-purple-500"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full mt-2 ${getActivityColor(activity.type).replace("text-", "bg-")}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{activity.action}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </div>
  )
}
