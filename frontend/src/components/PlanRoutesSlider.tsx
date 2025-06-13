import React, { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, MapPin, Truck, User } from "lucide-react"
import { depotsAPI, Depot, vehiclesAPI, Vehicle, driversAPI, Driver, ordersAPI, Order } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { useRoutes } from "@/contexts/RouteContext"

interface PlanRoutesSliderProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlanRoutesSlider({ open, onOpenChange }: PlanRoutesSliderProps) {
  const [showRoutes, setShowRoutes] = useState(false)
  const [routeName, setRouteName] = useState("")
  const [selectedDepot, setSelectedDepot] = useState("")
  const [vehicleCount, setVehicleCount] = useState(1)
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])
  
  // State for real-time data
  const [depots, setDepots] = useState<Depot[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Use the route context
  const { setRoutes, setSelectedRoute } = useRoutes()
  const { toast } = useToast()

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Fetch all data in parallel
        const [depotsData, vehiclesData, driversData, ordersData] = await Promise.all([
          depotsAPI.getAll(),
          vehiclesAPI.getAll(),
          driversAPI.getAll(),
          ordersAPI.getAll()
        ])
        
        setDepots(depotsData)
        setVehicles(vehiclesData)
        setDrivers(driversData)
        setOrders(ordersData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load data. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load data from server",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    if (open) {
      fetchData()
    }
  }, [open, toast])

  const handleContinueScheduling = () => {
    setShowRoutes(true)
  }

  const handleVehicleCountChange = (count: string) => {
    const numCount = parseInt(count)
    setVehicleCount(numCount)
    setSelectedVehicles(new Array(numCount).fill(""))
  }

  const handleVehicleSelection = (index: number, vehicleId: string) => {
    const newSelection = [...selectedVehicles]
    newSelection[index] = vehicleId
    setSelectedVehicles(newSelection)
  }

  const handleSchedule = () => {
    // Generate routes and update the context
    const generatedRoutes = generateRouteResults()
    
    // Log the generated routes for debugging
    console.log('Generated routes:', generatedRoutes)
    
    // Check if we have valid routes
    if (generatedRoutes.length === 0) {
      toast({
        title: "Route Generation Failed",
        description: "Could not generate routes with the selected parameters",
        variant: "destructive"
      })
      return
    }
    
    // Update the context with the new routes
    setRoutes(generatedRoutes)
    
    // Set the first route as selected if available
    if (generatedRoutes.length > 0) {
      setSelectedRoute(generatedRoutes[0])
    }
    
    // Display routes on the map
    toast({
      title: "Routes Scheduled",
      description: `${generatedRoutes.length} routes have been scheduled and displayed on the map`
    })
    
    // Close the slider
    onOpenChange(false)
    
    // Reset states for next use
    setShowRoutes(false)
    setRouteName("")
    setSelectedDepot("")
    setVehicleCount(1)
    setSelectedVehicles([])
  }

  // Generate route results based on selected vehicles
  const generateRouteResults = () => {
    return selectedVehicles.map((vehicleId, index) => {
      // Skip if no vehicle selected
      if (!vehicleId) {
        console.error('No vehicle selected for route', index);
        return null;
      }
      
      const vehicle = vehicles.find(v => v.id?.toString() === vehicleId);
      const depot = depots.find(d => d.id?.toString() === selectedDepot);
      
      if (!depot || !depot.address) {
        console.error('Selected depot has no address:', depot);
        return null;
      }
      
      console.log('Using depot:', depot.name, depot.address);
      
      // Ensure depot address has country for better geocoding
      const depotAddress = depot.address.includes("India") 
        ? depot.address 
        : `${depot.address}, India`;
      
      // Filter orders with valid addresses
      const validOrders = orders.filter(order => order.address && order.address.trim() !== '');
      
      // If no valid orders, use some sample Indian cities for testing
      let routeOrders = validOrders;
      if (validOrders.length === 0) {
        console.log('No valid orders found, using sample cities for testing');
        
        // Create sample orders with real Indian cities
        const sampleCities = [
          { address: "Bengaluru, Karnataka, India", name: "Bengaluru Order" },
          { address: "Hyderabad, Telangana, India", name: "Hyderabad Order" },
          { address: "Mumbai, Maharashtra, India", name: "Mumbai Order" },
          { address: "Kolkata, West Bengal, India", name: "Kolkata Order" },
          { address: "Delhi, India", name: "Delhi Order" }
        ];
        
        // Select 2-3 cities for this route
        const citiesPerRoute = 2 + (index % 2); // 2 or 3 cities per route
        routeOrders = sampleCities.slice(index * 2, index * 2 + citiesPerRoute).map((city, i) => ({
          id: i + 1, // Use number for id to match Order type
          order_number: `SAMPLE-${index}-${i}`,
          address: city.address,
          customer_name: city.name,
          load: "100kg"
        })) as Order[]; // Cast to Order type
      } else {
        // Select a subset of orders for this route
        const ordersPerRoute = Math.min(3, Math.ceil(validOrders.length / Math.max(1, selectedVehicles.length)));
        routeOrders = validOrders.slice(index * ordersPerRoute, (index + 1) * ordersPerRoute);
      }
      
      if (routeOrders.length === 0) {
        console.error('No valid orders found for route');
        return null;
      }
      
      console.log('Using orders:', routeOrders.map(o => o.address));
      
      // Create depot stop with real address
      const depotStop = {
        id: `stop-${index}-depot`,
        address: depotAddress,
        type: "pickup" as const,
        timeWindow: "8:00 - 9:00",
        items: ["Depot"]
      }
      
      // Create all stops including depot at start and end
      const stops = [
        depotStop,
        ...routeOrders.map((order, stopIndex) => ({
          id: `stop-${index}-${stopIndex}`,
          address: order.address || "Unknown Address",
          type: stopIndex % 2 === 0 ? "pickup" as const : "delivery" as const,
          timeWindow: order.start_time && order.end_time 
            ? `${order.start_time} - ${order.end_time}`
            : `${8 + stopIndex}:00 - ${9 + stopIndex}:00`,
          items: [order.load || "Items"]
        })),
        // Add depot as last stop (return)
        {...depotStop, id: `stop-${index}-depot-return`, type: "delivery" as const}
      ]
      
      // Initial estimated metrics (will be updated by Google Maps)
      const stopCount = stops.length;
      const avgDistancePerStop = 50; // km - increased for realistic distances between cities
      const avgTimePerStop = 60; // minutes - increased for realistic travel times
      const totalDistance = Math.round(stopCount * avgDistancePerStop);
      const totalTimeMinutes = stopCount * avgTimePerStop;
      
      // Format time as hours and minutes
      const hours = Math.floor(totalTimeMinutes / 60);
      const minutes = totalTimeMinutes % 60;
      const estimatedTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      
      return {
        id: `route-${index + 1}`,
        routeName: `${routeName || 'Route'}.${index + 1}`,
        vehicleId: vehicleId,
        vehicleName: vehicle?.plate_number || `Vehicle ${index + 1}`,
        capacity: vehicle?.capacity || "Unknown",
        totalDistance: `${totalDistance} km`,
        estimatedTime: estimatedTime,
        departureTime: `${8 + index}:00 AM`,
        arrivalTime: `${8 + index + Math.ceil(totalTimeMinutes / 60)}:${minutes.toString().padStart(2, '0')} AM`,
        from: depot.name || "Depot",
        to: depot.name || "Depot",
        stops: stops
      }
    }).filter(Boolean) // Remove null routes
  }

  if (loading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-6xl">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p>Loading data...</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  if (error) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-6xl">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-500">{error}</p>
              <Button 
                className="mt-4" 
                onClick={() => {
                  setError(null)
                  onOpenChange(false)
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-6xl overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Plan routes</SheetTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {!showRoutes ? (
            <>
              {/* Orders Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Orders</h3>
                    <Badge className="bg-blue-600">{orders.length}</Badge>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr className="text-sm text-muted-foreground">
                            <th className="p-3 text-left">ID</th>
                            <th className="p-3 text-left">CUSTOMER NAME</th>
                            <th className="p-3 text-left">ADDRESS</th>
                            <th className="p-3 text-left">TIME WINDOW</th>
                            <th className="p-3 text-left">PHONE</th>
                            <th className="p-3 text-left">EMAIL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.length > 0 ? (
                            orders.map((order) => (
                              <tr key={order.id} className="border-t">
                                <td className="p-3 font-medium">{order.order_number || order.id}</td>
                                <td className="p-3">{order.customer_name || '-'}</td>
                                <td className="p-3">{order.address || '-'}</td>
                                <td className="p-3">
                                  {order.start_time && order.end_time 
                                    ? `${order.start_time} - ${order.end_time}`
                                    : '-'}
                                </td>
                                <td className="p-3">{order.phone || '-'}</td>
                                <td className="p-3">{order.email || '-'}</td>
                              </tr>
                            ))
                          ) : (
                          <tr className="border-t">
                              <td colSpan={6} className="p-3 text-center text-muted-foreground">
                                No orders available
                              </td>
                          </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-sm text-muted-foreground">{orders.length} orders</div>
              </div>

              {/* Depots Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Available Depots</h3>
                  <Badge className="bg-orange-600">{depots.length}</Badge>
                </div>

                <Card>
                  <CardContent className="p-4 space-y-3">
                    {depots.length > 0 ? (
                      depots.map((depot) => (
                      <div key={depot.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <MapPin className="h-5 w-5 text-orange-600" />
                        <div>
                          <h4 className="font-medium">{depot.name}</h4>
                            <p className="text-sm text-muted-foreground">{depot.address}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-muted-foreground">
                        No depots available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Vehicles and Drivers in Columns */}
              <div className="grid grid-cols-2 gap-6">
                {/* Available Vehicles Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Available Vehicles</h3>
                    <Badge className="bg-agriculture-600">{vehicles.length}</Badge>
                  </div>

                  <Card>
                    <CardContent className="p-4 space-y-3">
                      {vehicles.length > 0 ? (
                        vehicles.map((vehicle) => (
                        <div key={vehicle.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <Truck className="h-5 w-5 text-agriculture-600" />
                          <div>
                              <h4 className="font-medium">{vehicle.plate_number}</h4>
                              <p className="text-sm text-muted-foreground">{vehicle.type} - {vehicle.capacity || 'N/A'}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-muted-foreground">
                          No vehicles available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Available Drivers Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Available Drivers</h3>
                    <Badge className="bg-blue-600">{drivers.length}</Badge>
                  </div>

                  <Card>
                    <CardContent className="p-4 space-y-3">
                      {drivers.length > 0 ? (
                        drivers.map((driver) => (
                        <div key={driver.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <User className="h-5 w-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium">{driver.name}</h4>
                              <p className="text-sm text-muted-foreground">License: {driver.license_number || 'N/A'}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-muted-foreground">
                          No drivers available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleContinueScheduling}
                  disabled={orders.length === 0}
                >
                  Continue scheduling
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Routes Configuration View */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={() => setShowRoutes(false)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Review orders
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Orders Column */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">Orders</h3>
                      <Badge className="bg-blue-600">{orders.length}</Badge>
                    </div>
                    
                    <Card>
                      <CardContent className="p-0">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="p-2 text-left text-xs">ID</th>
                              <th className="p-2 text-left text-xs">CUSTOMER</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.length > 0 ? (
                              orders.map((order) => (
                                <tr key={order.id} className="border-t">
                                  <td className="p-2 font-medium">{order.order_number || order.id}</td>
                                  <td className="p-2">{order.customer_name || '-'}</td>
                                </tr>
                              ))
                            ) : (
                            <tr className="border-t">
                                <td colSpan={2} className="p-2 text-center text-muted-foreground">
                                  No orders available
                                </td>
                            </tr>
                            )}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>

                    {/* Depots Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">Available Depots</h3>
                        <Badge className="bg-orange-600">{depots.length}</Badge>
                      </div>

                      <Card>
                        <CardContent className="p-4 space-y-3">
                          {depots.length > 0 ? (
                            depots.map((depot) => (
                            <div key={depot.id} className="flex items-center gap-3 p-3 border rounded-lg">
                              <MapPin className="h-5 w-5 text-orange-600" />
                              <div>
                                <h4 className="font-medium">{depot.name}</h4>
                                  <p className="text-sm text-muted-foreground">{depot.address}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-center text-muted-foreground">
                              No depots available
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Route Configuration Column */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">Route Configuration</h3>
                      </div>
                    </div>

                    <Card>
                      <CardContent className="p-4 space-y-4">
                        {/* Route Name */}
                        <div className="space-y-2">
                          <Label htmlFor="routeName">Route Name</Label>
                          <Input
                            id="routeName"
                            placeholder="Enter route name"
                            value={routeName}
                            onChange={(e) => setRouteName(e.target.value)}
                          />
                        </div>

                        {/* Depot Selection */}
                        <div className="space-y-2">
                          <Label htmlFor="depot">Select Depot</Label>
                          <Select value={selectedDepot} onValueChange={setSelectedDepot}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose depot" />
                            </SelectTrigger>
                            <SelectContent>
                              {depots.map((depot) => (
                                <SelectItem key={depot.id} value={depot.id?.toString() || ""}>
                                  {depot.name} - {depot.address}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Number of Vehicles */}
                        <div className="space-y-2">
                          <Label htmlFor="vehicleCount">Number of Vehicles</Label>
                          <Select value={vehicleCount.toString()} onValueChange={handleVehicleCountChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num} Vehicle{num > 1 ? 's' : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Vehicle Selection Dropdowns */}
                        {Array.from({ length: vehicleCount }, (_, index) => (
                          <div key={index} className="space-y-2">
                            <Label htmlFor={`vehicle-${index}`}>Vehicle {index + 1}</Label>
                            <Select 
                              value={selectedVehicles[index] || ""} 
                              onValueChange={(value) => handleVehicleSelection(index, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={`Choose vehicle ${index + 1}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {vehicles.map((vehicle) => (
                                  <SelectItem key={vehicle.id} value={vehicle.id?.toString() || ""}>
                                    {vehicle.plate_number} - {vehicle.type} ({vehicle.capacity || 'N/A'})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700" 
                    onClick={handleSchedule}
                    disabled={!selectedDepot || selectedVehicles.filter(Boolean).length === 0}
                  >
                    Schedule
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
