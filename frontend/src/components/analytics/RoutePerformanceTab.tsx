import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ChartOptions
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { DateRange } from "react-day-picker";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RoutePerformanceTabProps {
  dateRange: DateRange;
}

interface TimeSeriesData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

export function RoutePerformanceTab({ dateRange }: RoutePerformanceTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<TimeSeriesData | null>(null);
  const [metric, setMetric] = useState<string>("distance");
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Format dates for API
        const from = dateRange.from.toISOString().split('T')[0];
        const to = dateRange.to ? dateRange.to.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        
        const response = await fetch(`/api/analytics/route-performance?start_date=${from}&end_date=${to}&metric=${metric}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch route performance data');
        }
        
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error('Error fetching route performance data:', error);
        toast({
          title: "Using demo data",
          description: "Could not connect to the server. Displaying demo data instead.",
          variant: "default",
        });
        // Set default data for demo purposes
        setChartData({
          labels: ['Jan 1', 'Jan 2', 'Jan 3', 'Jan 4', 'Jan 5', 'Jan 6', 'Jan 7'],
          datasets: [
            {
              label: `Planned ${metric}`,
              data: [65, 70, 80, 81, 56, 55, 60],
              borderColor: 'rgb(53, 162, 235)',
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
            {
              label: `Actual ${metric}`,
              data: [70, 75, 82, 85, 60, 58, 63],
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange, metric, toast]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Route Performance Analysis</h3>
        <Select value={metric} onValueChange={setMetric}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="distance">Distance (km)</SelectItem>
            <SelectItem value="duration">Duration (min)</SelectItem>
            <SelectItem value="efficiency">Efficiency (%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planned vs Actual {metric.charAt(0).toUpperCase() + metric.slice(1)}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="w-full h-[400px] flex items-center justify-center">
              <Skeleton className="h-[350px] w-full" />
            </div>
          ) : chartData ? (
            <div className="h-[400px]">
              <Line
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: metric === 'distance' ? 'Distance (km)' : 
                              metric === 'duration' ? 'Duration (min)' : 
                              'Efficiency (%)'
                      }
                    }
                  },
                  interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
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
          <CardTitle>Difference Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="w-full h-[350px] flex items-center justify-center">
              <Skeleton className="h-[300px] w-full" />
            </div>
          ) : chartData ? (
            <div className="h-[350px]">
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
                          const dataIndex = context.dataIndex;
                          const planned = chartData.datasets[0].data[dataIndex];
                          const actual = chartData.datasets[1].data[dataIndex];
                          const diff = actual - planned;
                          const percentage = (diff / planned * 100).toFixed(1);
                          
                          return `Difference: ${diff.toFixed(1)} (${percentage}%)`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Difference'
                      }
                    }
                  }
                }}
                data={{
                  labels: chartData.labels,
                  datasets: [
                    {
                      label: 'Difference',
                      data: chartData.datasets[1].data.map((actual, i) => {
                        const planned = chartData.datasets[0].data[i];
                        return actual - planned;
                      }),
                      backgroundColor: chartData.datasets[1].data.map((actual, i) => {
                        const planned = chartData.datasets[0].data[i];
                        return actual > planned ? 'rgba(255, 99, 132, 0.5)' : 'rgba(75, 192, 192, 0.5)';
                      }),
                    }
                  ]
                }}
              />
            </div>
          ) : (
            <div className="w-full h-[350px] flex items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 