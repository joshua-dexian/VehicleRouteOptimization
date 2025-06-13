import googlemaps
from cachetools import TTLCache, cached
from functools import lru_cache
import hashlib
import json
from typing import List, Dict, Any, Tuple, Optional
from ..config import settings
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Initialize Google Maps client
gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY) if settings.GOOGLE_MAPS_API_KEY else None

# Create cache for distance matrix results
distance_matrix_cache = TTLCache(
    maxsize=settings.DISTANCE_MATRIX_CACHE_SIZE, 
    ttl=settings.DISTANCE_MATRIX_CACHE_TTL
)

def _generate_cache_key(origins, destinations, **kwargs) -> str:
    """
    Generate a cache key for the distance matrix request
    
    Args:
        origins: List of origin addresses or coordinates
        destinations: List of destination addresses or coordinates
        kwargs: Additional parameters for the distance matrix request
        
    Returns:
        str: Cache key
    """
    # Create a string representation of the request
    key_dict = {
        'origins': sorted(origins) if isinstance(origins, list) else origins,
        'destinations': sorted(destinations) if isinstance(destinations, list) else destinations,
        **kwargs
    }
    
    # Convert to a stable JSON string and hash it
    key_str = json.dumps(key_dict, sort_keys=True)
    return hashlib.md5(key_str.encode()).hexdigest()

def get_distance_matrix(
    origins: List[str],
    destinations: List[str],
    mode: str = "driving",
    avoid: Optional[List[str]] = None,
    units: str = "metric",
    departure_time = "now",
    traffic_model: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get distance and duration between multiple origins and destinations
    
    Args:
        origins: List of origin addresses or coordinates
        destinations: List of destination addresses or coordinates
        mode: Travel mode (driving, walking, bicycling, transit)
        avoid: Features to avoid (tolls, highways, ferries)
        units: Unit system (metric, imperial)
        departure_time: Time of departure
        traffic_model: Traffic model for estimating duration in traffic
        
    Returns:
        dict: Distance matrix response
    """
    if not gmaps:
        logger.error("Google Maps API key not configured")
        return {
            "status": "ERROR",
            "error_message": "Google Maps API key not configured"
        }
    
    # Generate cache key
    cache_key = _generate_cache_key(
        origins, 
        destinations, 
        mode=mode, 
        avoid=avoid, 
        units=units,
        departure_time=departure_time,
        traffic_model=traffic_model
    )
    
    # Check cache
    if cache_key in distance_matrix_cache:
        logger.info("Distance matrix cache hit")
        return distance_matrix_cache[cache_key]
    
    try:
        logger.info(f"Getting distance matrix for {len(origins)} origins and {len(destinations)} destinations")
        
        # Build request parameters
        params = {
            "origins": origins,
            "destinations": destinations,
            "mode": mode,
            "units": units,
        }
        
        if avoid:
            params["avoid"] = "|".join(avoid)
            
        if departure_time:
            params["departure_time"] = departure_time
            
        if traffic_model and departure_time:
            params["traffic_model"] = traffic_model
        
        # Make API request
        result = gmaps.distance_matrix(**params)
        
        # Cache result
        if result.get("status") == "OK":
            distance_matrix_cache[cache_key] = result
        
        return result
    except Exception as e:
        logger.error(f"Error getting distance matrix: {str(e)}")
        return {
            "status": "ERROR",
            "error_message": str(e)
        }

def extract_distance_duration(matrix_result: Dict[str, Any], origin_idx: int, dest_idx: int) -> Dict[str, Any]:
    """
    Extract distance and duration from a distance matrix result for a specific origin-destination pair
    
    Args:
        matrix_result: Distance matrix result from Google Maps API
        origin_idx: Index of the origin in the matrix
        dest_idx: Index of the destination in the matrix
        
    Returns:
        dict: Dictionary with distance and duration information
    """
    try:
        if matrix_result.get("status") != "OK":
            return {
                "status": matrix_result.get("status"),
                "error_message": matrix_result.get("error_message", "Unknown error")
            }
        
        row = matrix_result.get("rows", [])[origin_idx]
        element = row.get("elements", [])[dest_idx]
        
        if element.get("status") != "OK":
            return {
                "status": element.get("status"),
                "error_message": element.get("error_message", "Unknown error")
            }
        
        return {
            "status": "OK",
            "distance": element.get("distance", {}),
            "duration": element.get("duration", {}),
            "duration_in_traffic": element.get("duration_in_traffic", {})
        }
    except (IndexError, KeyError) as e:
        logger.error(f"Error extracting distance/duration: {str(e)}")
        return {
            "status": "ERROR",
            "error_message": f"Error extracting data: {str(e)}"
        }

def batch_distance_matrix(
    locations: List[str],
    max_elements: int = 100
) -> Dict[str, Any]:
    """
    Calculate distances between all locations in a batch-efficient way
    
    Args:
        locations: List of location addresses or coordinates
        max_elements: Maximum number of elements per request (Google Maps limit)
        
    Returns:
        dict: Full distance matrix between all locations
    """
    n = len(locations)
    
    # Initialize result matrix
    result_matrix = {
        "status": "OK",
        "origin_addresses": locations.copy(),
        "destination_addresses": locations.copy(),
        "rows": [{
            "elements": [{"status": "NOT_CALCULATED"} for _ in range(n)]
        } for _ in range(n)]
    }
    
    # Calculate how many locations we can process per batch
    # Each batch will have origins × destinations elements
    locations_per_batch = int(max_elements ** 0.5)
    
    try:
        # Process in batches
        for i in range(0, n, locations_per_batch):
            origins_batch = locations[i:i + locations_per_batch]
            
            for j in range(0, n, locations_per_batch):
                destinations_batch = locations[j:j + locations_per_batch]
                
                # Skip if origins and destinations are the same (we already know distance is 0)
                if i == j:
                    for k in range(len(origins_batch)):
                        result_matrix["rows"][i + k]["elements"][j + k] = {
                            "status": "OK",
                            "distance": {"value": 0, "text": "0 m"},
                            "duration": {"value": 0, "text": "0 mins"}
                        }
                    continue
                
                # Get distance matrix for this batch
                batch_result = get_distance_matrix(origins_batch, destinations_batch)
                
                if batch_result.get("status") != "OK":
                    logger.error(f"Error in batch distance matrix: {batch_result.get('error_message')}")
                    continue
                
                # Merge batch result into full matrix
                for k, row in enumerate(batch_result.get("rows", [])):
                    for l, element in enumerate(row.get("elements", [])):
                        result_matrix["rows"][i + k]["elements"][j + l] = element
        
        return result_matrix
    except Exception as e:
        logger.error(f"Error in batch distance matrix: {str(e)}")
        return {
            "status": "ERROR",
            "error_message": str(e)
        } 