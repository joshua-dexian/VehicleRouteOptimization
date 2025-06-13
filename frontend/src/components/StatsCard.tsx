import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { NumberShuffler } from "@/components/NumberShuffler"

interface StatsCardProps {
  title: string
  value: string | number | React.ReactNode
  icon?: React.ReactNode
  className?: string
  actionButton?: React.ReactNode
  enableShuffling?: boolean
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  className, 
  actionButton,
  enableShuffling = true 
}: StatsCardProps) {
  return (
    <Card className={cn("p-4", className)}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            {icon}
            {title}
          </span>
          {actionButton}
        </div>
        <div className="text-2xl font-bold">
          {typeof value === 'string' && enableShuffling && /\d/.test(value) ? (
            <NumberShuffler value={value} />
          ) : (
            value
          )}
        </div>
      </CardContent>
    </Card>
  )
}
