// API service for the frontend

export const API_URL = 'http://localhost:8000';

// Generic fetch function with better error handling
async function fetchAPI<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Check if the response is not JSON (like HTML error page)
    const contentType = response.headers.get("content-type");
    if (contentType && !contentType.includes("application/json")) {
      console.error(`Received non-JSON response from ${url}:`, await response.text());
      throw new Error(`Server returned non-JSON response. Backend may not be running correctly.`);
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error occurred" }));
      throw new Error(errorData.detail || 'An error occurred');
    }
    
    // For DELETE requests that return no content
    if (response.status === 204) {
      return {} as T;
    }
    
    return await response.json() as T;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error(`Network error when connecting to ${url}. Is the backend server running?`);
      throw new Error(`Could not connect to server. Please ensure the backend is running at ${API_URL}`);
    }
    throw error;
  }
}

// Orders API
export interface Order {
  id?: number;
  address: string;
  order_number?: string;
  customer_name?: string;
  phone?: string;
  email?: string;
  notes?: string;
  start_time?: string;
  end_time?: string;
  duration?: string;
  load?: string;
  created_at?: string;
  updated_at?: string;
  lat?: number;
  lng?: number;
  place_id?: string;
}

export const ordersAPI = {
  getAll: () => fetchAPI<Order[]>('/orders'),
  getById: (id: number) => fetchAPI<Order>(`/orders/${id}`),
  create: (data: Order) => fetchAPI<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: Partial<Order>) => fetchAPI<Order>(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetchAPI<void>(`/orders/${id}`, {
    method: 'DELETE',
  }),
};

// Vehicles API
export interface Vehicle {
  id?: number;
  plate_number: string;
  type: string;
  capacity?: string;
  created_at?: string;
  updated_at?: string;
}

export const vehiclesAPI = {
  getAll: () => fetchAPI<Vehicle[]>('/vehicles'),
  getById: (id: number) => fetchAPI<Vehicle>(`/vehicles/${id}`),
  create: (data: Vehicle) => fetchAPI<Vehicle>('/vehicles', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: Partial<Vehicle>) => fetchAPI<Vehicle>(`/vehicles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetchAPI<void>(`/vehicles/${id}`, {
    method: 'DELETE',
  }),
};

// Drivers API
export interface Driver {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  license_number?: string;
  experience?: string;
  created_at?: string;
  updated_at?: string;
}

export const driversAPI = {
  getAll: () => fetchAPI<Driver[]>('/drivers'),
  getById: (id: number) => fetchAPI<Driver>(`/drivers/${id}`),
  create: (data: Driver) => fetchAPI<Driver>('/drivers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: Partial<Driver>) => fetchAPI<Driver>(`/drivers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetchAPI<void>(`/drivers/${id}`, {
    method: 'DELETE',
  }),
};

// Depots API
export interface Depot {
  id?: number;
  name: string;
  address: string;
  capacity?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  lat?: number;
  lng?: number;
  place_id?: string;
}

export const depotsAPI = {
  getAll: () => fetchAPI<Depot[]>('/depots'),
  getById: (id: number) => fetchAPI<Depot>(`/depots/${id}`),
  create: (data: Depot) => fetchAPI<Depot>('/depots', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: Partial<Depot>) => fetchAPI<Depot>(`/depots/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetchAPI<void>(`/depots/${id}`, {
    method: 'DELETE',
  }),
};

// Route History API
export interface RouteHistoryStop {
  id: string;
  address: string;
  type: "pickup" | "delivery";
  timeWindow: string;
  items: string[];
  calculatedArrivalTime?: string;
  calculatedStartTime?: string;
  calculatedTravelTime?: number;
}

export interface RouteHistory {
  id: string;
  routeName: string;
  vehicleName: string;
  vehicleId: string;
  driverId?: string;
  driverName?: string;
  totalDistance: string;
  estimatedTime: string;
  departureTime: string;
  arrivalTime: string;
  from: string;
  to: string;
  stops: RouteHistoryStop[];
  color?: string;
  date: string; // Date when the route was saved
  status: "completed" | "planned" | "in-progress";
}

// Use localStorage for persistence until backend is ready
export const routeHistoryAPI = {
  getAll: (): Promise<RouteHistory[]> => {
    return new Promise((resolve) => {
      const storedRoutes = localStorage.getItem('route_history');
      const routes = storedRoutes ? JSON.parse(storedRoutes) : [];
      resolve(routes);
    });
  },
  
  getById: (id: string): Promise<RouteHistory> => {
    return new Promise((resolve, reject) => {
      const storedRoutes = localStorage.getItem('route_history');
      const routes = storedRoutes ? JSON.parse(storedRoutes) : [];
      const route = routes.find((r: RouteHistory) => r.id === id);
      
      if (route) {
        resolve(route);
      } else {
        reject(new Error('Route not found'));
      }
    });
  },
  
  save: (route: RouteHistory): Promise<RouteHistory> => {
    return new Promise((resolve) => {
      const storedRoutes = localStorage.getItem('route_history');
      const routes = storedRoutes ? JSON.parse(storedRoutes) : [];
      
      // Check if route already exists
      const existingIndex = routes.findIndex((r: RouteHistory) => r.id === route.id);
      
      if (existingIndex >= 0) {
        // Update existing route
        routes[existingIndex] = route;
      } else {
        // Add new route with current date
        const newRoute = {
          ...route,
          date: new Date().toISOString(),
          status: "completed"
        };
        routes.push(newRoute);
      }
      
      localStorage.setItem('route_history', JSON.stringify(routes));
      resolve(route);
    });
  },
  
  delete: (id: string): Promise<void> => {
    return new Promise((resolve) => {
      const storedRoutes = localStorage.getItem('route_history');
      const routes = storedRoutes ? JSON.parse(storedRoutes) : [];
      
      const filteredRoutes = routes.filter((r: RouteHistory) => r.id !== id);
      localStorage.setItem('route_history', JSON.stringify(filteredRoutes));
      resolve();
    });
  }
}; 