import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ChartOptions
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Progress } from "@/components/ui/progress";
import { DateRange } from "react-day-picker";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

interface VehicleUsageTabProps {
  dateRange: DateRange;
}

interface TimeSeriesData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
  }[];
}

export function VehicleUsageTab({ dateRange }: VehicleUsageTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<TimeSeriesData | null>(null);
  const [metric, setMetric] = useState<string>("utilization");
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Format dates for API
        const from = dateRange.from.toISOString().split('T')[0];
        const to = dateRange.to ? dateRange.to.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        
        const response = await fetch(`/api/analytics/vehicle-usage?start_date=${from}&end_date=${to}&metric=${metric}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch vehicle usage data');
        }
        
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error('Error fetching vehicle usage data:', error);
        toast({
          title: "Using demo data",
          description: "Could not connect to the server. Displaying demo data instead.",
          variant: "default",
        });
        // Set default data for demo purposes
        setChartData({
          labels: ['Truck A', 'Truck B', 'Van C', 'Van D'],
          datasets: [
            {
              label: metric === 'utilization' ? 'Utilization Rate (%)' : 
                     metric === 'distance' ? 'Distance Traveled (km)' : 
                     'Fuel Consumption (L)',
              data: metric === 'utilization' ? [78, 65, 82, 70] : 
                    metric === 'distance' ? [350, 280, 420, 310] : 
                    [45, 38, 30, 25],
              backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(53, 162, 235, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(255, 206, 86, 0.5)',
              ],
            }
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange, metric, toast]);

  // Calculate total values for the pie chart
  const totalValue = chartData ? chartData.datasets[0].data.reduce((sum, value) => sum + value, 0) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Vehicle Usage Analysis</h3>
        <Select value={metric} onValueChange={setMetric}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="utilization">Utilization Rate</SelectItem>
            <SelectItem value="distance">Distance Traveled</SelectItem>
            <SelectItem value="fuel">Fuel Consumption</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {metric === 'utilization' ? 'Utilization Rate' : 
               metric === 'distance' ? 'Distance Traveled' : 
               'Fuel Consumption'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="w-full h-[300px] flex items-center justify-center">
                <Skeleton className="h-[250px] w-full" />
              </div>
            ) : chartData ? (
              <div className="h-[300px]">
                <Bar
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: metric === 'utilization' ? 'Rate (%)' : 
                                metric === 'distance' ? 'Distance (km)' : 
                                'Fuel (L)'
                        }
                      }
                    }
                  }}
                  data={chartData}
                />
              </div>
            ) : (
              <div className="w-full h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="w-full h-[300px] flex items-center justify-center">
                <Skeleton className="h-[250px] w-[250px] rounded-full mx-auto" />
              </div>
            ) : chartData ? (
              <div className="h-[300px] flex items-center justify-center">
                <div style={{ width: '250px', height: '250px' }}>
                  <Pie
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const value = context.raw as number;
                              const percentage = ((value / totalValue) * 100).toFixed(1);
                              if (metric === 'utilization') {
                                return `Utilization: ${value}% (${percentage}% of total)`;
                              } else if (metric === 'distance') {
                                return `Distance: ${value} km (${percentage}% of total)`;
                              } else {
                                return `Fuel: ${value} L (${percentage}% of total)`;
                              }
                            }
                          }
                        }
                      }
                    }}
                    data={chartData}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Display individual vehicle stats */}
      {chartData && (
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.labels.map((label, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{label}</div>
                    <div className="text-sm">
                      {metric === 'utilization' ? `${chartData.datasets[0].data[index]}%` :
                       metric === 'distance' ? `${chartData.datasets[0].data[index]} km` :
                       `${chartData.datasets[0].data[index]} L`}
                    </div>
                  </div>
                  <Progress 
                    value={metric === 'utilization' ? 
                      chartData.datasets[0].data[index] : 
                      (chartData.datasets[0].data[index] / Math.max(...chartData.datasets[0].data)) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}