import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, Truck, User, Clock, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { depotsAPI, Depot, vehiclesAPI, Vehicle, driversAPI, Driver, ordersAPI, Order } from "@/services/api";
import { vrpAPI, VRPRequest, VRPResponse } from "@/services/api-proxy";

export function RoutePlanner() {
  // Data states
  const [depots, setDepots] = useState<Depot[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Selection states
  const [selectedDepot, setSelectedDepot] = useState<string>("");
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  
  // UI states
  const [loading, setLoading] = useState<boolean>(true);
  const [planningRoute, setPlanningRoute] = useState<boolean>(false);
  const [routeResult, setRouteResult] = useState<VRPResponse | null>(null);
  
  // Load data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [depotsData, vehiclesData, driversData, ordersData] = await Promise.all([
          depotsAPI.getAll(),
          vehiclesAPI.getAll(),
          driversAPI.getAll(),
          ordersAPI.getAll()
        ]);
        
        setDepots(depotsData);
        setVehicles(vehiclesData);
        setDrivers(driversData);
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle depot selection
  const handleDepotChange = (value: string) => {
    setSelectedDepot(value);
  };
  
  // Handle vehicle selection toggle
  const handleVehicleToggle = (vehicleId: string) => {
    setSelectedVehicles(prev => 
      prev.includes(vehicleId) 
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };
  
  // Handle order selection toggle
  const handleOrderToggle = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };
  
  // Handle select all orders
  const handleSelectAllOrders = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id?.toString() || ""));
    }
  };
  
  // Generate routes
  const handleGenerateRoutes = async () => {
    if (!selectedDepot) {
      toast.error("Please select a depot");
      return;
    }
    
    if (selectedVehicles.length === 0) {
      toast.error("Please select at least one vehicle");
      return;
    }
    
    if (selectedOrders.length === 0) {
      toast.error("Please select at least one order");
      return;
    }
    
    setPlanningRoute(true);
    setRouteResult(null);
    
    try {
      // Find the selected depot
      const depot = depots.find(d => d.id?.toString() === selectedDepot);
      
      if (!depot) {
        throw new Error("Selected depot not found");
      }
      
      // Get selected vehicles
      const selectedVehicleObjects = vehicles.filter(v => 
        selectedVehicles.includes(v.id?.toString() || "")
      );
      
      // Get selected orders
      const selectedOrderObjects = orders.filter(o => 
        selectedOrders.includes(o.id?.toString() || "")
      );
      
      // Prepare locations array (depot first, then orders)
      const locations = [
        {
          address: depot.address,
          lat: depot.lat,
          lng: depot.lng
        },
        ...selectedOrderObjects.map(order => ({
          address: order.address,
          lat: order.lat,
          lng: order.lng
        }))
      ];
      
      // Prepare vehicle capacities if available
      const vehicleCapacities = selectedVehicleObjects.map(vehicle => 
        parseInt(vehicle.capacity || "0")
      );
      
      // Prepare order demands if available
      const demands = [0, ...selectedOrderObjects.map(order => 
        parseInt(order.load || "0")
      )];
      
      // Create VRP request
      const vrpRequest: VRPRequest = {
        locations: locations,
        num_vehicles: selectedVehicleObjects.length,
        depot_index: 0,
        vehicle_capacities: vehicleCapacities.every(cap => cap > 0) ? vehicleCapacities : undefined,
        demands: demands.slice(1).every(d => d > 0) ? demands : undefined
      };
      
      // Call VRP API
      const result = await vrpAPI.solve(vrpRequest);
      
      if (result.status === "OK") {
        setRouteResult(result);
        toast.success("Routes generated successfully");
      } else {
        toast.error(`Failed to generate routes: ${result.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error generating routes:", error);
      toast.error("Failed to generate routes");
    } finally {
      setPlanningRoute(false);
    }
  };
  
  // Refresh data
  const handleRefresh = () => {
    setSelectedDepot("");
    setSelectedVehicles([]);
    setSelectedOrders([]);
    setRouteResult(null);
    
    // Reload data
    const fetchData = async () => {
      setLoading(true);
      try {
        const [depotsData, vehiclesData, driversData, ordersData] = await Promise.all([
          depotsAPI.getAll(),
          vehiclesAPI.getAll(),
          driversAPI.getAll(),
          ordersAPI.getAll()
        ]);
        
        setDepots(depotsData);
        setVehicles(vehiclesData);
        setDrivers(driversData);
        setOrders(ordersData);
        
        toast.success("Data refreshed");
      } catch (error) {
        console.error("Error refreshing data:", error);
        toast.error("Failed to refresh data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  };
  
  // Format distance for display
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${meters} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };
  
  // Format time for display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  };
  
  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Route Planner</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RotateCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Selection */}
          <div className="space-y-6 md:col-span-1">
            {/* Depot selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Select Depot
                </CardTitle>
              </CardHeader>
              <CardContent>
                {depots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No depots available</p>
                ) : (
                  <Select value={selectedDepot} onValueChange={handleDepotChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a depot" />
                    </SelectTrigger>
                    <SelectContent>
                      {depots.map(depot => (
                        <SelectItem key={depot.id} value={depot.id?.toString() || ""}>
                          {depot.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </CardContent>
            </Card>
            
            {/* Vehicle selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Select Vehicles
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vehicles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No vehicles available</p>
                ) : (
                  <div className="space-y-2">
                    {vehicles.map(vehicle => (
                      <div key={vehicle.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`vehicle-${vehicle.id}`}
                          checked={selectedVehicles.includes(vehicle.id?.toString() || "")}
                          onCheckedChange={() => handleVehicleToggle(vehicle.id?.toString() || "")}
                        />
                        <Label htmlFor={`vehicle-${vehicle.id}`} className="flex-1">
                          {vehicle.plate_number} ({vehicle.type})
                          {vehicle.capacity && <span className="text-sm text-muted-foreground ml-2">Cap: {vehicle.capacity}</span>}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Driver selection (optional) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Available Drivers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {drivers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No drivers available</p>
                ) : (
                  <div className="space-y-2">
                    {drivers.map(driver => (
                      <div key={driver.id} className="flex items-center space-x-2">
                        <div className="flex-1">
                          <p>{driver.name}</p>
                          <p className="text-sm text-muted-foreground">{driver.phone || "No phone"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Middle column - Orders */}
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Select Orders
                  </div>
                  <Button variant="outline" size="sm" onClick={handleSelectAllOrders}>
                    {selectedOrders.length === orders.length ? "Deselect All" : "Select All"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                {orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders available</p>
                ) : (
                  <div className="space-y-2">
                    {orders.map(order => (
                      <div key={order.id} className="flex items-center space-x-2 border-b pb-2">
                        <Checkbox
                          id={`order-${order.id}`}
                          checked={selectedOrders.includes(order.id?.toString() || "")}
                          onCheckedChange={() => handleOrderToggle(order.id?.toString() || "")}
                        />
                        <Label htmlFor={`order-${order.id}`} className="flex-1">
                          <div>
                            <p className="font-medium">{order.customer_name || `Order #${order.id}`}</p>
                            <p className="text-sm text-muted-foreground">{order.address}</p>
                            {order.load && <p className="text-xs text-muted-foreground">Load: {order.load}</p>}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Results */}
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Route Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!routeResult ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    {planningRoute ? (
                      <>
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="text-muted-foreground">Generating optimal routes...</p>
                      </>
                    ) : (
                      <>
                        <p className="text-muted-foreground">Select a depot, vehicles, and orders to generate routes</p>
                        <Button 
                          onClick={handleGenerateRoutes} 
                          disabled={!selectedDepot || selectedVehicles.length === 0 || selectedOrders.length === 0}
                        >
                          Generate Routes
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Total Distance</p>
                        <p className="text-2xl font-bold">{formatDistance(routeResult.total_distance)}</p>
                      </div>
                      <div>
                        <p className="font-medium">Total Time</p>
                        <p className="text-2xl font-bold">{formatTime(routeResult.total_time)}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Routes ({routeResult.routes.length})</h3>
                      
                      {routeResult.routes.map((route, index) => {
                        const vehicle = vehicles[route.vehicle_id] || { plate_number: `Vehicle ${route.vehicle_id + 1}` };
                        
                        return (
                          <div key={index} className="border rounded-md p-3 space-y-2">
                            <div className="flex justify-between items-center">
                              <p className="font-medium">{vehicle.plate_number}</p>
                              <div className="text-sm text-muted-foreground">
                                {formatDistance(route.distance)} • {route.time && formatTime(route.time)}
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              {route.stops.map((stop, stopIndex) => {
                                const isDepot = stop.location_index === 0;
                                const isLastStop = stopIndex === route.stops.length - 1;
                                
                                return (
                                  <div 
                                    key={stopIndex} 
                                    className={`flex items-center text-sm ${isDepot ? 'font-medium' : ''}`}
                                  >
                                    <div className="w-6 text-center">{stopIndex + 1}</div>
                                    <div className={`ml-2 flex-1 ${isDepot ? 'text-primary' : ''}`}>
                                      {stop.address}
                                      {isDepot && (isLastStop ? ' (Return)' : ' (Start)')}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <Button className="w-full" onClick={handleGenerateRoutes}>
                      Regenerate Routes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
} 