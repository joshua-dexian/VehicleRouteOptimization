"""
Integration Test Script for Logistics Application

This script tests the API endpoints to ensure they're working correctly.
Run this script after starting the backend server to verify functionality.
"""

import requests
import json
import sys
from time import sleep

# Configuration
API_URL = "http://localhost:8000"
HEADERS = {"Content-Type": "application/json"}

def print_success(message):
    print(f"\033[92m✓ {message}\033[0m")

def print_error(message):
    print(f"\033[91m✗ {message}\033[0m")

def print_info(message):
    print(f"\033[94m• {message}\033[0m")

def test_health_check():
    """Test the health check endpoint."""
    try:
        response = requests.get(f"{API_URL}/health")
        if response.status_code == 200 and response.json().get("status") == "healthy":
            print_success("Health check endpoint is working")
            return True
        else:
            print_error(f"Health check failed: {response.status_code} - {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print_error(f"Connection error: {e}")
        return False

def test_depots_crud():
    """Test CRUD operations for depots."""
    print_info("Testing Depot CRUD operations...")
    
    # Create a depot
    depot_data = {
        "name": "Test Depot",
        "address": "123 Test Street",
        "capacity": "500 tons"
    }
    
    try:
        # Create
        response = requests.post(f"{API_URL}/depots", json=depot_data, headers=HEADERS)
        if response.status_code != 201:
            print_error(f"Failed to create depot: {response.status_code} - {response.text}")
            return False
        
        depot_id = response.json().get("id")
        print_success(f"Created depot with ID: {depot_id}")
        
        # Read
        response = requests.get(f"{API_URL}/depots/{depot_id}")
        if response.status_code != 200:
            print_error(f"Failed to get depot: {response.status_code} - {response.text}")
            return False
        print_success("Retrieved depot successfully")
        
        # Update
        update_data = {"name": "Updated Test Depot"}
        response = requests.put(f"{API_URL}/depots/{depot_id}", json=update_data, headers=HEADERS)
        if response.status_code != 200:
            print_error(f"Failed to update depot: {response.status_code} - {response.text}")
            return False
        print_success("Updated depot successfully")
        
        # List all
        response = requests.get(f"{API_URL}/depots")
        if response.status_code != 200:
            print_error(f"Failed to list depots: {response.status_code} - {response.text}")
            return False
        print_success(f"Listed {len(response.json())} depots successfully")
        
        # Delete
        response = requests.delete(f"{API_URL}/depots/{depot_id}")
        if response.status_code != 204:
            print_error(f"Failed to delete depot: {response.status_code} - {response.text}")
            return False
        print_success("Deleted depot successfully")
        
        return True
    except requests.exceptions.RequestException as e:
        print_error(f"Connection error during depot tests: {e}")
        return False

def test_orders_crud():
    """Test CRUD operations for orders."""
    print_info("Testing Order CRUD operations...")
    
    # Create an order
    order_data = {
        "address": "456 Test Avenue",
        "order_number": "TEST-001",
        "customer_name": "Test Customer",
        "phone": "555-1234",
        "email": "test@example.com",
        "notes": "Test order"
    }
    
    try:
        # Create
        response = requests.post(f"{API_URL}/orders", json=order_data, headers=HEADERS)
        if response.status_code != 201:
            print_error(f"Failed to create order: {response.status_code} - {response.text}")
            return False
        
        order_id = response.json().get("id")
        print_success(f"Created order with ID: {order_id}")
        
        # Read
        response = requests.get(f"{API_URL}/orders/{order_id}")
        if response.status_code != 200:
            print_error(f"Failed to get order: {response.status_code} - {response.text}")
            return False
        print_success("Retrieved order successfully")
        
        # Update
        update_data = {"customer_name": "Updated Test Customer"}
        response = requests.put(f"{API_URL}/orders/{order_id}", json=update_data, headers=HEADERS)
        if response.status_code != 200:
            print_error(f"Failed to update order: {response.status_code} - {response.text}")
            return False
        print_success("Updated order successfully")
        
        # List all
        response = requests.get(f"{API_URL}/orders")
        if response.status_code != 200:
            print_error(f"Failed to list orders: {response.status_code} - {response.text}")
            return False
        print_success(f"Listed {len(response.json())} orders successfully")
        
        # Delete
        response = requests.delete(f"{API_URL}/orders/{order_id}")
        if response.status_code != 204:
            print_error(f"Failed to delete order: {response.status_code} - {response.text}")
            return False
        print_success("Deleted order successfully")
        
        return True
    except requests.exceptions.RequestException as e:
        print_error(f"Connection error during order tests: {e}")
        return False

def test_vehicles_crud():
    """Test CRUD operations for vehicles."""
    print_info("Testing Vehicle CRUD operations...")
    
    # Create a vehicle
    vehicle_data = {
        "plate_number": "TEST-123",
        "type": "Truck",
        "capacity": "10 tons"
    }
    
    try:
        # Create
        response = requests.post(f"{API_URL}/vehicles", json=vehicle_data, headers=HEADERS)
        if response.status_code != 201:
            print_error(f"Failed to create vehicle: {response.status_code} - {response.text}")
            return False
        
        vehicle_id = response.json().get("id")
        print_success(f"Created vehicle with ID: {vehicle_id}")
        
        # Read
        response = requests.get(f"{API_URL}/vehicles/{vehicle_id}")
        if response.status_code != 200:
            print_error(f"Failed to get vehicle: {response.status_code} - {response.text}")
            return False
        print_success("Retrieved vehicle successfully")
        
        # Update
        update_data = {"capacity": "12 tons"}
        response = requests.put(f"{API_URL}/vehicles/{vehicle_id}", json=update_data, headers=HEADERS)
        if response.status_code != 200:
            print_error(f"Failed to update vehicle: {response.status_code} - {response.text}")
            return False
        print_success("Updated vehicle successfully")
        
        # List all
        response = requests.get(f"{API_URL}/vehicles")
        if response.status_code != 200:
            print_error(f"Failed to list vehicles: {response.status_code} - {response.text}")
            return False
        print_success(f"Listed {len(response.json())} vehicles successfully")
        
        # Delete
        response = requests.delete(f"{API_URL}/vehicles/{vehicle_id}")
        if response.status_code != 204:
            print_error(f"Failed to delete vehicle: {response.status_code} - {response.text}")
            return False
        print_success("Deleted vehicle successfully")
        
        return True
    except requests.exceptions.RequestException as e:
        print_error(f"Connection error during vehicle tests: {e}")
        return False

def test_drivers_crud():
    """Test CRUD operations for drivers."""
    print_info("Testing Driver CRUD operations...")
    
    # Create a driver
    driver_data = {
        "name": "Test Driver",
        "email": "driver@example.com",
        "phone": "555-5678",
        "license_number": "DL-123456",
        "experience": "5 years"
    }
    
    try:
        # Create
        response = requests.post(f"{API_URL}/drivers", json=driver_data, headers=HEADERS)
        if response.status_code != 201:
            print_error(f"Failed to create driver: {response.status_code} - {response.text}")
            return False
        
        driver_id = response.json().get("id")
        print_success(f"Created driver with ID: {driver_id}")
        
        # Read
        response = requests.get(f"{API_URL}/drivers/{driver_id}")
        if response.status_code != 200:
            print_error(f"Failed to get driver: {response.status_code} - {response.text}")
            return False
        print_success("Retrieved driver successfully")
        
        # Update
        update_data = {"experience": "6 years"}
        response = requests.put(f"{API_URL}/drivers/{driver_id}", json=update_data, headers=HEADERS)
        if response.status_code != 200:
            print_error(f"Failed to update driver: {response.status_code} - {response.text}")
            return False
        print_success("Updated driver successfully")
        
        # List all
        response = requests.get(f"{API_URL}/drivers")
        if response.status_code != 200:
            print_error(f"Failed to list drivers: {response.status_code} - {response.text}")
            return False
        print_success(f"Listed {len(response.json())} drivers successfully")
        
        # Delete
        response = requests.delete(f"{API_URL}/drivers/{driver_id}")
        if response.status_code != 204:
            print_error(f"Failed to delete driver: {response.status_code} - {response.text}")
            return False
        print_success("Deleted driver successfully")
        
        return True
    except requests.exceptions.RequestException as e:
        print_error(f"Connection error during driver tests: {e}")
        return False

def main():
    print_info("Starting integration tests...")
    print_info(f"Testing API at {API_URL}")
    
    # Test health check
    if not test_health_check():
        print_error("Health check failed. Is the server running?")
        sys.exit(1)
    
    # Test depots
    if not test_depots_crud():
        print_error("Depot tests failed")
        sys.exit(1)
    
    # Test orders
    if not test_orders_crud():
        print_error("Order tests failed")
        sys.exit(1)
    
    # Test vehicles
    if not test_vehicles_crud():
        print_error("Vehicle tests failed")
        sys.exit(1)
    
    # Test drivers
    if not test_drivers_crud():
        print_error("Driver tests failed")
        sys.exit(1)
    
    print_success("All integration tests passed!")

if __name__ == "__main__":
    main() 