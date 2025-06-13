
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Wheat, Leaf } from "lucide-react"

interface TopNavigationProps {
  title: string
  actionButton?: React.ReactNode
}

export function TopNavigation({ title, actionButton }: TopNavigationProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-card agriculture-pattern">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-agriculture-600" />
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
      </div>
      {actionButton && (
        <div className="flex items-center gap-2">
          {actionButton}
        </div>
      )}
    </div>
  )
}
