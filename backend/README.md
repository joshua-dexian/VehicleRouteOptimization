# Logistics API Backend

This is the Python FastAPI backend for the Logistics application.

## Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE log_db;
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python run.py
```

## API Documentation

Once the server is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/log_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=log_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

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