import { useState, useEffect } from "react"
import { TopNavigation } from "@/components/TopNavigation"
import { StatsCard } from "@/components/StatsCard"
import { TypeWriter } from "@/components/TypeWriter"
import { SlideInCard } from "@/components/SlideInCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Route, Clock, TrendingUp, MapPin, Fuel, ShoppingBag, Loader2 } from "lucide-react"
import { GoogleMap } from "@/components/GoogleMap"
import { depotsAPI, Depot } from "@/services/api"
import { RouteProvider } from "@/contexts/RouteContext"
import { NumberShuffler } from "@/components/NumberShuffler"

// Mock data for the metrics
const mockMetrics = {
  totalDistance: "12,450 km",
  totalWorkingTime: "1,250 hrs",
  totalOrders: "1,876",
  fuelSaved: "3,200 L"
}

const Index = () => {
  const [metrics, setMetrics] = useState(mockMetrics)
  const [depots, setDepots] = useState<Depot[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch real depot data
  useEffect(() => {
    const fetchDepots = async () => {
      setLoading(true);
      try {
        // Use real API data
        let data: Depot[] = [];
        try {
          data = await depotsAPI.getAll();
          console.log("Fetched real depot data:", data);
          setDepots(data);
        } catch (apiError) {
          console.error("API error, falling back to hardcoded data:", apiError);
          // Fallback to hardcoded data if API fails
          setDepots([
            { id: 1, name: "Central Depot", address: "Chennai Central, Tamil Nadu, India", status: "Active" },
            { id: 2, name: "North Warehouse", address: "Ambattur, Chennai, Tamil Nadu, India", status: "Active" },
            { id: 3, name: "South Hub", address: "Tambaram, Chennai, Tamil Nadu, India", status: "Maintenance" }
          ]);
        }
      } catch (error) {
        console.error("Error setting depots:", error);
        // Final fallback if everything fails
        setDepots([
          { id: 1, name: "Central Depot", address: "Chennai, Tamil Nadu, India", status: "Active" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDepots();
  }, []);

  // Periodically update metrics to show shuffling effect
  useEffect(() => {
    // Initial metrics update after 3 seconds
    const initialTimeout = setTimeout(() => {
      updateMetricsWithRandomValues();
    }, 5000);
    
    // Set up interval for periodic updates
    const intervalId = setInterval(() => {
      updateMetricsWithRandomValues();
    }, 15000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, []);
  
  // Function to update metrics with random values
  const updateMetricsWithRandomValues = () => {
    // Generate random variations of the metrics
    const distanceValue = Math.floor(10000 + Math.random() * 5000);
    const formattedDistance = `${Math.floor(distanceValue / 1000)},${(distanceValue % 1000).toString().padStart(3, '0')} km`;
    
    const workingHours = Math.floor(1000 + Math.random() * 500);
    const formattedWorkingTime = `${Math.floor(workingHours / 100)},${(workingHours % 100).toString().padStart(2, '0')} hrs`;
    
    const orders = Math.floor(1500 + Math.random() * 800);
    const formattedOrders = `${Math.floor(orders / 1000)},${(orders % 1000).toString().padStart(3, '0')}`;
    
    const fuelSaved = Math.floor(2800 + Math.random() * 800);
    const formattedFuelSaved = `${Math.floor(fuelSaved / 1000)},${(fuelSaved % 1000).toString().padStart(3, '0')} L`;
    
    setMetrics({
      totalDistance: formattedDistance,
      totalWorkingTime: formattedWorkingTime,
      totalOrders: formattedOrders,
      fuelSaved: formattedFuelSaved
    });
  };

  // You could fetch real metrics here
  useEffect(() => {
    // Sample code to fetch metrics from API
    const fetchMetrics = async () => {
      try {
        // const response = await fetch('/api/dashboard/metrics')
        // const data = await response.json()
        // setMetrics(data)
      } catch (error) {
        console.error("Error fetching metrics:", error)
      }
    }

    // Uncomment to fetch real data
    // fetchMetrics()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-agriculture-50 to-white">
      <TopNavigation
        title="Dashboard"
        actionButton={
          <Button variant="outline" className="shadow-md hover:shadow-lg transition-shadow">
            April 1 - April 30, 2025
          </Button>
        }
      />
      <div className="p-6 space-y-8">
        {/* Enhanced Hero Section with Natural Design */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-green-50 to-agriculture-100 border-0 shadow-2xl">
          {/* Natural Background Image */}
          <div 
            className="absolute inset-0 opacity-10 bg-cover bg-center"
            style={{
              backgroundImage: `url('/lovable-uploads/604f6b67-4323-4395-9935-82483b44fa0e.png')`
            }}
          />
          
          <CardHeader className="relative z-10 pb-8 pt-16">
            <CardTitle className="flex items-center gap-3 text-center justify-center mb-8">
              <Package className="h-8 w-8 text-agriculture-600" />
              <span className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-agriculture-600 to-green-700 bg-clip-text text-transparent">
                <TypeWriter text="Dexian Agriculture Delivery" speed={40} />
              </span>
              <TrendingUp className="h-6 w-6 text-agriculture-500" />
            </CardTitle>
            <div className="text-center">
              <h2 className="text-xl md:text-3xl font-semibold text-agriculture-700 mb-6">
                <TypeWriter text="Optimization Dashboard" speed={40} delay={1500} />
              </h2>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 pb-16">
            <div className="text-center space-y-8">
              <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                <TypeWriter 
                  text="Streamline your agricultural product deliveries with intelligent route optimization, real-time tracking, and comprehensive fleet management solutions."
                  speed={15}
                  delay={3000}
                />
              </p>
              <div className="flex justify-center gap-6 mt-12">
                <Button className="bg-agriculture-600 hover:bg-agriculture-700 text-lg px-10 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-full" asChild>
                  <a href="/orders">
                    <Package className="h-5 w-5 mr-2" />
                    Manage Orders
                  </a>
                </Button>
                <Button variant="outline" className="text-lg px-10 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-full border-2 border-agriculture-600 text-agriculture-600 hover:bg-agriculture-50" asChild>
                  <a href="/routes">
                    <Route className="h-5 w-5 mr-2" />
                    Optimize Routes
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </div>

        {/* New Metrics Section */}
        <SlideInCard direction="left" delay={200}>
          <Card className="shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl border-0 bg-gradient-to-br from-white to-green-50">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-agriculture-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-agriculture-600" />
                </div>
                <TypeWriter text="Delivery Performance" delay={5000} speed={60} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SlideInCard direction="left" delay={500}>
                  <div className="relative rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-cover bg-center overflow-hidden bg-gradient-to-br from-green-50 to-white">
                    <div className="relative z-10">
                      <StatsCard
                        title="Total Distance"
                        value={metrics.totalDistance}
                        icon={<Route className="h-5 w-5 text-green-700" />}
                        className="bg-transparent shadow-none border-0"
                        enableShuffling={true}
                      />
                    </div>
                  </div>
                </SlideInCard>
                <SlideInCard direction="left" delay={700}>
                  <div className="relative rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-cover bg-center overflow-hidden bg-gradient-to-br from-blue-50 to-white">
                    <div className="relative z-10">
                      <StatsCard
                        title="Working Time"
                        value={metrics.totalWorkingTime}
                        icon={<Clock className="h-5 w-5 text-blue-700" />}
                        className="bg-transparent shadow-none border-0"
                        enableShuffling={true}
                      />
                    </div>
                  </div>
                </SlideInCard>
                <SlideInCard direction="left" delay={900}>
                  <div className="relative rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-cover bg-center overflow-hidden bg-gradient-to-br from-orange-50 to-white">
                    <div className="relative z-10">
                      <StatsCard
                        title="Total Orders"
                        value={metrics.totalOrders}
                        icon={<ShoppingBag className="h-5 w-5 text-orange-700" />}
                        className="bg-transparent shadow-none border-0"
                        enableShuffling={true}
                      />
                    </div>
                  </div>
                </SlideInCard>
                <SlideInCard direction="left" delay={1100}>
                  <div className="relative rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-cover bg-center overflow-hidden bg-gradient-to-br from-purple-50 to-white">
                    <div className="relative z-10">
                      <StatsCard
                        title="Fuel Saved"
                        value={metrics.fuelSaved}
                        icon={<Fuel className="h-5 w-5 text-purple-700" />}
                        className="bg-transparent shadow-none border-0"
                        enableShuffling={true}
                      />
                    </div>
                  </div>
                </SlideInCard>
              </div>
            </CardContent>
          </Card>
        </SlideInCard>

        {/* Enhanced Depots Section - With real-time data */}
        <SlideInCard direction="right" delay={300}>
          <Card className="shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl border-0 bg-gradient-to-br from-white to-agriculture-50">
            <CardHeader>
                              <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-agriculture-100 rounded-full">
                    <MapPin className="h-6 w-6 text-agriculture-600" />
                  </div>
                  <TypeWriter text="Active Depots" delay={6000} speed={70} />
                </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading ? (
                  // Loading skeleton
                  Array(3).fill(0).map((_, index) => (
                    <SlideInCard key={index} direction="right" delay={1300 + index * 200}>
                      <div className="p-6 bg-gradient-to-br from-agriculture-50 to-white rounded-2xl shadow-lg animate-pulse">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-agriculture-100 rounded-full">
                            <div className="h-6 w-6 bg-agriculture-200 rounded-full"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 bg-agriculture-100 rounded w-24"></div>
                            <div className="h-3 bg-agriculture-50 rounded w-32"></div>
                            <div className="h-5 bg-green-100 rounded-full w-16 mt-2"></div>
                          </div>
                        </div>
                      </div>
                    </SlideInCard>
                  ))
                ) : (
                  depots.map((depot, index) => (
                    <SlideInCard key={depot.id} direction="right" delay={1300 + index * 200}>
                      <div className="p-6 bg-gradient-to-br from-agriculture-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-agriculture-100 rounded-full">
                            <MapPin className="h-6 w-6 text-agriculture-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{depot.name}</h4>
                            <p className="text-sm text-muted-foreground">{depot.address}</p>
                            <div className="flex items-center justify-between mt-2">
                              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                depot.status === "Active" || depot.status === "active"
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {depot.status || "Active"}
                              </div>
                              {depot.capacity && (
                                <span className="text-xs text-muted-foreground">
                                  Capacity: {depot.capacity}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </SlideInCard>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </SlideInCard>

        {/* Depot Map */}
        <SlideInCard direction="right" delay={400}>
          <Card className="shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl border-0 bg-gradient-to-br from-white to-agriculture-50">
            <CardHeader>
                              <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-agriculture-100 rounded-full">
                    <MapPin className="h-6 w-6 text-agriculture-600" />
                  </div>
                  <TypeWriter text="Depot Locations" delay={7000} speed={60} />
                  <div className="ml-auto">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 rounded-full"
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const freshData = await depotsAPI.getAll();
                          console.log("Refreshed real depot data:", freshData);
                          setDepots(freshData);
                        } catch (error) {
                          console.error("Error refreshing depot data:", error);
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                      >
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                        <path d="M16 21h5v-5" />
                      </svg>
                      <span className="sr-only">Refresh</span>
                    </Button>
                  </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-500 h-[400px]">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <Loader2 className="h-8 w-8 animate-spin text-agriculture-600" />
                  </div>
                ) : (
                  <RouteProvider>
                    <GoogleMap
                      selectedRoute={null}
                      allRoutes={[]}
                      showAllRoutes={false}
                      depots={depots}
                      className="h-full w-full"
                    />
                  </RouteProvider>
                )}
              </div>
            </CardContent>
          </Card>
        </SlideInCard>
      </div>
    </div>
  )
}

export default Index
