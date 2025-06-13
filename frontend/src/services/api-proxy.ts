// API Proxy for geocoding and VRP services

import { API_URL } from './api';

// Geocoding API
export interface GeocodingRequest {
  address: string;
}

export interface PlaceAutocompleteRequest {
  input: string;
  session_token?: string;
}

export interface PlaceDetailsRequest {
  place_id: string;
  session_token?: string;
}

export interface GeocodingResponse {
  lat?: number;
  lng?: number;
  formatted_address?: string;
  status: string;
}

export interface PlaceAutocompleteResponse {
  predictions: Array<{
    place_id: string;
    description: string;
    structured_formatting?: {
      main_text: string;
      secondary_text: string;
    };
  }>;
  status: string;
}

export interface PlaceDetailsResponse {
  result?: {
    formatted_address: string;
    lat: number;
    lng: number;
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  };
  status: string;
}

// VRP API
export interface Location {
  address: string;
  lat?: number;
  lng?: number;
}

export interface TimeWindow {
  start: number; // seconds from midnight
  end: number;   // seconds from midnight
}

export interface VRPRequest {
  locations: Location[];
  num_vehicles: number;
  depot_index: number;
  vehicle_capacities?: number[];
  demands?: number[];
  time_windows?: TimeWindow[];
  max_time_per_vehicle?: number[];
}

export interface RouteStop {
  location_index: number;
  address: string;
}

export interface Route {
  vehicle_id: number;
  stops: RouteStop[];
  distance: number;
  time?: number;
  load?: number;
}

export interface VRPResponse {
  status: string;
  routes: Route[];
  total_distance: number;
  total_time: number;
  message?: string;
}

// Generic fetch function with error handling
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error);
    throw error;
  }
}

// Geocoding API
export const geocodingAPI = {
  geocode: (data: GeocodingRequest) => 
    fetchAPI<GeocodingResponse>('/geocoding/geocode', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  autocomplete: (data: PlaceAutocompleteRequest) => 
    fetchAPI<PlaceAutocompleteResponse>('/geocoding/autocomplete', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  placeDetails: (data: PlaceDetailsRequest) => 
    fetchAPI<PlaceDetailsResponse>('/geocoding/place-details', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// VRP API
export const vrpAPI = {
  solve: (data: VRPRequest) => 
    fetchAPI<VRPResponse>('/vrp/solve', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}; 