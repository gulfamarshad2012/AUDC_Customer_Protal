"use client"

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, CheckCircle, AlertCircle } from "lucide-react"

interface DatabaseWidgetProps {
  onRemove: () => void
}

export function DatabaseWidget({ onRemove }: DatabaseWidgetProps) {
  const databases = [
    { name: "Primary DB", status: "healthy", connections: 45, latency: "12ms" },
    { name: "Analytics DB", status: "healthy", connections: 23, latency: "8ms" },
    { name: "Cache Redis", status: "warning", connections: 156, latency: "2ms" },
  ]

  return (
    <div className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Database className="h-4 w-4 text-primary" />
          Database Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {databases.map((db, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              {db.status === "healthy" ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-sm font-medium text-foreground">{db.name}</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{db.connections} conn</p>
              <p className="text-xs text-muted-foreground">{db.latency}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </div>
  )
}
