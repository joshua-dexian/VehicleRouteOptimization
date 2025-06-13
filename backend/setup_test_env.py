"""
Setup script to test the geocoding and VRP implementations.
This script will:
1. Check if the required packages are installed
2. Verify the Google Maps API key is set
3. Test the geocoding service
4. Test the distance matrix service
5. Test the VRP solver with a simple example
"""

import os
import sys
import logging
import json
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def check_packages():
    """Check if required packages are installed"""
    logger.info("Checking required packages...")
    
    required_packages = [
        "fastapi", "uvicorn", "sqlalchemy", "psycopg2-binary", "pydantic", 
        "python-dotenv", "ortools", "googlemaps", "geopy", "requests", "cachetools"
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            logger.info(f"✓ {package} is installed")
        except ImportError:
            logger.error(f"✗ {package} is not installed")
            missing_packages.append(package)
    
    if missing_packages:
        logger.error(f"Missing packages: {', '.join(missing_packages)}")
        logger.info("Install missing packages with: pip install " + " ".join(missing_packages))
        return False
    
    return True

def check_api_key():
    """Check if Google Maps API key is set"""
    logger.info("Checking Google Maps API key...")
    
    api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    
    if not api_key:
        logger.error("Google Maps API key not found in environment variables")
        logger.info("Set the API key in .env file or environment variables: GOOGLE_MAPS_API_KEY=your_api_key")
        return False
    
    logger.info("✓ Google Maps API key is set")
    return True

def test_geocoding():
    """Test the geocoding service"""
    logger.info("Testing geocoding service...")
    
    try:
        from app.services.geocoding import geocode_address
        
        test_address = "1600 Amphitheatre Parkway, Mountain View, CA"
        result = geocode_address(test_address)
        
        if result:
            logger.info(f"✓ Geocoding successful: {json.dumps(result, indent=2)}")
            return True
        else:
            logger.error("✗ Geocoding failed")
            return False
    except Exception as e:
        logger.error(f"Error testing geocoding: {str(e)}")
        return False

def test_distance_matrix():
    """Test the distance matrix service"""
    logger.info("Testing distance matrix service...")
    
    try:
        from app.services.distance_matrix import get_distance_matrix
        
        origins = ["San Francisco, CA"]
        destinations = ["Mountain View, CA", "Palo Alto, CA"]
        
        result = get_distance_matrix(origins, destinations)
        
        if result and result.get("status") == "OK":
            logger.info(f"✓ Distance matrix successful: {json.dumps(result, indent=2)}")
            return True
        else:
            logger.error(f"✗ Distance matrix failed: {result.get('error_message', 'Unknown error')}")
            return False
    except Exception as e:
        logger.error(f"Error testing distance matrix: {str(e)}")
        return False

def test_vrp_solver():
    """Test the VRP solver with a simple example"""
    logger.info("Testing VRP solver...")
    
    try:
        from app.services.vrp_solver import solve_vrp
        
        # Simple example with 3 locations
        locations = [
            "1600 Amphitheatre Parkway, Mountain View, CA",  # Google HQ (depot)
            "1 Infinite Loop, Cupertino, CA",                # Apple HQ
            "1 Hacker Way, Menlo Park, CA"                   # Meta HQ
        ]
        
        result = solve_vrp(
            locations=locations,
            num_vehicles=1,
            depot_index=0
        )
        
        if result and result.get("status") == "OK":
            logger.info(f"✓ VRP solver successful: {json.dumps(result, indent=2)}")
            return True
        else:
            logger.error(f"✗ VRP solver failed: {result.get('error_message', 'Unknown error')}")
            return False
    except Exception as e:
        logger.error(f"Error testing VRP solver: {str(e)}")
        return False

def main():
    """Main function"""
    logger.info("Starting setup test...")
    
    # Check packages
    if not check_packages():
        logger.error("Package check failed. Please install missing packages.")
        return
    
    # Check API key
    if not check_api_key():
        logger.error("API key check failed. Please set the Google Maps API key.")
        return
    
    # Add app directory to path
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    
    # Test geocoding
    if test_geocoding():
        # Test distance matrix
        if test_distance_matrix():
            # Test VRP solver
            test_vrp_solver()
    
    logger.info("Setup test completed.")

if __name__ == "__main__":
    main() 