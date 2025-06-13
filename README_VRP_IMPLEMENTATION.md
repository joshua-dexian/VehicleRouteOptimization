# Vehicle Routing Problem (VRP) Implementation

This document provides instructions for setting up and testing the Vehicle Routing Problem (VRP) implementation with Google OR-Tools and Google Maps API integration.

## Overview

The implementation includes:

1. **Geocoding Service**: Converts addresses to coordinates and provides address autocomplete
2. **Distance Matrix Service**: Calculates travel times and distances between locations
3. **VRP Solver**: Optimizes routes using Google OR-Tools
4. **Frontend Integration**: Address autocomplete in forms and route visualization

## Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL database
- Google Maps API key with the following APIs enabled:
  - Geocoding API
  - Places API
  - Distance Matrix API

## Setup Instructions

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

Create a `.env` file in the backend directory:

```
DATABASE_URL=postgresql://postgres:admin@localhost:5432/log_db
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

Replace `your_google_maps_api_key_here` with your actual Google Maps API key.

### 3. Test the Implementation

Run the setup test script to verify that everything is working correctly:

```bash
cd backend
python setup_test_env.py
```

This script will:
- Check if all required packages are installed
- Verify that the Google Maps API key is set
- Test the geocoding service
- Test the distance matrix service
- Test the VRP solver with a simple example

### 4. Start the Backend Server

```bash
cd backend
python run.py
```

The backend server will be available at http://localhost:8000.

### 5. Start the Frontend Server

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:8080.

## Testing the Features

### Address Autocomplete

1. Go to the frontend application
2. Navigate to "Orders" page
3. Click "Add Order"
4. Start typing an address in the address field
5. You should see address suggestions appear as you type

### VRP Solver

1. Go to the "Routes" page
2. Add some orders with valid addresses
3. Add at least one depot with a valid address
4. Click "Plan Routes"
5. Select a depot, vehicles, and orders
6. Click "Generate Routes"
7. The system should calculate optimized routes and display them

## API Endpoints

### Geocoding API

- `POST /geocoding/geocode`: Convert an address to coordinates
- `POST /geocoding/autocomplete`: Get address suggestions as you type
- `POST /geocoding/place-details`: Get detailed information about a place

### VRP API

- `POST /vrp/solve`: Solve a Vehicle Routing Problem

## Troubleshooting

### API Key Issues

If you encounter errors related to the Google Maps API key:
- Verify that the key is correctly set in the `.env` file
- Ensure that the required APIs are enabled for your key
- Check for any usage limits or restrictions on your Google Cloud account

### Backend Connection Issues

If the frontend can't connect to the backend:
- Ensure the backend server is running
- Check that the API URL in the frontend is correct
- Verify that CORS is properly configured

### VRP Solver Issues

If the VRP solver is not working correctly:
- Check the logs for any error messages
- Verify that the addresses are being geocoded correctly
- Ensure that the distance matrix is being calculated correctly

## Next Steps

- Implement caching for geocoding and distance matrix results to reduce API calls
- Add more constraints to the VRP solver (time windows, vehicle capacities, etc.)
- Improve the route visualization with actual maps and turn-by-turn directions
- Add traffic information to the distance matrix calculations 