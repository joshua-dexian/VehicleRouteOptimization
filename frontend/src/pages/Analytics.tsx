import { useState } from "react";
import { TopNavigation } from "@/components/TopNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { OverviewTab } from "@/components/analytics/OverviewTab";
import { RoutePerformanceTab } from "@/components/analytics/RoutePerformanceTab";
import { DriverPerformanceTab } from "@/components/analytics/DriverPerformanceTab";
import { VehicleUsageTab } from "@/components/analytics/VehicleUsageTab";
import { DateRange } from "react-day-picker";

const Analytics = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation
        title="Analytics Dashboard"
        actionButton={
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => range && setDateRange(range)}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        }
      />
      
      <div className="p-6 space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="routes">Route Performance</TabsTrigger>
            <TabsTrigger value="drivers">Driver Performance</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicle Usage</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <OverviewTab dateRange={dateRange} />
          </TabsContent>
          
          <TabsContent value="routes">
            <RoutePerformanceTab dateRange={dateRange} />
          </TabsContent>
          
          <TabsContent value="drivers">
            <DriverPerformanceTab dateRange={dateRange} />
          </TabsContent>
          
          <TabsContent value="vehicles">
            <VehicleUsageTab dateRange={dateRange} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics; 