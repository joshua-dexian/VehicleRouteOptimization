import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';

// Route types
export interface RouteStop {
  id: string;
  address: string;
  type: "pickup" | "delivery";
  timeWindow: string;
  items: string[];
}

export interface Route {
  id: string;
  routeName: string;
  vehicleName: string;
  vehicleId: string;
  capacity: string;
  totalDistance: string;
  estimatedTime: string;
  departureTime: string;
  arrivalTime: string;
  from: string;
  to: string;
  stops: RouteStop[];
  color?: string;
  driverId?: string;
  driverName?: string;
}

interface RouteContextType {
  routes: Route[];
  setRoutes: Dispatch<SetStateAction<Route[]>>;
  selectedRoute: Route | null;
  setSelectedRoute: (route: Route | null) => void;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export function RouteProvider({ children }: { children: ReactNode }) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  return (
    <RouteContext.Provider value={{ routes, setRoutes, selectedRoute, setSelectedRoute }}>
      {children}
    </RouteContext.Provider>
  );
}

export function useRoutes() {
  const context = useContext(RouteContext);
  if (context === undefined) {
    throw new Error('useRoutes must be used within a RouteProvider');
  }
  return context;
} 