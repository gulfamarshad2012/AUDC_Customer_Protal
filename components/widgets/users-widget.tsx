"use client"

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus } from "lucide-react"

interface UsersWidgetProps {
  onRemove: () => void
}

export function UsersWidget({ onRemove }: UsersWidgetProps) {
  return (
    <div className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-primary" />
          Active Users
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-foreground">2,847</p>
          <p className="text-sm text-muted-foreground">Currently online</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">New today</span>
            <span className="flex items-center gap-1 text-green-500">
              <UserPlus className="h-3 w-3" />
              +127
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">This week</span>
            <span className="text-foreground">+892</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">This month</span>
            <span className="text-foreground">+3,421</span>
          </div>
        </div>
      </CardContent>
    </div>
  )
}
