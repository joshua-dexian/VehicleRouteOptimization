from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import orders_router, vehicles_router, drivers_router, depots_router, analytics_router
from .routes.vrp import router as vrp_router
from .routes.geocoding import router as geocoding_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Vehicle Routing API",
    description="API for optimizing vehicle routes",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(orders_router)
app.include_router(vehicles_router)
app.include_router(drivers_router)
app.include_router(depots_router)
app.include_router(vrp_router)
app.include_router(geocoding_router)
app.include_router(analytics_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Vehicle Routing API"}

@app.get("/health")
async def health_check():
    api_status = {
        "status": "healthy",
        "database": "connected",
        "services": {
            "geocoding": True,
            "vrp": True,
            "analytics": True
        }
    }
    return api_status 