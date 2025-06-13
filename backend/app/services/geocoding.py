import googlemaps
from cachetools import TTLCache, cached
from functools import lru_cache
from ..config import settings
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Initialize Google Maps client
gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY) if settings.GOOGLE_MAPS_API_KEY else None

# Create cache for geocoding results
geocoding_cache = TTLCache(maxsize=settings.GEOCODING_CACHE_SIZE, ttl=settings.GEOCODING_CACHE_TTL)

@cached(cache=geocoding_cache)
def geocode_address(address: str):
    """
    Convert an address string to latitude and longitude coordinates using Google Maps API.
    Results are cached to reduce API calls.
    
    Args:
        address: String address to geocode
        
    Returns:
        dict: Dictionary with lat, lng keys or None if geocoding failed
    """
    if not address:
        return None
    
    if not gmaps:
        logger.error("Google Maps API key not configured")
        return None
    
    try:
        logger.info(f"Geocoding address: {address}")
        geocode_result = gmaps.geocode(address)
        
        if geocode_result and len(geocode_result) > 0:
            location = geocode_result[0]['geometry']['location']
            formatted_address = geocode_result[0]['formatted_address']
            
            return {
                'lat': location['lat'],
                'lng': location['lng'],
                'formatted_address': formatted_address
            }
        else:
            logger.warning(f"No geocoding results for address: {address}")
            return None
            
    except Exception as e:
        logger.error(f"Error geocoding address: {str(e)}")
        return None

def get_place_autocomplete(input_text: str, session_token: str = None):
    """
    Get place autocomplete suggestions from Google Maps API
    
    Args:
        input_text: Text input to get suggestions for
        session_token: Session token for grouping autocomplete requests
        
    Returns:
        list: List of autocomplete suggestions
    """
    if not gmaps:
        logger.error("Google Maps API key not configured")
        return []
    
    try:
        results = gmaps.places_autocomplete(
            input_text=input_text,
            session_token=session_token,
            types="address"
        )
        
        suggestions = []
        for result in results:
            suggestions.append({
                'place_id': result.get('place_id'),
                'description': result.get('description'),
                'structured_formatting': result.get('structured_formatting')
            })
            
        return suggestions
    except Exception as e:
        logger.error(f"Error getting place autocomplete: {str(e)}")
        return []

def get_place_details(place_id: str, session_token: str = None):
    """
    Get detailed information about a place using its place_id
    
    Args:
        place_id: The place ID from Google Maps
        session_token: Session token for grouping place requests
        
    Returns:
        dict: Place details including address components and geometry
    """
    if not gmaps:
        logger.error("Google Maps API key not configured")
        return None
    
    try:
        result = gmaps.place(
            place_id=place_id,
            session_token=session_token,
            fields=['address_component', 'geometry', 'formatted_address']
        )
        
        if result and 'result' in result:
            place_data = result['result']
            return {
                'formatted_address': place_data.get('formatted_address'),
                'lat': place_data.get('geometry', {}).get('location', {}).get('lat'),
                'lng': place_data.get('geometry', {}).get('location', {}).get('lng'),
                'address_components': place_data.get('address_components', [])
            }
        return None
    except Exception as e:
        logger.error(f"Error getting place details: {str(e)}")
        return None 