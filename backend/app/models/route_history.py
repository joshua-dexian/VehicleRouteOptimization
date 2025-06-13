from sqlalchemy import Column, Integer, String, Text, DateTime, Float, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class RouteHistory(Base):
    __tablename__ = "route_history"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    date_created = Column(DateTime(timezone=True), server_default=func.now())
    total_distance = Column(Float, nullable=True)
    total_duration = Column(Float, nullable=True)
    total_orders = Column(Integer, nullable=True)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    depot_id = Column(Integer, ForeignKey("depots.id"), nullable=True)
    route_data = Column(JSON, nullable=True)  # Store complete route data including waypoints
    actual_completion_time = Column(Float, nullable=True)
    actual_distance = Column(Float, nullable=True)
    notes = Column(Text, nullable=True) 