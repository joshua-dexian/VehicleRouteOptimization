from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
import logging

# Import services
try:
    from ..services.geocoding import geocode_address, get_place_autocomplete, get_place_details
except ImportError:
    # Mock implementations if services are not available
    logging.warning("Geocoding services not available, using mock implementations")
    
    def geocode_address(address):
        return {"lat": 0, "lng": 0, "formatted_address": address}
    
    def get_place_autocomplete(input_text, session_token=None):
        return [{"description": f"Mock result for {input_text}", "place_id": "mock_place_id"}]
    
    def get_place_details(place_id, session_token=None):
        return {"formatted_address": "Mock Address", "lat": 0, "lng": 0}

# Models
class GeocodingRequest(BaseModel):
    address: str

class PlaceAutocompleteRequest(BaseModel):
    input: str
    session_token: Optional[str] = None

class PlaceDetailsRequest(BaseModel):
    place_id: str
    session_token: Optional[str] = None

class GeocodingResponse(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    formatted_address: Optional[str] = None
    status: str

class PlaceAutocompleteResponse(BaseModel):
    predictions: List[dict]
    status: str

class PlaceDetailsResponse(BaseModel):
    result: Optional[dict] = None
    status: str

# Router
router = APIRouter(
    prefix="/geocoding",
    tags=["geocoding"],
    responses={404: {"description": "Not found"}},
)

@router.post("/geocode", response_model=GeocodingResponse)
async def geocode(request: GeocodingRequest):
    """
    Geocode an address to get latitude and longitude coordinates
    """
    result = geocode_address(request.address)
    
    if result:
        return {
            "lat": result.get("lat"),
            "lng": result.get("lng"),
            "formatted_address": result.get("formatted_address"),
            "status": "OK"
        }
    else:
        return {
            "lat": None,
            "lng": None,
            "formatted_address": None,
            "status": "NOT_FOUND"
        }

@router.post("/autocomplete", response_model=PlaceAutocompleteResponse)
async def autocomplete(request: PlaceAutocompleteRequest):
    """
    Get place autocomplete suggestions for an address
    """
    results = get_place_autocomplete(request.input, request.session_token)
    
    return {
        "predictions": results,
        "status": "OK" if results else "ZERO_RESULTS"
    }

@router.post("/place-details", response_model=PlaceDetailsResponse)
async def place_details(request: PlaceDetailsRequest):
    """
    Get detailed information about a place using its place_id
    """
    result = get_place_details(request.place_id, request.session_token)
    
    if result:
        return {
            "result": result,
            "status": "OK"
        }
    else:
        return {
            "result": None,
            "status": "NOT_FOUND"
        }

# Export router
geocoding_router = router 