from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
from typing import List, Dict, Any, Tuple, Optional
import numpy as np
import logging
from .distance_matrix import batch_distance_matrix, extract_distance_duration

# Set up logging
logger = logging.getLogger(__name__)

class VRPSolver:
    """
    Vehicle Routing Problem solver using Google OR-Tools
    """
    
    def __init__(self):
        """Initialize the VRP solver"""
        self.manager = None
        self.routing = None
        self.solution = None
        self.data = None
    
    def create_distance_matrix(self, locations: List[str]) -> np.ndarray:
        """
        Create a distance matrix from a list of locations
        
        Args:
            locations: List of location addresses or coordinates
            
        Returns:
            numpy.ndarray: Distance matrix
        """
        logger.info(f"Creating distance matrix for {len(locations)} locations")
        
        # Get distance matrix from Google Maps API
        matrix_result = batch_distance_matrix(locations)
        
        if matrix_result.get("status") != "OK":
            logger.error(f"Error creating distance matrix: {matrix_result.get('error_message')}")
            # Create a dummy matrix with zeros
            return np.zeros((len(locations), len(locations)))
        
        # Extract distances from the result
        n = len(locations)
        distance_matrix = np.zeros((n, n), dtype=np.int32)
        
        for i in range(n):
            for j in range(n):
                element = extract_distance_duration(matrix_result, i, j)
                if element.get("status") == "OK":
                    # Convert distance from meters to a suitable integer value
                    distance_matrix[i, j] = element.get("distance", {}).get("value", 0)
                else:
                    # Use a large value for invalid routes
                    distance_matrix[i, j] = 999999
        
        return distance_matrix
    
    def create_time_matrix(self, locations: List[str]) -> np.ndarray:
        """
        Create a time matrix from a list of locations
        
        Args:
            locations: List of location addresses or coordinates
            
        Returns:
            numpy.ndarray: Time matrix (in seconds)
        """
        logger.info(f"Creating time matrix for {len(locations)} locations")
        
        # Get distance matrix from Google Maps API
        matrix_result = batch_distance_matrix(locations)
        
        if matrix_result.get("status") != "OK":
            logger.error(f"Error creating time matrix: {matrix_result.get('error_message')}")
            # Create a dummy matrix with zeros
            return np.zeros((len(locations), len(locations)))
        
        # Extract durations from the result
        n = len(locations)
        time_matrix = np.zeros((n, n), dtype=np.int32)
        
        for i in range(n):
            for j in range(n):
                element = extract_distance_duration(matrix_result, i, j)
                if element.get("status") == "OK":
                    # Get duration in seconds
                    time_matrix[i, j] = element.get("duration", {}).get("value", 0)
                else:
                    # Use a large value for invalid routes
                    time_matrix[i, j] = 999999
        
        return time_matrix
    
    def solve(
        self,
        distance_matrix: np.ndarray,
        num_vehicles: int = 1,
        depot: int = 0,
        vehicle_capacities: Optional[List[int]] = None,
        demands: Optional[List[int]] = None,
        time_matrix: Optional[np.ndarray] = None,
        time_windows: Optional[List[Tuple[int, int]]] = None,
        max_time_per_vehicle: Optional[List[int]] = None
    ) -> Dict[str, Any]:
        """
        Solve the Vehicle Routing Problem
        
        Args:
            distance_matrix: Matrix of distances between locations
            num_vehicles: Number of vehicles available
            depot: Index of the depot location
            vehicle_capacities: List of vehicle capacities
            demands: List of demands for each location
            time_matrix: Matrix of travel times between locations
            time_windows: List of time windows for each location (start, end)
            max_time_per_vehicle: Maximum time per vehicle
            
        Returns:
            dict: Solution with routes and metrics
        """
        logger.info(f"Solving VRP with {num_vehicles} vehicles and {len(distance_matrix)} locations")
        
        # Create data model
        self.data = {}
        self.data['distance_matrix'] = distance_matrix.tolist()
        self.data['num_vehicles'] = num_vehicles
        self.data['depot'] = depot
        
        # Add capacities and demands if provided
        if vehicle_capacities and demands:
            self.data['vehicle_capacities'] = vehicle_capacities
            self.data['demands'] = demands
        
        # Add time matrix and windows if provided
        if time_matrix is not None:
            self.data['time_matrix'] = time_matrix.tolist()
            
        if time_windows:
            self.data['time_windows'] = time_windows
            
        if max_time_per_vehicle:
            self.data['max_time_per_vehicle'] = max_time_per_vehicle
        
        # Create the routing index manager
        self.manager = pywrapcp.RoutingIndexManager(
            len(self.data['distance_matrix']),
            self.data['num_vehicles'],
            self.data['depot']
        )
        
        # Create Routing Model
        self.routing = pywrapcp.RoutingModel(self.manager)
        
        # Register distance callback
        def distance_callback(from_index, to_index):
            from_node = self.manager.IndexToNode(from_index)
            to_node = self.manager.IndexToNode(to_index)
            return self.data['distance_matrix'][from_node][to_node]
        
        distance_callback_index = self.routing.RegisterTransitCallback(distance_callback)
        
        # Define cost of each arc
        self.routing.SetArcCostEvaluatorOfAllVehicles(distance_callback_index)
        
        # Add capacity constraints if provided
        if 'vehicle_capacities' in self.data and 'demands' in self.data:
            def demand_callback(from_index):
                from_node = self.manager.IndexToNode(from_index)
                return self.data['demands'][from_node]
            
            demand_callback_index = self.routing.RegisterUnaryTransitCallback(demand_callback)
            
            self.routing.AddDimensionWithVehicleCapacity(
                demand_callback_index,
                0,  # null capacity slack
                self.data['vehicle_capacities'],  # vehicle maximum capacities
                True,  # start cumul to zero
                'Capacity'
            )
        
        # Add time window constraints if provided
        if 'time_matrix' in self.data and 'time_windows' in self.data:
            def time_callback(from_index, to_index):
                from_node = self.manager.IndexToNode(from_index)
                to_node = self.manager.IndexToNode(to_index)
                return self.data['time_matrix'][from_node][to_node]
            
            time_callback_index = self.routing.RegisterTransitCallback(time_callback)
            
            self.routing.AddDimension(
                time_callback_index,
                30,  # allow waiting time
                86400,  # maximum time per vehicle (24 hours in seconds)
                False,  # don't force start cumul to zero
                'Time'
            )
            
            time_dimension = self.routing.GetDimensionOrDie('Time')
            
            # Add time window constraints for each location except depot
            for location_idx, time_window in enumerate(self.data['time_windows']):
                if location_idx == self.data['depot']:
                    continue
                index = self.manager.NodeToIndex(location_idx)
                time_dimension.CumulVar(index).SetRange(time_window[0], time_window[1])
            
            # Add time window constraints for depot
            depot_idx = self.manager.NodeToIndex(self.data['depot'])
            depot_time_window = self.data['time_windows'][self.data['depot']]
            time_dimension.CumulVar(depot_idx).SetRange(depot_time_window[0], depot_time_window[1])
            
            # Add max time constraints for vehicles if provided
            if 'max_time_per_vehicle' in self.data:
                for vehicle_id in range(self.data['num_vehicles']):
                    end_idx = self.routing.End(vehicle_id)
                    time_dimension.SetCumulVarSoftUpperBound(
                        end_idx, 
                        self.data['max_time_per_vehicle'][vehicle_id], 
                        1000  # penalty for exceeding max time
                    )
        
        # Set first solution heuristic
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_parameters.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        )
        search_parameters.time_limit.seconds = 30  # 30 seconds time limit
        
        # Solve the problem
        self.solution = self.routing.SolveWithParameters(search_parameters)
        
        # Return solution
        if self.solution:
            return self._get_solution()
        else:
            logger.error("No solution found for VRP")
            return {
                "status": "NO_SOLUTION",
                "routes": [],
                "total_distance": 0,
                "total_time": 0
            }
    
    def _get_solution(self) -> Dict[str, Any]:
        """
        Extract solution from the routing model
        
        Returns:
            dict: Solution with routes and metrics
        """
        routes = []
        total_distance = 0
        total_time = 0
        
        # Get time dimension if it exists
        time_dimension = None
        if 'time_matrix' in self.data:
            time_dimension = self.routing.GetDimensionOrDie('Time')
        
        # Get capacity dimension if it exists
        capacity_dimension = None
        if 'vehicle_capacities' in self.data:
            capacity_dimension = self.routing.GetDimensionOrDie('Capacity')
        
        # Extract routes
        for vehicle_id in range(self.data['num_vehicles']):
            index = self.routing.Start(vehicle_id)
            route = []
            route_distance = 0
            route_load = 0
            route_time = 0
            
            while not self.routing.IsEnd(index):
                node_index = self.manager.IndexToNode(index)
                route.append(node_index)
                
                # Add load if capacity constraints are used
                if capacity_dimension:
                    route_load += self.data['demands'][node_index]
                
                # Get time information if time constraints are used
                time_info = None
                if time_dimension:
                    time_var = time_dimension.CumulVar(index)
                    time_info = {
                        "earliest_arrival": self.solution.Min(time_var),
                        "latest_arrival": self.solution.Max(time_var)
                    }
                
                # Move to next location
                previous_index = index
                index = self.solution.Value(self.routing.NextVar(index))
                
                # Add distance
                route_distance += self.data['distance_matrix'][node_index][self.manager.IndexToNode(index)]
                
                # Add time
                if 'time_matrix' in self.data:
                    route_time += self.data['time_matrix'][node_index][self.manager.IndexToNode(index)]
            
            # Add depot at the end
            node_index = self.manager.IndexToNode(index)
            route.append(node_index)
            
            # Add route to routes list if it's not empty
            if len(route) > 2:  # More than just depot->depot
                routes.append({
                    "vehicle_id": vehicle_id,
                    "route": route,
                    "distance": route_distance,
                    "load": route_load if capacity_dimension else None,
                    "time": route_time if time_dimension else None
                })
                
                total_distance += route_distance
                total_time += route_time
        
        return {
            "status": "OK",
            "routes": routes,
            "total_distance": total_distance,
            "total_time": total_time
        }

