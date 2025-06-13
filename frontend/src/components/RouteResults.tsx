
import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { MapPin, Clock, Package, Truck, User, Navigation } from "lucide-react"

interface RouteResult {
  id: string
  routeName: string
  vehicleId: string
  vehicleName: string
  capacity: string
  totalDistance: string
  estimatedTime: string
  departureTime: string
  arrivalTime: string
  from: string
  to: string
  assignedDriver?: string
  stops: {
    id: string
    address: string
    type: "pickup" | "delivery"
    timeWindow: string
    items: string[]
  }[]
}

interface RouteResultsProps {
  routeResults: RouteResult[]
  availableDrivers: { id: string; name: string; license: string }[]
  onDriverAssign: (routeId: string, driverId: string) => void
}

export function RouteResults({ routeResults, availableDrivers, onDriverAssign }: RouteResultsProps) {
  const [driverAssignments, setDriverAssignments] = useState<Record<string, string>>({})

  const handleDriverSelection = (routeId: string, driverId: string) => {
    setDriverAssignments(prev => ({
      ...prev,
      [routeId]: driverId
    }))
    onDriverAssign(routeId, driverId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Navigation className="h-5 w-5 text-agriculture-600" />
        <h3 className="text-lg font-semibold">Generated Routes</h3>
        <Badge className="bg-agriculture-600">{routeResults.length}</Badge>
      </div>

      {routeResults.map((route) => (
        <Card key={route.id} className="border-l-4 border-l-agriculture-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{route.routeName}</CardTitle>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {route.stops.length} stops
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Route Details */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 mb-3">Route Details</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-agriculture-600" />
                    <span className="font-medium">Vehicle:</span>
                    <span>{route.vehicleName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-agriculture-600" />
                    <span className="font-medium">Capacity:</span>
                    <span>{route.capacity}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-agriculture-600" />
                    <span className="font-medium">Distance:</span>
                    <span>{route.totalDistance}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-agriculture-600" />
                    <span className="font-medium">Est. Time:</span>
                    <span>{route.estimatedTime}</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <h5 className="font-medium text-gray-900 mb-2">Time Windows</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Departure:</span>
                      <span>{route.departureTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Arrival:</span>
                      <span>{route.arrivalTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">From:</span>
                      <span>{route.from}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">To:</span>
                      <span>{route.to}</span>
                    </div>
                  </div>
                </div>

                {/* Driver Assignment */}
                <div className="pt-3 border-t">
                  <Label htmlFor={`driver-${route.id}`} className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-agriculture-600" />
                    Assign Driver
                  </Label>
                  <Select 
                    value={driverAssignments[route.id] || ""} 
                    onValueChange={(value) => handleDriverSelection(route.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDrivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name} - {driver.license}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Route Stops */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 mb-3">Route Stops</h4>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {route.stops.map((stop, index) => (
                    <div key={stop.id} className="flex items-start gap-3 p-3 border rounded-lg bg-gray-50">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium
                        ${stop.type === "pickup" ? "bg-blue-500" : "bg-agriculture-600"}`}>
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={stop.type === "pickup" ? "secondary" : "default"} className="text-xs">
                            {stop.type === "pickup" ? "Pickup" : "Delivery"}
                          </Badge>
                        </div>
                        
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {stop.address}
                        </div>
                        
                        <div className="text-xs text-muted-foreground mb-1">
                          {stop.timeWindow}
                        </div>
                        
                        <div className="text-xs text-gray-600">
                          {stop.items.join(", ")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
