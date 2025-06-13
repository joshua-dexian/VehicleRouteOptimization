import { useState } from "react"
import { TopNavigation } from "@/components/TopNavigation"
import { RouteMap } from "@/components/RouteMap"
import { PlanRoutesSlider } from "@/components/PlanRoutesSlider"
import RoutesHistorySlider from "@/components/RoutesHistorySlider"
import { Button } from "@/components/ui/button"
import { Target, History } from "lucide-react"
import { RouteProvider } from "@/contexts/RouteContext"

const Routes = () => {
  const [showPlanRoutes, setShowPlanRoutes] = useState(false)
  const [showRoutesHistory, setShowRoutesHistory] = useState(false)

  return (
    <RouteProvider>
      <div className="min-h-screen bg-background">
        <TopNavigation
          title="Route Optimization"
          actionButton={
            <div className="flex gap-2">
              <Button 
                variant="outline"
                className="border-agriculture-600 text-agriculture-600 hover:bg-agriculture-50"
                onClick={() => setShowRoutesHistory(true)}
              >
                <History className="h-4 w-4 mr-2" />
                Routes History
              </Button>
              <Button 
                className="bg-agriculture-600 hover:bg-agriculture-700"
                onClick={() => setShowPlanRoutes(true)}
              >
                <Target className="h-4 w-4 mr-2" />
                Plan New Route
              </Button>
            </div>
          }
        />
        <div className="p-6 space-y-6">
          <div className="space-y-6">
            <RouteMap />
          </div>
        </div>
        
        <PlanRoutesSlider open={showPlanRoutes} onOpenChange={setShowPlanRoutes} />
        <RoutesHistorySlider open={showRoutesHistory} onOpenChange={setShowRoutesHistory} />
      </div>
    </RouteProvider>
  )
}

export default Routes