def solve_vrp(
    locations: List[str],
    num_vehicles: int = 1,
    depot_index: int = 0,
    vehicle_capacities: Optional[List[int]] = None,
    demands: Optional[List[int]] = None,
    time_windows: Optional[List[Tuple[int, int]]] = None,
    max_time_per_vehicle: Optional[List[int]] = None
) -> Dict[str, Any]:
    """
    Solve a Vehicle Routing Problem
    
    Args:
        locations: List of location addresses or coordinates
        num_vehicles: Number of vehicles available
        depot_index: Index of the depot location
        vehicle_capacities: List of vehicle capacities
        demands: List of demands for each location
        time_windows: List of time windows for each location (start, end)
        max_time_per_vehicle: Maximum time per vehicle
        
    Returns:
        dict: Solution with routes and metrics
    """
    solver = VRPSolver()
    
    # Create distance and time matrices
    distance_matrix = solver.create_distance_matrix(locations)
    time_matrix = solver.create_time_matrix(locations)
    
    # Solve the VRP
    return solver.solve(
        distance_matrix=distance_matrix,
        num_vehicles=num_vehicles,
        depot=depot_index,
        vehicle_capacities=vehicle_capacities,
        demands=demands,
        time_matrix=time_matrix,
        time_windows=time_windows,
        max_time_per_vehicle=max_time_per_vehicle
    )
 