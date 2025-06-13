import React, { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Clock, MapPin, Truck, UserCircle2, Calendar, ArrowLeft, Trash2 } from "lucide-react"
import { routeHistoryAPI, RouteHistory } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { useRoutes } from "@/contexts/RouteContext"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Route } from "@/contexts/RouteContext"

interface RoutesHistorySliderProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RoutesHistorySlider({ open, onOpenChange }: RoutesHistorySliderProps) {
  const [routeHistory, setRouteHistory] = useState<RouteHistory[]>([])
  const [selectedRouteHistory, setSelectedRouteHistory] = useState<RouteHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Use the route context
  const { setRoutes, setSelectedRoute } = useRoutes()
  const { toast } = useToast()

  // Fetch route history from API
  useEffect(() => {
    const fetchRouteHistory = async () => {
      if (!open) return;
      
      setLoading(true)
      setError(null)
      
      try {
        const history = await routeHistoryAPI.getAll()
        setRouteHistory(history)
      } catch (err) {
        console.error("Error fetching route history:", err)
        setError("Failed to load route history. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load route history",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchRouteHistory()
  }, [open, toast])

  // Handle selecting a route from history
  const handleSelectRoute = (routeId: string) => {
    const route = routeHistory.find(r => r.id === routeId)
    if (route) {
      setSelectedRouteHistory(route)
    }
  }

  // Handle loading a route to the map
  const handleLoadRoute = () => {
    if (!selectedRouteHistory) return;
    
    // Convert RouteHistory to Route format
    const routeForMap: Route = {
      ...selectedRouteHistory,
      capacity: "Unknown", // Required by Route type
      // Add any other required fields from Route that might be missing in RouteHistory
    };
    
    // Add the route to the current routes and select it
    setRoutes(prevRoutes => {
      // Check if the route already exists in the current routes
      const exists = prevRoutes.some(r => r.id === routeForMap.id);
      if (exists) {
        return prevRoutes;
      } else {
        return [...prevRoutes, routeForMap];
      }
    });
    
    setSelectedRoute(routeForMap);
    
    // Close the slider
    onOpenChange(false);
    
    toast({
      title: "Route Loaded",
      description: `${selectedRouteHistory.routeName} has been loaded to the map`
    });
  }

  // Handle deleting a route from history
  const handleDeleteRoute = async () => {
    if (!selectedRouteHistory) return;
    
    try {
      await routeHistoryAPI.delete(selectedRouteHistory.id);
      
      // Update the local state
      setRouteHistory(prevHistory => prevHistory.filter(r => r.id !== selectedRouteHistory.id));
      setSelectedRouteHistory(null);
      
      toast({
        title: "Route Deleted",
        description: `${selectedRouteHistory.routeName} has been deleted from history`
      });
    } catch (err) {
      console.error("Error deleting route:", err);
      toast({
        title: "Error",
        description: "Failed to delete route from history",
        variant: "destructive"
      });
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-6xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-2xl">Routes History</SheetTitle>
        </SheetHeader>
        
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agriculture-600"></div>
          </div>
        ) : error ? (
          <div className="text-center p-4">
            <p className="text-red-500">{error}</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        ) : routeHistory.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-muted-foreground">No route history found.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete routes will be saved here for future reference.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Select
                value={selectedRouteHistory?.id || ""}
                onValueChange={handleSelectRoute}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a route" />
                </SelectTrigger>
                <SelectContent>
                  {routeHistory.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.routeName} - {formatDate(route.date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedRouteHistory && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-4 w-4 rounded-full" 
                          style={{ backgroundColor: selectedRouteHistory.color || '#4CAF50' }}
                        ></div>
                        <h3 className="font-medium text-lg">{selectedRouteHistory.routeName}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(selectedRouteHistory.date)}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1 capitalize">
                          {selectedRouteHistory.status}
                        </Badge>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={handleDeleteRoute}
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                        <Button 
                          size="sm"
                          className="bg-agriculture-600 hover:bg-agriculture-700 flex items-center gap-1"
                          onClick={handleLoadRoute}
                        >
                          Load
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedRouteHistory.vehicleName}</span>
                        </div>
                        {selectedRouteHistory.driverName && (
                          <div className="flex items-center gap-1">
                            <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedRouteHistory.driverName}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{selectedRouteHistory.totalDistance}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{selectedRouteHistory.estimatedTime}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="font-medium">Stop</TableHead>
                            <TableHead className="font-medium">Address</TableHead>
                            <TableHead className="font-medium">Arrival Time</TableHead>
                            <TableHead className="font-medium">Start Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedRouteHistory.stops.map((stop, index) => (
                            <TableRow key={stop.id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span>{stop.address}</span>
                                </div>
                              </TableCell>
                              <TableCell>{stop.calculatedArrivalTime || "-"}</TableCell>
                              <TableCell>{stop.calculatedStartTime || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-between items-center">
                  {/* Empty div to maintain spacing if needed */}
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

// Add default export
export default RoutesHistorySlider; 