import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Route, RouteStop } from '@/contexts/RouteContext';
import { Depot } from '@/services/api';

interface GoogleMapProps {
  selectedRoute: Route | null;
  allRoutes?: Route[];
  showAllRoutes?: boolean;
  depots?: Depot[];
  className?: string;
  onRouteUpdate?: (routeId: string, distance: string, duration: string) => void;
}

// Default colors for routes if not specified
const DEFAULT_COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#F44336'];

export function GoogleMap({ 
  selectedRoute, 
  allRoutes = [], 
  showAllRoutes = false,
  depots = [],
  className = 'h-full w-full', 
  onRouteUpdate 
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderers, setDirectionsRenderers] = useState<google.maps.DirectionsRenderer[]>([]);
  const [depotMarkers, setDepotMarkers] = useState<google.maps.Marker[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [routeDetails, setRouteDetails] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  
  // Store the route IDs to prevent unnecessary re-renders
  const routeIdsRef = useRef<string[]>([]);
  const lastDistanceRef = useRef<string | null>(null);
  const lastDurationRef = useRef<string | null>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        const apiKey = 'AIzaSyAvzZE-wEwLs6QRBr17LsbpKRfGBWrgQMc'; // Hardcoded for demo purposes
        
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places']
        });

        const google = await loader.load();
        
        if (!mapRef.current) return;

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 13.0827, lng: 80.2707 }, // Chennai coordinates
          zoom: 10,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          zoomControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            },
            {
              featureType: "administrative.land_parcel",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            },
            {
              featureType: "transit",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        setMap(mapInstance);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load Google Maps. Please check your API key.');
      }
    };

    initMap();

    return () => {
      // Cleanup all renderers
      directionsRenderers.forEach(renderer => {
        if (renderer) renderer.setMap(null);
      });
      
      // Cleanup all markers
      depotMarkers.forEach(marker => {
        if (marker) marker.setMap(null);
      });
    };
  }, []);

  // Display a single route or all routes based on props
  useEffect(() => {
    if (!map) return;
    
    const displayRoutes = async () => {
      // Get the routes to display
      let routesToDisplay: Route[] = [];
      
      if (showAllRoutes && allRoutes.length > 0) {
        routesToDisplay = allRoutes;
      } else if (selectedRoute) {
        routesToDisplay = [selectedRoute];
      }
      
      if (routesToDisplay.length === 0) return;
      
      // Check if we're displaying the same routes as before
      const routeIds = routesToDisplay.map(r => r.id).sort().join(',');
      const sameRoutes = routeIds === routeIdsRef.current.sort().join(',');
      
      if (sameRoutes && directionsRenderers.length > 0) {
        // No need to redisplay if showing the same routes
        return;
      }
      
      // Store the new route IDs
      routeIdsRef.current = routesToDisplay.map(r => r.id);
      
      // Clear all existing renderers
      directionsRenderers.forEach(renderer => {
        if (renderer) renderer.setMap(null);
      });
      
      // Reset the renderers array
      setDirectionsRenderers([]);
      
      // Display each route
      const newRenderers: google.maps.DirectionsRenderer[] = [];
      
      for (const route of routesToDisplay) {
        try {
          if (!window.google || !window.google.maps) continue;
          
          // Create new renderer for this route
          const directionsRenderer = new window.google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: false,
            preserveViewport: true // Preserve viewport to prevent zooming in/out
          });
          
          const directionsService = new window.google.maps.DirectionsService();
          
          // Get all stops including depot
          const stops = route.stops;
          
          // Create waypoints (excluding first and last stop)
          const waypoints = stops.slice(1, stops.length - 1).map(stop => ({
            location: stop.address,
            stopover: true
          }));
          
          // First stop is origin, last stop is destination
          const origin = stops[0].address;
          const destination = stops[stops.length - 1].address;
          
          // Set route color based on the route's color property or use default
          const routeIndex = parseInt(route.id.split('-')[1]) - 1;
          const routeColor = route.color || DEFAULT_COLORS[routeIndex % DEFAULT_COLORS.length];
          
          // Apply the route color to the direction renderer
          directionsRenderer.setOptions({
            polylineOptions: {
              strokeColor: routeColor,
              strokeWeight: 5,
              strokeOpacity: 0.8
            }
          });
          
          const request: google.maps.DirectionsRequest = {
            origin,
            destination,
            waypoints,
            optimizeWaypoints: false,
            travelMode: google.maps.TravelMode.DRIVING
          };
          
          // Use promise to handle route request
          const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
            directionsService.route(request, (result, status) => {
              if (status === google.maps.DirectionsStatus.OK && result) {
                resolve(result);
              } else {
                reject(new Error(`Directions request failed: ${status}`));
              }
            });
          });
          
          directionsRenderer.setDirections(result);
          newRenderers.push(directionsRenderer);
          
          // Extract and update the actual distance and duration
          let totalDistance = 0;
          let totalDuration = 0;
          
          if (result.routes && result.routes.length > 0) {
            const resultRoute = result.routes[0];
            
            if (resultRoute.legs) {
              resultRoute.legs.forEach(leg => {
                if (leg.distance) totalDistance += leg.distance.value;
                if (leg.duration) totalDuration += leg.duration.value;
              });
            }
            
            // Convert to km and hours/minutes
            const distanceInKm = Math.round(totalDistance / 100) / 10; // Convert meters to km
            const hours = Math.floor(totalDuration / 3600);
            const minutes = Math.floor((totalDuration % 3600) / 60);
            
            const formattedDuration = hours > 0 
              ? `${hours}h ${minutes}m` 
              : `${minutes}m`;
              
            const formattedDistance = `${distanceInKm} km`;
            
            // Call the onRouteUpdate callback if provided
            if (onRouteUpdate) {
              onRouteUpdate(route.id, formattedDistance, formattedDuration);
            }
          }
        } catch (err) {
          console.error('Error displaying route:', err);
          setError('Failed to display route');
        }
      }
      
      // Only update state if we have new renderers
      if (newRenderers.length > 0) {
        setDirectionsRenderers(newRenderers);
      }
    };
    
    // Use a timeout to prevent too frequent updates
    const timeoutId = setTimeout(displayRoutes, 100);
    return () => clearTimeout(timeoutId);
  }, [map, selectedRoute, allRoutes, showAllRoutes, onRouteUpdate]);

  // Display depot markers on the map
  useEffect(() => {
    if (!map || !window.google || !window.google.maps) return;
    
    // Clear existing depot markers
    depotMarkers.forEach(marker => marker.setMap(null));
    
    console.log("GoogleMap - Displaying depots:", depots);
    
    if (depots.length === 0) {
      console.log("GoogleMap - No depots to display");
      return;
    }
    
    const newMarkers: google.maps.Marker[] = [];
    const bounds = new window.google.maps.LatLngBounds();
    let hasValidCoordinates = false;
    let geocodingInProgress = false;
    
    // First pass: add all depots with known coordinates
    depots.forEach((depot) => {
      if (depot.lat && depot.lng) {
        const position = new window.google.maps.LatLng(depot.lat, depot.lng);
        console.log(`Creating marker for ${depot.name} at position:`, depot.lat, depot.lng);
        bounds.extend(position);
        hasValidCoordinates = true;
        
        // Create custom SVG marker for better visibility
        const isActive = depot.status === 'Active' || depot.status === 'active';
        const svgMarker = {
          path: 'M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z M12,11.5c-1.38,0-2.5-1.12-2.5-2.5s1.12-2.5,2.5-2.5s2.5,1.12,2.5,2.5S13.38,11.5,12,11.5z',
          fillColor: isActive ? '#22c55e' : '#f59e0b',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          rotation: 0,
          scale: 2,
          anchor: new window.google.maps.Point(12, 22),
          labelOrigin: new window.google.maps.Point(12, 9)
        };
        
        const marker = new window.google.maps.Marker({
          position,
          map,
          title: depot.name,
          icon: svgMarker,
          animation: window.google.maps.Animation.DROP,
          label: {
            text: depot.name.charAt(0),
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: 'bold'
          }
        });
        
        // Add info window with depot details
        const infoContent = `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: bold;">${depot.name}</h3>
            <p style="margin: 0 0 5px; font-size: 13px;">${depot.address}</p>
            ${depot.status ? `<p style="margin: 0; font-size: 12px;"><strong>Status:</strong> ${depot.status}</p>` : ''}
            ${depot.capacity ? `<p style="margin: 0; font-size: 12px;"><strong>Capacity:</strong> ${depot.capacity}</p>` : ''}
          </div>
        `;
        
        const infoWindow = new window.google.maps.InfoWindow({
          content: infoContent
        });
        
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
        
        newMarkers.push(marker);
      }
    });
    
    // If we have valid coordinates, fit the map now for immediate feedback
    if (hasValidCoordinates) {
      console.log(`Initial map bounds adjustment for ${depots.filter(d => d.lat && d.lng).length} depots with coordinates`);
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
    
    // Second pass: geocode addresses for depots without coordinates
    depots.forEach((depot, index) => {
      if (!depot.lat || !depot.lng) {
        if (depot.address) {
          geocodingInProgress = true;
          console.log(`Geocoding address for ${depot.name}: ${depot.address}`);
          const geocoder = new window.google.maps.Geocoder();
          
          // Add a slight delay to avoid hitting geocoding rate limits when processing multiple addresses
          setTimeout(() => {
            geocoder.geocode({ address: depot.address }, (results, status) => {
              if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
                const position = results[0].geometry.location;
                console.log(`Geocoded ${depot.name} to position:`, position.lat(), position.lng());
                bounds.extend(position);
                
                // Create custom SVG marker for better visibility
                const isActive = depot.status === 'Active' || depot.status === 'active';
                const svgMarker = {
                  path: 'M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z M12,11.5c-1.38,0-2.5-1.12-2.5-2.5s1.12-2.5,2.5-2.5s2.5,1.12,2.5,2.5S13.38,11.5,12,11.5z',
                  fillColor: isActive ? '#22c55e' : '#f59e0b',
                  fillOpacity: 0.9,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                  rotation: 0,
                  scale: 2,
                  anchor: new window.google.maps.Point(12, 22),
                  labelOrigin: new window.google.maps.Point(12, 9)
                };
                
                const marker = new window.google.maps.Marker({
                  position,
                  map,
                  title: depot.name,
                  icon: svgMarker,
                  animation: window.google.maps.Animation.DROP,
                  label: {
                    text: depot.name.charAt(0),
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }
                });
                
                // Add info window with depot details
                const infoContent = `
                  <div style="padding: 8px; max-width: 200px;">
                    <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: bold;">${depot.name}</h3>
                    <p style="margin: 0 0 5px; font-size: 13px;">${depot.address}</p>
                    ${depot.status ? `<p style="margin: 0; font-size: 12px;"><strong>Status:</strong> ${depot.status}</p>` : ''}
                    ${depot.capacity ? `<p style="margin: 0; font-size: 12px;"><strong>Capacity:</strong> ${depot.capacity}</p>` : ''}
                  </div>
                `;
                
                const infoWindow = new window.google.maps.InfoWindow({
                  content: infoContent
                });
                
                marker.addListener('click', () => {
                  infoWindow.open(map, marker);
                });
                
                newMarkers.push(marker);
                
                // If this is the last marker being processed, fit the map to show all markers
                if (newMarkers.length === depots.filter(d => d.lat && d.lng || d.address).length) {
                  if (bounds.isEmpty()) return;
                  
                  console.log(`Adjusting map bounds to fit ${newMarkers.length} depots after geocoding`);
                  map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
                  
                  // If there's only one marker, zoom out a bit
                  if (newMarkers.length === 1) {
                    const listener = map.addListener('idle', () => {
                      map.setZoom(Math.min(map.getZoom() - 2, 14));
                      window.google.maps.event.removeListener(listener);
                    });
                  }
                }
              } else {
                console.error(`Failed to geocode address for ${depot.name}:`, status);
              }
            });
          }, index * 200); // Add a 200ms delay between geocoding requests
        }
      }
    });
    
    // If no geocoding is needed, set the markers now
    if (!geocodingInProgress) {
      setDepotMarkers(newMarkers);
    }
  }, [map, depots]);

  return (
    <div className={className}>
      {error && (
        <div className="absolute top-2 left-2 right-2 bg-red-100 text-red-700 p-2 rounded-md text-sm z-10">
          {error}
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
} 