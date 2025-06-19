import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { StatsCard } from "@/components/StatsCard"
import { Button } from "@/components/ui/button"
import { Wheat, Leaf, Loader2, RefreshCw, MapPin, Navigation, Truck, Clock, UserCircle2, Save, Maximize2, Minimize2 } from "lucide-react"
import { ordersAPI, vehiclesAPI, driversAPI, Driver, routeHistoryAPI, depotsAPI } from "@/services/api"
import { useRoutes } from "@/contexts/RouteContext"
import { GoogleMap } from "./GoogleMap"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
// import { MockGoogleMap } from "./MockGoogleMap"

// Route types
interface RouteStop {
  id: string
  address: string
  type: "pickup" | "delivery"
  timeWindow: string
  items: string[]
  calculatedStartTime?: string // Added for time calculations
  calculatedArrivalTime?: string // Added for time calculations
  calculatedTravelTime?: number // Added for travel time in minutes
}

// Use the Route type from the context instead of defining our own
import { Route as ContextRoute } from "@/contexts/RouteContext"
// Extend the context route type with our additional properties
interface Route extends ContextRoute {
  calculatedTotalTime?: number
}

// Utility function to calculate travel time using Google Maps API
function calculateTravelTime(origin: string, destination: string): Promise<{duration: number, distance: number}> {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps || !window.google.maps.DirectionsService) {
      reject(new Error("Google Maps API not loaded or DirectionsService not available"));
      return;
    }

    try {
      const directionsService = new window.google.maps.DirectionsService();
      
      directionsService.route({
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING
      }, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          if (result.routes && result.routes.length > 0 && result.routes[0].legs && result.routes[0].legs.length > 0) {
            const leg = result.routes[0].legs[0];
            resolve({
              duration: leg.duration ? leg.duration.value / 60 : 0, // Convert seconds to minutes
              distance: leg.distance ? leg.distance.value / 1000 : 0 // Convert meters to kilometers
            });
          } else {
            reject(new Error("No route found"));
          }
        } else {
          reject(new Error(`Direction request failed: ${status}`));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

// Utility function to convert minutes to a formatted duration string
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

// Utility function to add minutes to a time string
function addMinutesToTime(timeStr: string, minutes: number): string {
  // Parse the time string (format: "10:30 AM")
  const [hourMinute, period] = timeStr.split(' ');
  const [hourStr, minuteStr] = hourMinute.split(':');
  let hour = parseInt(hourStr);
  let minute = parseInt(minuteStr);
  
  // Convert to 24-hour format
  if (period === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }
  
  // Add minutes
  minute += minutes;
  
  // Handle overflow
  hour += Math.floor(minute / 60);
  minute = Math.round(minute % 60);
  
  // Convert back to 12-hour format
  const isPM = hour >= 12;
  const hour12 = hour % 12 || 12;
  
  // Format time as HH:MM without seconds
  return `${hour12}:${minute.toString().padStart(2, '0')} ${isPM ? 'PM' : 'AM'}`;
}

export function RouteMap() {
  const [stats, setStats] = useState({
    routes: 0,
    orders: 0,
    distance: 0,
    time: 0,
    stops: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllRoutes, setShowAllRoutes] = useState(true)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loadingDrivers, setLoadingDrivers] = useState(false)
  const [savingRoute, setSavingRoute] = useState<string | null>(null)
  const [depots, setDepots] = useState<any[]>([])
  const [isFullScreen, setIsFullScreen] = useState(false)
  
  // Use the route context
  const { routes, setRoutes, selectedRoute, setSelectedRoute } = useRoutes()
  const { toast } = useToast()

  // Reference to track if Google Maps API is loaded
  const googleMapsLoaded = useRef(false);
  
  // Function to load the Google Maps API
  const loadGoogleMapsAPI = useCallback(async () => {
    // If Google Maps API is already loaded and DirectionsService is available
    if (window.google && window.google.maps && window.google.maps.DirectionsService) {
      googleMapsLoaded.current = true;
      return;
    }
    
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        throw new Error('Google Maps API key not found in environment variables');
      }
      return new Promise<void>((resolve, reject) => {
        // If script already exists but service isn't available, wait for it
        if (window.google && window.google.maps) {
          // Try to wait for maps to initialize fully
          const checkGoogleMaps = setInterval(() => {
            if (window.google.maps.DirectionsService) {
              clearInterval(checkGoogleMaps);
              googleMapsLoaded.current = true;
              resolve();
            }
          }, 100);
          
          // Add a timeout to prevent infinite waiting
          setTimeout(() => {
            clearInterval(checkGoogleMaps);
            reject(new Error('Google Maps DirectionsService failed to initialize'));
          }, 5000);
          
          return;
        }
        
        // Otherwise, load the script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          // After script loads, make sure DirectionsService is actually available
          const checkGoogleMaps = setInterval(() => {
            if (window.google && window.google.maps && window.google.maps.DirectionsService) {
              clearInterval(checkGoogleMaps);
              googleMapsLoaded.current = true;
              resolve();
            }
          }, 100);
          
          // Add a timeout to prevent infinite waiting
          setTimeout(() => {
            clearInterval(checkGoogleMaps);
            reject(new Error('Google Maps DirectionsService failed to initialize'));
          }, 5000);
        };
        script.onerror = () => {
          reject(new Error('Failed to load Google Maps API'));
        };
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error('Error loading Google Maps API:', error);
      throw error;
    }
  }, []);
  
  // Function to calculate travel times for a route
  const calculateRouteTravelTimes = useCallback(async (route: Route) => {
    try {
      if (!googleMapsLoaded.current) {
        try {
          await loadGoogleMapsAPI();
        } catch (error) {
          console.error('Failed to load Google Maps API:', error);
          // Continue with fallback values
        }
      }
      
      if (!route || route.stops.length < 2) return route;
      
      const updatedRoute = { ...route };
      const stops = [...updatedRoute.stops];
      
      // Calculate travel time for each leg of the journey
      for (let i = 1; i < stops.length; i++) {
        const origin = stops[i-1].address;
        const destination = stops[i].address;
        
        try {
          if (window.google && window.google.maps && window.google.maps.DirectionsService) {
            const { duration, distance } = await calculateTravelTime(origin, destination);
            (stops[i] as any).calculatedTravelTime = duration;
            (stops[i] as any).calculatedDistance = distance; // Store actual distance in km
          } else {
            // Use hardcoded fallback times for common routes (in minutes)
            console.warn(`Google Maps API not available, using fallback travel times from ${origin} to ${destination}`);
            let fallbackTime = 60; // Default fallback: 60 minutes
            let fallbackDistance = 40; // Default fallback: 40 km
            
            // Fallback travel times for known routes
            if (origin.includes("Bengaluru") && destination.includes("Chennai")) {
              fallbackTime = 330; // 5.5 hours
              fallbackDistance = 350; // 350 km
            } else if (origin.includes("Chennai") && destination.includes("Erode")) {
              fallbackTime = 360; // 6 hours
              fallbackDistance = 400; // 400 km
            } else if (origin.includes("Erode") && destination.includes("Bengaluru")) {
              fallbackTime = 390; // 6.5 hours
              fallbackDistance = 420; // 420 km
            } else if (origin.includes("Madurai") && destination.includes("Kochi")) {
              fallbackTime = 390; // 6.5 hours
              fallbackDistance = 266; // 266 km
            }
            
            (stops[i] as any).calculatedTravelTime = fallbackTime;
            (stops[i] as any).calculatedDistance = fallbackDistance;
          }
        } catch (error) {
          console.error(`Error calculating travel time from ${origin} to ${destination}:`, error);
          // Use fallback time and distance
          (stops[i] as any).calculatedTravelTime = 60;
          (stops[i] as any).calculatedDistance = 40;
        }
      }
      
      // Calculate arrival and start times based on travel times
      let currentTime = route.departureTime;
      
      for (let i = 0; i < stops.length; i++) {
        if (i === 0) {
          // First stop (depot)
          (stops[i] as any).calculatedArrivalTime = "-";
          (stops[i] as any).calculatedStartTime = currentTime;
        } else {
          // Calculate arrival time (previous stop's start time + travel time)
          const travelTime = (stops[i] as any).calculatedTravelTime || 60; // Default to 60 minutes if missing
          const arrivalTime = addMinutesToTime(currentTime, travelTime);
          (stops[i] as any).calculatedArrivalTime = arrivalTime;
          
          // Last stop has no start time
          if (i === stops.length - 1) {
            (stops[i] as any).calculatedStartTime = "-";
          } else {
            // Add 30 minutes work period to get start time
            const startTime = addMinutesToTime(arrivalTime, 30);
            (stops[i] as any).calculatedStartTime = startTime;
            currentTime = startTime;
          }
        }
      }
      
      updatedRoute.stops = stops;
      return updatedRoute;
    } catch (error) {
      console.error('Error calculating route travel times:', error);
      return route;
    }
  }, [loadGoogleMapsAPI]);
  
  // Function to prepare routes with travel times
  const prepareRoutesWithTravelTimes = useCallback(async (routes: Route[]) => {
    if (routes.length === 0) return [];
    
    // First ensure Google Maps API is loaded
    if (!googleMapsLoaded.current) {
      try {
        await loadGoogleMapsAPI();
      } catch (error) {
        console.error('Failed to load Google Maps API:', error);
        // Continue with fallback values
      }
    }
    
    const updatedRoutes = [...routes];
    
    // Process each route
    for (let i = 0; i < updatedRoutes.length; i++) {
      // Calculate travel times between stops
      updatedRoutes[i] = await calculateRouteTravelTimes(updatedRoutes[i]);
      
      // Update route total distance and time based on individual travel times if needed
      if (window.google && window.google.maps && window.google.maps.DirectionsService) {
        // Use Google API data if available - we'll rely on the GoogleMap component to update this
        console.log(`Route ${updatedRoutes[i].id} is ready for Google Maps calculation`);
      } else {
        // If Google API isn't available, calculate totals from the stop travel times
        const stops = updatedRoutes[i].stops;
        let totalTravelTime = 0;
        
        for (let j = 1; j < stops.length; j++) {
          totalTravelTime += (stops[j] as any).calculatedTravelTime || 60;
        }
        
        // Update the route with the calculated total time if it doesn't already have accurate values
        const hours = Math.floor(totalTravelTime / 60);
        const minutes = Math.round(totalTravelTime % 60);
        const formattedDuration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        
        // Only update if the value doesn't look like it came from Google Maps already
        if (!updatedRoutes[i].estimatedTime.includes('h') && !updatedRoutes[i].estimatedTime.includes('m')) {
          updatedRoutes[i].estimatedTime = formattedDuration;
        }
      }
    }
    
    return updatedRoutes;
  }, [loadGoogleMapsAPI, calculateRouteTravelTimes]);
  
  // State to track routes with calculated travel times
  const [routesWithTravelTimes, setRoutesWithTravelTimes] = useState<Route[]>([]);
  
  // Update routesWithTravelTimes when routes change
  useEffect(() => {
    if (routes.length > 0) {
      prepareRoutesWithTravelTimes(routes).then(updatedRoutes => {
        setRoutesWithTravelTimes(updatedRoutes);
      });
    } else {
      setRoutesWithTravelTimes([]);
    }
  }, [routes, prepareRoutesWithTravelTimes]);

  // Handle route updates from Google Maps
  const handleRouteUpdate = useCallback((routeId: string, distance: string, duration: string) => {
    console.log(`Received update for route ${routeId}: Distance=${distance}, Duration=${duration}`);
    
    // Update the route with actual distance and duration from Google Maps
    setRoutes(currentRoutes => 
      currentRoutes.map(route => 
        route.id === routeId 
          ? { 
              ...route, 
              totalDistance: distance, 
              estimatedTime: duration,
            } 
          : route
      )
    );
    
    // If this is the selected route, update it too
    if (selectedRoute && selectedRoute.id === routeId) {
      setSelectedRoute({
        ...selectedRoute,
        totalDistance: distance,
        estimatedTime: duration
      });
    }
    
    // Also update the route in routesWithTravelTimes
    setRoutesWithTravelTimes(currentRoutes => 
      currentRoutes.map(route => 
        route.id === routeId 
          ? { 
              ...route, 
              totalDistance: distance, 
              estimatedTime: duration,
            } 
          : route
      )
    );
  }, [selectedRoute, setRoutes, setSelectedRoute]);

  // Update stats when routes change
  useEffect(() => {
    if (routes.length > 0) {
      // Calculate total distance from all routes
      const totalDistance = routes.reduce((sum, route) => {
        const distance = parseInt(route.totalDistance.split(' ')[0]) || 0;
        return sum + distance;
      }, 0);
      
      // Calculate total stops from all routes
      const totalStops = routes.reduce((sum, route) => sum + route.stops.length, 0);
      
      // Calculate total time in minutes
      const totalTimeMinutes = routes.reduce((sum, route) => {
        const timeStr = route.estimatedTime;
        const hoursMatch = timeStr.match(/(\d+)h/);
        const minutesMatch = timeStr.match(/(\d+)m/);
        
        const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
        const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
        
        return sum + (hours * 60) + minutes;
      }, 0);
      
      const newStats = {
        routes: routes.length,
        orders: totalStops - (routes.length * 2), // Subtract depot stops
        distance: totalDistance,
        time: totalTimeMinutes,
        stops: totalStops
      };
      
      // Only update if stats have actually changed
      setStats(prevStats => {
        if (
          prevStats.routes !== newStats.routes ||
          prevStats.orders !== newStats.orders ||
          prevStats.distance !== newStats.distance ||
          prevStats.time !== newStats.time ||
          prevStats.stops !== newStats.stops
        ) {
          return newStats;
        }
        return prevStats;
      });
    }
  }, [routes]);

  // Ensure Google Maps API is loaded when component mounts
  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        await loadGoogleMapsAPI();
        console.log('Google Maps API loaded successfully');
      } catch (error) {
        console.error('Failed to load Google Maps API:', error);
      }
    };
    
    initializeGoogleMaps();
  }, [loadGoogleMapsAPI]);

  // Fetch data but don't generate sample routes automatically
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch data from API
      const [orders, vehicles, driversList, depotsList] = await Promise.all([
        ordersAPI.getAll(),
        vehiclesAPI.getAll(),
        driversAPI.getAll(),
        depotsAPI.getAll()
      ])
      
      // Store drivers and depots
      setDrivers(driversList);
      setDepots(depotsList);
      
      // Calculate stats based on real data
      const routeCount = Math.max(1, Math.floor(orders.length / 3)) // Estimate 1 route per 3 orders
      const totalStops = orders.length
      const avgDistancePerStop = 8.5 // km
      const avgTimePerStop = 25 // minutes
      
      setStats({
        routes: routeCount,
        orders: orders.length,
        distance: Math.round(totalStops * avgDistancePerStop),
        time: Math.round(totalStops * avgTimePerStop),
        stops: totalStops
      })

      // Don't automatically generate sample routes on load
      // Just store the data for later use
    } catch (err) {
      console.error("Error fetching map data:", err)
      setError("Failed to load data")
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchData()
  }, [])

  // Generate sample routes for demo purposes
  const generateSampleRoutes = (orders: any[], vehicles: any[]) => {
    // Define route colors - these must match the DEFAULT_COLORS in GoogleMap.tsx
    const routeColors = ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#F44336'];
    
    return vehicles.slice(0, 2).map((vehicle, vehicleIndex) => {
      const ordersPerRoute = Math.min(3, Math.ceil(orders.length / 2))
      const routeOrders = orders.slice(vehicleIndex * ordersPerRoute, (vehicleIndex + 1) * ordersPerRoute)
      
      // Add depot as first and last stop
      const depotStop = {
        id: `stop-${vehicleIndex}-depot`,
        address: "Chennai, Tamil Nadu, India", // Use real city for testing
        type: "pickup" as const,
        timeWindow: "8:00 - 9:00",
        items: ["Depot"]
      }
      
      // Customize addresses for each route to make them distinct
      const routeAddresses = vehicleIndex === 0 
        ? ["Bengaluru, Karnataka, India", "Erode, Tamil Nadu, India"] 
        : ["Coimbatore, Tamil Nadu, India", "Salem, Tamil Nadu, India"];
      
      const stops = [
        depotStop,
        ...routeOrders.map((order, stopIndex) => ({
          id: `stop-${vehicleIndex}-${stopIndex}`,
          address: order.address || routeAddresses[stopIndex % routeAddresses.length],
          type: stopIndex % 2 === 0 ? "pickup" as const : "delivery" as const,
          timeWindow: order.start_time && order.end_time 
            ? `${order.start_time} - ${order.end_time}`
            : `${8 + stopIndex}:00 - ${9 + stopIndex}:00`,
          items: [order.load || "Items"]
        })),
        // Add depot as last stop (return)
        {...depotStop, id: `stop-${vehicleIndex}-depot-return`, type: "delivery" as const}
      ]
      
      // Set appropriate route color - ensure this matches the color used in GoogleMap
      const routeColor = routeColors[vehicleIndex % routeColors.length];
      
      return {
        id: `route-${vehicleIndex + 1}`,
        routeName: `Route ${vehicleIndex + 1}`,
        vehicleId: vehicle.id?.toString() || "",
        vehicleName: vehicle.plate_number || `Vehicle ${vehicleIndex + 1}`,
        capacity: vehicle.capacity || "Unknown",
        totalDistance: `${300 + vehicleIndex * 50} km`, // Initial estimate, will be updated by Google Maps
        estimatedTime: `${5 + vehicleIndex}h ${30 + vehicleIndex * 15}m`, // Initial estimate, will be updated by Google Maps
        departureTime: `${8 + vehicleIndex}:00 AM`,
        arrivalTime: `${14 + vehicleIndex}:30 PM`,
        from: "Chennai Depot",
        to: "Chennai Depot",
        stops: stops,
        color: routeColor // Add color to route
      }
    })
  }

  // Handle route selection
  const handleRouteSelect = (route: Route) => {
    console.log('Selected route:', route);
    
    // If we have routesWithTravelTimes, find the matching route with calculated times
    const routeWithTimes = routesWithTravelTimes.find(r => r.id === route.id);
    
    // If we click on the already selected route, toggle to show all routes
    if (selectedRoute && selectedRoute.id === route.id) {
      setSelectedRoute(null);
    } else {
      // Otherwise, select this route
      if (routeWithTimes) {
        setSelectedRoute(routeWithTimes);
      } else {
        setSelectedRoute(route);
      }
    }
  }
  
  // Handle click on the map area to show all routes
  const handleMapAreaClick = (e) => {
    // Only trigger if clicking directly on the container, not on any child elements
    if (e.target === e.currentTarget) {
      setSelectedRoute(null);
      setShowAllRoutes(true);
    }
  }

  // Function to assign driver to a route
  const assignDriver = (routeId: string, driver: Driver) => {
    setRoutes(currentRoutes => 
      currentRoutes.map(route => 
        route.id === routeId
          ? { 
              ...route, 
              driverId: driver.id?.toString(),
              driverName: driver.name
            } 
          : route
      )
    );
    
    // Update selected route if this is the one
    if (selectedRoute?.id === routeId) {
      setSelectedRoute({
        ...selectedRoute,
        driverId: driver.id?.toString(),
        driverName: driver.name
      });
    }
    
    // Also update in routesWithTravelTimes
    setRoutesWithTravelTimes(currentRoutes => 
      currentRoutes.map(route => 
        route.id === routeId
          ? { 
              ...route, 
              driverId: driver.id?.toString(),
              driverName: driver.name
            } 
          : route
      )
    );
  }

  // Function to fetch drivers for assignment
  const fetchDrivers = async () => {
    if (drivers.length > 0) return; // Don't fetch if we already have drivers
    
    setLoadingDrivers(true);
    try {
      const driversList = await driversAPI.getAll();
      setDrivers(driversList);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    } finally {
      setLoadingDrivers(false);
    }
  }

  // Function to save a route to history
  const saveToHistory = async (route: Route) => {
    setSavingRoute(route.id);
    
    try {
      // Convert Route to RouteHistory format
      const routeHistory = {
        ...route,
        date: new Date().toISOString(),
        status: "completed" as const
      };
      
      await routeHistoryAPI.save(routeHistory);
      
      toast({
        title: "Route Saved",
        description: `${route.routeName} has been saved to route history`
      });
    } catch (err) {
      console.error("Error saving route to history:", err);
      toast({
        title: "Error",
        description: "Failed to save route to history",
        variant: "destructive"
      });
    } finally {
      setSavingRoute(null);
    }
  }

  // Function to toggle fullscreen mode
  const toggleFullScreen = (e) => {
    e.stopPropagation();
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className="space-y-4">
      {/* Map Area - with full-screen toggle */}
      <Card className={`${isFullScreen ? 'fixed inset-0 z-50 h-full rounded-none' : 'h-64'} transition-all duration-300`}>
        <CardContent className="p-0 h-full relative">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-agriculture-600" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-center space-y-2">
              <div>
                <p className="text-red-500">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchData} className="mt-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            selectedRoute || showAllRoutes ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute top-2 right-2 z-10 bg-white shadow-md hover:bg-gray-100"
                  onClick={toggleFullScreen}
                >
                  {isFullScreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
                <GoogleMap 
                  selectedRoute={selectedRoute} 
                  allRoutes={routes}
                  showAllRoutes={showAllRoutes}
                  depots={depots}
                  onRouteUpdate={handleRouteUpdate}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-center space-y-2">
                <div>
                  <div className="flex justify-center gap-2 mb-4">
                    <Wheat className="h-8 w-8 text-agriculture-600" />
                    <Leaf className="h-6 w-6 text-agriculture-500" />
                  </div>
                  <h3 className="text-lg font-medium leaf-decoration">Agriculture Delivery Routes</h3>
                  <p className="text-muted-foreground">Select a route to view on the map</p>
                </div>
              </div>
            )
          )}
        </CardContent>
      </Card>
      
      {/* Only render the rest of the content when not in full-screen mode */}
      {!isFullScreen && (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatsCard
              title="Routes"
              value={stats.routes.toString()}
              icon={<Wheat className="h-4 w-4" />}
            />
            <StatsCard
              title="Orders"
              value={stats.orders.toString()}
              icon={<Leaf className="h-4 w-4" />}
            />
            <StatsCard
              title="Distance"
              value={`${stats.distance}km`}
              icon={<Wheat className="h-4 w-4" />}
            />
            <StatsCard
              title="Time"
              value={`${stats.time} min`}
              icon={<Leaf className="h-4 w-4" />}
            />
            <StatsCard
              title="Stops"
              value={stats.stops.toString()}
              icon={<Wheat className="h-4 w-4" />}
            />
          </div>

          {/* Detailed Route Tables */}
          {routesWithTravelTimes.length > 0 && (
            <div className="space-y-6">
              {routesWithTravelTimes.map((route) => {
                // Define route colors - these must match the DEFAULT_COLORS in GoogleMap.tsx
                const DEFAULT_COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#F44336'];
                const routeIndex = parseInt(route.id.split('-')[1]) - 1;
                const routeColor = route.color || DEFAULT_COLORS[routeIndex % DEFAULT_COLORS.length];
                
                return (
                  <Card 
                    key={route.id} 
                    className={`route-card ${selectedRoute?.id === route.id ? "border-2" : ""} transition-all cursor-pointer hover:shadow-md`}
                    style={{ borderColor: selectedRoute?.id === route.id ? routeColor : '' }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the map area click
                      handleRouteSelect(route);
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-4 w-4 rounded-full" 
                            style={{ backgroundColor: routeColor }}
                          ></div>
                          <h3 className="font-medium text-lg">{route.routeName}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span>{route.vehicleName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{route.totalDistance}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{route.estimatedTime}</span>
                          </div>
                          
                          {/* Save to History Button */}
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="ml-2 flex items-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              saveToHistory(route);
                            }}
                            disabled={savingRoute === route.id}
                          >
                            {savingRoute === route.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Save className="h-3 w-3" />
                            )}
                            Save
                          </Button>
                          
                          {/* Driver Assignment */}
                          <Popover onOpenChange={(open) => {
                            if (open) fetchDrivers();
                          }}>
                            <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="ml-2 flex items-center gap-1"
                              >
                                <UserCircle2 className="h-4 w-4" />
                                {route.driverName ? route.driverName : "Assign Driver"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-2" onClick={(e) => e.stopPropagation()}>
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm">Assign Driver</h4>
                                {loadingDrivers ? (
                                  <div className="flex justify-center py-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  </div>
                                ) : drivers.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">No drivers available</p>
                                ) : (
                                  <div className="space-y-1 max-h-48 overflow-auto">
                                    {drivers.map(driver => (
                                      <Button 
                                        key={driver.id} 
                                        variant="ghost" 
                                        size="sm" 
                                        className="w-full justify-start text-left"
                                        onClick={() => assignDriver(route.id, driver)}
                                      >
                                        <UserCircle2 className="h-3.5 w-3.5 mr-2" />
                                        {driver.name}
                                      </Button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
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
                              <TableHead className="font-medium">Work Period</TableHead>
                              <TableHead className="font-medium">Start Time</TableHead>
                              <TableHead className="font-medium">Distance Traveled</TableHead>
                              <TableHead className="font-medium">Items</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {route.stops.map((stop, index) => (
                              <TableRow key={stop.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                    <span>{stop.address}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{(stop as any).calculatedArrivalTime || "-"}</TableCell>
                                <TableCell>30 min</TableCell>
                                <TableCell>{(stop as any).calculatedStartTime || "-"}</TableCell>
                                <TableCell>
                                  {index === 0 ? "-" : 
                                    (stop as any).calculatedDistance ? 
                                    `${Math.round((stop as any).calculatedDistance)} km` : 
                                    `${index * 25} km`}
                                </TableCell>
                                <TableCell>{stop.items.join(", ")}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
