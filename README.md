# Logistics Management System

A full-stack application for logistics management with PostgreSQL database integration.

## Project Structure

- `frontend/`: React frontend built with Vite and TypeScript
- `backend/`: Python FastAPI backend with PostgreSQL database

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL database

### Running the Application

The easiest way to run the application is to use our all-in-one script:

```bash
python run_app.py
```

This will start both the backend and frontend servers and open the application in your default browser.

### Testing the Integration

To test if the backend API is working correctly:

```bash
cd backend
python test_integration.py
```

## Manual Setup Instructions

### Backend Setup

1. Install PostgreSQL and create a database:

```sql
CREATE DATABASE log_db;
```

2. Navigate to the backend directory:

```bash
cd backend
```

3. Install Python dependencies:

```bash
pip install -r requirements.txt
```

4. Run the backend server:

```bash
python run.py
```

The API will be available at http://localhost:8000.
API documentation: http://localhost:8000/docs

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

The frontend will be available at http://localhost:5173.

## Features

- CRUD operations for orders, vehicles, drivers, and depots
- Real-time data updates between frontend and backend
- RESTful API with FastAPI
- Modern UI with React and Tailwind CSS

## API Endpoints

### Orders
- `GET /orders` - List all orders
- `POST /orders` - Create a new order
- `GET /orders/{order_id}` - Get a specific order
- `PUT /orders/{order_id}` - Update an order
- `DELETE /orders/{order_id}` - Delete an order

### Vehicles
- `GET /vehicles` - List all vehicles
- `POST /vehicles` - Create a new vehicle
- `GET /vehicles/{vehicle_id}` - Get a specific vehicle
- `PUT /vehicles/{vehicle_id}` - Update a vehicle
- `DELETE /vehicles/{vehicle_id}` - Delete a vehicle

### Drivers
- `GET /drivers` - List all drivers
- `POST /drivers` - Create a new driver
- `GET /drivers/{driver_id}` - Get a specific driver
- `PUT /drivers/{driver_id}` - Update a driver
- `DELETE /drivers/{driver_id}` - Delete a driver

### Depots
- `GET /depots` - List all depots
- `POST /depots` - Create a new depot
- `GET /depots/{depot_id}` - Get a specific depot
- `PUT /depots/{depot_id}` - Update a depot
- `DELETE /depots/{depot_id}` - Delete a depot

## Troubleshooting

### Backend Connection Issues

If you see errors like "Failed to fetch" or "SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON":

1. Make sure the backend server is running on port 8000
2. Check if PostgreSQL is running and accessible
3. Run the integration test script to verify API functionality:
   ```bash
   cd backend
   python test_integration.py
   ```

### Frontend Issues

If the frontend is not displaying data:

1. Check browser console for errors
2. Verify that the API_URL in `frontend/src/services/api.ts` is set to `http://localhost:8000`
3. Make sure CORS is properly configured in the backend 