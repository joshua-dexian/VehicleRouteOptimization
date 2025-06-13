from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime

# Order Schemas
class OrderBase(BaseModel):
    address: str
    order_number: Optional[str] = None
    customer_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration: Optional[str] = None
    load: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class OrderUpdate(OrderBase):
    address: Optional[str] = None

class OrderResponse(OrderBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Vehicle Schemas
class VehicleBase(BaseModel):
    plate_number: str
    type: str
    capacity: Optional[str] = None

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(VehicleBase):
    plate_number: Optional[str] = None
    type: Optional[str] = None

class VehicleResponse(VehicleBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Driver Schemas
class DriverBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    license_number: Optional[str] = None
    experience: Optional[str] = None

class DriverCreate(DriverBase):
    pass

class DriverUpdate(DriverBase):
    name: Optional[str] = None
    email: Optional[str] = None

class DriverResponse(DriverBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Depot Schemas
class DepotBase(BaseModel):
    name: str
    address: str
    capacity: Optional[str] = None
    status: Optional[str] = "Active"

class DepotCreate(DepotBase):
    pass

class DepotUpdate(DepotBase):
    name: Optional[str] = None
    address: Optional[str] = None

class DepotResponse(DepotBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Route History Schemas
class RouteHistoryBase(BaseModel):
    name: str
    total_distance: Optional[float] = None
    total_duration: Optional[float] = None
    total_orders: Optional[int] = None
    driver_id: Optional[int] = None
    vehicle_id: Optional[int] = None
    depot_id: Optional[int] = None
    route_data: Optional[Dict[str, Any]] = None
    actual_completion_time: Optional[float] = None
    actual_distance: Optional[float] = None
    notes: Optional[str] = None

class RouteHistoryCreate(RouteHistoryBase):
    pass

class RouteHistoryUpdate(BaseModel):
    name: Optional[str] = None
    total_distance: Optional[float] = None
    total_duration: Optional[float] = None
    total_orders: Optional[int] = None
    driver_id: Optional[int] = None
    vehicle_id: Optional[int] = None
    depot_id: Optional[int] = None
    route_data: Optional[Dict[str, Any]] = None
    actual_completion_time: Optional[float] = None
    actual_distance: Optional[float] = None
    notes: Optional[str] = None

class RouteHistory(RouteHistoryBase):
    id: int
    date_created: datetime

    class Config:
        orm_mode = True

# Analytics Schemas
class RouteAnalyticsBase(BaseModel):
    route_history_id: Optional[int] = None
    planned_vs_actual_time_diff: Optional[float] = None
    planned_vs_actual_distance_diff: Optional[float] = None
    efficiency_score: Optional[float] = None
    weather_conditions: Optional[str] = None
    traffic_conditions: Optional[str] = None
    meta_data: Optional[Dict[str, Any]] = None

class RouteAnalyticsCreate(RouteAnalyticsBase):
    pass

class RouteAnalyticsUpdate(BaseModel):
    planned_vs_actual_time_diff: Optional[float] = None
    planned_vs_actual_distance_diff: Optional[float] = None
    efficiency_score: Optional[float] = None
    weather_conditions: Optional[str] = None
    traffic_conditions: Optional[str] = None
    meta_data: Optional[Dict[str, Any]] = None

class RouteAnalytics(RouteAnalyticsBase):
    id: int
    date: datetime

    class Config:
        orm_mode = True

class DriverPerformanceBase(BaseModel):
    driver_id: int
    routes_completed: Optional[int] = 0
    avg_time_per_delivery: Optional[float] = None
    total_distance: Optional[float] = None
    total_duration: Optional[float] = None
    on_time_delivery_rate: Optional[float] = None
    notes: Optional[str] = None

class DriverPerformanceCreate(DriverPerformanceBase):
    pass

class DriverPerformanceUpdate(BaseModel):
    routes_completed: Optional[int] = None
    avg_time_per_delivery: Optional[float] = None
    total_distance: Optional[float] = None
    total_duration: Optional[float] = None
    on_time_delivery_rate: Optional[float] = None
    notes: Optional[str] = None

class DriverPerformance(DriverPerformanceBase):
    id: int
    date: datetime

    class Config:
        orm_mode = True

class VehicleUsageBase(BaseModel):
    vehicle_id: int
    distance_traveled: Optional[float] = None
    fuel_consumption: Optional[float] = None
    maintenance_status: Optional[str] = None
    utilization_rate: Optional[float] = None
    notes: Optional[str] = None

class VehicleUsageCreate(VehicleUsageBase):
    pass

class VehicleUsageUpdate(BaseModel):
    distance_traveled: Optional[float] = None
    fuel_consumption: Optional[float] = None
    maintenance_status: Optional[str] = None
    utilization_rate: Optional[float] = None
    notes: Optional[str] = None

class VehicleUsage(VehicleUsageBase):
    id: int
    date: datetime

    class Config:
        orm_mode = True

# Analytics Dashboard Schemas
class AnalyticsSummary(BaseModel):
    total_routes: int
    total_distance: float
    total_duration: float
    total_orders: int
    avg_efficiency_score: Optional[float] = None
    top_performing_drivers: List[Dict[str, Any]]
    vehicle_utilization: List[Dict[str, Any]]
    
class TimeSeriesData(BaseModel):
    labels: List[str]
    datasets: List[Dict[str, Any]] 