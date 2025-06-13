from sqlalchemy import Column, Integer, String, Text, DateTime, Float, JSON, ForeignKey
from sqlalchemy.sql import func
from ..database import Base

class RouteAnalytics(Base):
    __tablename__ = "route_analytics"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime(timezone=True), server_default=func.now())
    route_history_id = Column(Integer, ForeignKey("route_history.id"), nullable=True)
    planned_vs_actual_time_diff = Column(Float, nullable=True)  # in minutes
    planned_vs_actual_distance_diff = Column(Float, nullable=True)  # in km
    efficiency_score = Column(Float, nullable=True)  # calculated metric
    weather_conditions = Column(String(100), nullable=True)
    traffic_conditions = Column(String(100), nullable=True)
    meta_data = Column(JSON, nullable=True)  # Additional analytics data

class DriverPerformance(Base):
    __tablename__ = "driver_performance"

    id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now())
    routes_completed = Column(Integer, default=0)
    avg_time_per_delivery = Column(Float, nullable=True)  # in minutes
    total_distance = Column(Float, nullable=True)  # in km
    total_duration = Column(Float, nullable=True)  # in minutes
    on_time_delivery_rate = Column(Float, nullable=True)  # percentage
    notes = Column(Text, nullable=True)

class VehicleUsage(Base):
    __tablename__ = "vehicle_usage"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now())
    distance_traveled = Column(Float, nullable=True)  # in km
    fuel_consumption = Column(Float, nullable=True)  # estimated
    maintenance_status = Column(String(50), nullable=True)
    utilization_rate = Column(Float, nullable=True)  # percentage
    notes = Column(Text, nullable=True) 