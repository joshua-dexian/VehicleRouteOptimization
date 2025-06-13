import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DateRange } from "react-day-picker";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DriverPerformanceTabProps {
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

export function DriverPerformanceTab({ dateRange }: DriverPerformanceTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<TimeSeriesData | null>(null);
  const [metric, setMetric] = useState<string>("on_time_rate");
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Format dates for API
        const from = dateRange.from.toISOString().split('T')[0];
        const to = dateRange.to ? dateRange.to.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        
        const response = await fetch(`/api/analytics/driver-performance?start_date=${from}&end_date=${to}&metric=${metric}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch driver performance data');
        }
        
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error('Error fetching driver performance data:', error);
        toast({
          title: "Using demo data",
          description: "Could not connect to the server. Displaying demo data instead.",
          variant: "default",
        });
        // Set default data for demo purposes
        setChartData({
          labels: ['John Doe', 'Jane Smith', 'Robert Johnson', 'Emily Davis'],
          datasets: [
            {
              label: metric === 'on_time_rate' ? 'On-time Rate (%)' : 
                     metric === 'avg_time' ? 'Average Time per Delivery (min)' : 
                     'Total Distance (km)',
              data: metric === 'on_time_rate' ? [95, 87, 92, 89] : 
                    metric === 'avg_time' ? [25, 30, 22, 28] : 
                    [450, 380, 520, 410],
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

  // Generate table data from chart data
  const tableData = chartData ? chartData.labels.map((label, index) => ({
    name: label,
    value: chartData.datasets[0].data[index],
    rank: index + 1
  })).sort((a, b) => {
    // Sort by value (descending for on_time_rate, ascending for avg_time)
    if (metric === 'avg_time') {
      return a.value - b.value; // Lower is better for delivery time
    }
    return b.value - a.value; // Higher is better for on_time_rate and distance
  }) : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Driver Performance Analysis</h3>
        <Select value={metric} onValueChange={setMetric}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="on_time_rate">On-time Rate (%)</SelectItem>
            <SelectItem value="avg_time">Avg. Delivery Time</SelectItem>
            <SelectItem value="distance">Total Distance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {metric === 'on_time_rate' ? 'On-time Delivery Rate' : 
             metric === 'avg_time' ? 'Average Time per Delivery' : 
             'Total Distance Traveled'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="w-full h-[400px] flex items-center justify-center">
              <Skeleton className="h-[350px] w-full" />
            </div>
          ) : chartData ? (
            <div className="h-[400px]">
              <Bar
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const value = context.raw as number;
                          if (metric === 'on_time_rate') {
                            return `On-time rate: ${value}%`;
                          } else if (metric === 'avg_time') {
                            return `Avg. time: ${value} minutes`;
                          } else {
                            return `Distance: ${value} km`;
                          }
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: metric === 'on_time_rate' ? 'On-time Rate (%)' : 
                              metric === 'avg_time' ? 'Minutes' : 
                              'Distance (km)'
                      }
                    }
                  }
                }}
                data={chartData}
              />
            </div>
          ) : (
            <div className="w-full h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Driver Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : tableData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Rank</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead className="text-right">
                    {metric === 'on_time_rate' ? 'On-time Rate' : 
                     metric === 'avg_time' ? 'Avg. Time' : 
                     'Distance'}
                  </TableHead>
                  <TableHead className="text-right">Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((driver, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">#{index + 1}</TableCell>
                    <TableCell>{driver.name}</TableCell>
                    <TableCell className="text-right">
                      {metric === 'on_time_rate' ? `${driver.value}%` : 
                       metric === 'avg_time' ? `${driver.value} min` : 
                       `${driver.value} km`}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={
                        index === 0 ? "default" : 
                        index === 1 ? "outline" : 
                        "secondary"
                      }>
                        {index === 0 ? "Excellent" : 
                         index === 1 ? "Good" : 
                         index === 2 ? "Average" : 
                         "Needs Improvement"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No driver data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 