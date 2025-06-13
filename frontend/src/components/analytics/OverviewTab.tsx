import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/StatsCard";
import { Truck, Route, Package, Clock, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { DateRange } from "react-day-picker";

interface OverviewTabProps {
  dateRange: DateRange;
}

interface AnalyticsSummary {
  total_routes: number;
  total_distance: number;
  total_duration: number;
  total_orders: number;
  avg_efficiency_score: number | null;
  top_performing_drivers: Array<{
    id: number;
    name: string;
    routes_completed: number;
    on_time_rate: number;
    total_distance: number;
  }>;
  vehicle_utilization: Array<{
    id: number;
    name: string;
    distance_traveled: number;
    utilization_rate: number;
  }>;
}

export function OverviewTab({ dateRange }: OverviewTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<AnalyticsSummary | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Format dates for API
        const from = dateRange.from.toISOString().split('T')[0];
        const to = dateRange.to ? dateRange.to.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        
        const response = await fetch(`/api/analytics/summary?start_date=${from}&end_date=${to}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        
        const data = await response.json();
        setSummaryData(data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast({
          title: "Using demo data",
          description: "Could not connect to the server. Displaying demo data instead.",
          variant: "default",
        });
        // Set default data for demo purposes
        setSummaryData({
          total_routes: 24,
          total_distance: 1250.5,
          total_duration: 3600,
          total_orders: 120,
          avg_efficiency_score: 85.7,
          top_performing_drivers: [
            { id: 1, name: "John Doe", routes_completed: 10, on_time_rate: 95, total_distance: 450 }
          ],
          vehicle_utilization: [
            { id: 1, name: "Truck A", distance_traveled: 350, utilization_rate: 78 }
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange, toast]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-7 w-[200px] mb-2" />
                  <Skeleton className="h-10 w-[100px]" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatsCard
              title="Total Routes"
              value={summaryData?.total_routes.toString() || "0"}
              icon={<Route className="h-4 w-4" />}
            />
            <StatsCard
              title="Total Distance"
              value={`${Math.round(summaryData?.total_distance || 0)} km`}
              icon={<Truck className="h-4 w-4" />}
            />
            <StatsCard
              title="Total Orders"
              value={summaryData?.total_orders.toString() || "0"}
              icon={<Package className="h-4 w-4" />}
            />
            <StatsCard
              title="Total Duration"
              value={`${Math.round((summaryData?.total_duration || 0) / 60)} hrs`}
              icon={<Clock className="h-4 w-4" />}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : summaryData?.top_performing_drivers && summaryData.top_performing_drivers.length > 0 ? (
              <div className="space-y-4">
                {summaryData.top_performing_drivers.map((driver) => (
                  <div key={driver.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-agriculture-100 p-2 rounded-full">
                        <Award className="h-4 w-4 text-agriculture-600" />
                      </div>
                      <div>
                        <p className="font-medium">{driver.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {driver.routes_completed} routes • {Math.round(driver.total_distance)} km
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{driver.on_time_rate}%</p>
                      <p className="text-sm text-muted-foreground">On-time rate</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No driver data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : summaryData?.vehicle_utilization && summaryData.vehicle_utilization.length > 0 ? (
              <div className="space-y-4">
                {summaryData.vehicle_utilization.map((vehicle) => (
                  <div key={vehicle.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{vehicle.name}</p>
                      <p className="text-sm">{Math.round(vehicle.utilization_rate)}% utilized</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className="bg-agriculture-600 h-2.5 rounded-full"
                        style={{ width: `${vehicle.utilization_rate}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(vehicle.distance_traveled)} km traveled
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No vehicle data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}