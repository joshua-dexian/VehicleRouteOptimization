from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import logging

# Import services
try:
    from ..services.vrp_solver import solve_vrp
except ImportError:
    # Mock implementation if service is not available
    logging.warning("VRP solver not available, using mock implementation")
    
    def solve_vrp(locations, num_vehicles=1, depot_index=0, **kwargs):
        return {
            "status": "OK",
            "routes": [
                {
                    "vehicle_id": 0,
                    "route": [0, 1, 2, 0],
                    "distance": 10000,
                    "time": 1200
                }
            ],
            "total_distance": 10000,
            "total_time": 1200
        }

# Models
class Location(BaseModel):
    address: str
    lat: Optional[float] = None
    lng: Optional[float] = None

class TimeWindow(BaseModel):
    start: int  # seconds from midnight
    end: int    # seconds from midnight

class VRPRequest(BaseModel):
    locations: List[Location]
    num_vehicles: int = 1
    depot_index: int = 0
    vehicle_capacities: Optional[List[int]] = None
    demands: Optional[List[int]] = None
    time_windows: Optional[List[TimeWindow]] = None
    max_time_per_vehicle: Optional[List[int]] = None

class RouteStop(BaseModel):
    location_index: int
    address: str

class Route(BaseModel):
    vehicle_id: int
    stops: List[RouteStop]
    distance: int  # meters
    time: Optional[int] = None  # seconds
    load: Optional[int] = None

class VRPResponse(BaseModel):
    status: str
    routes: List[Route]
    total_distance: int
    total_time: int
    message: Optional[str] = None

# Router
router = APIRouter(
    prefix="/vrp",
    tags=["vrp"],
    responses={404: {"description": "Not found"}},
)

@router.post("/solve", response_model=VRPResponse)
async def solve_vehicle_routing_problem(request: VRPRequest):
    """
    Solve a Vehicle Routing Problem
    """
    # Extract addresses from locations
    addresses = [location.address for location in request.locations]
    
    # Convert time windows if provided
    time_windows = None
    if request.time_windows:
        time_windows = [(tw.start, tw.end) for tw in request.time_windows]
    
    try:
        # Solve VRP
        result = solve_vrp(
            locations=addresses,
            num_vehicles=request.num_vehicles,
            depot_index=request.depot_index,
            vehicle_capacities=request.vehicle_capacities,
            demands=request.demands,
            time_windows=time_windows,
            max_time_per_vehicle=request.max_time_per_vehicle
        )
        
        if result["status"] != "OK":
            return {
                "status": result["status"],
                "routes": [],
                "total_distance": 0,
                "total_time": 0,
                "message": "Failed to solve VRP"
            }
        
        # Convert routes to response format
        routes = []
        for route_data in result["routes"]:
            route_stops = []
            for location_idx in route_data["route"]:
                if location_idx < len(addresses):
                    route_stops.append({
                        "location_index": location_idx,
                        "address": addresses[location_idx]
                    })
            
            routes.append({
                "vehicle_id": route_data["vehicle_id"],
                "stops": route_stops,
                "distance": route_data["distance"],
                "time": route_data.get("time"),
                "load": route_data.get("load")
            })
        
        return {
            "status": "OK",
            "routes": routes,
            "total_distance": result["total_distance"],
            "total_time": result["total_time"]
        }
        
    except Exception as e:
        logging.error(f"Error solving VRP: {str(e)}")
        return {
            "status": "ERROR",
            "routes": [],
            "total_distance": 0,
            "total_time": 0,
            "message": str(e)
        }

# Export router
vrp_router = router 