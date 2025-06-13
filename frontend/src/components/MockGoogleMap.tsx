import React, { useEffect, useRef } from 'react';
import { Route } from '@/contexts/RouteContext';

interface MockGoogleMapProps {
  selectedRoute: Route | null;
  className?: string;
}

export function MockGoogleMap({ selectedRoute, className = 'h-full w-full' }: MockGoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Draw a simple representation of the route
    if (!mapRef.current || !selectedRoute) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = mapRef.current.clientWidth;
    canvas.height = mapRef.current.clientHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear previous content
    mapRef.current.innerHTML = '';
    mapRef.current.appendChild(canvas);
    
    // Set background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw route
    const stops = selectedRoute.stops;
    if (stops.length < 2) return;
    
    // Calculate positions (simple mock layout)
    const padding = 40;
    const width = canvas.width - (padding * 2);
    const height = canvas.height - (padding * 2);
    
    // Draw connections between stops
    ctx.beginPath();
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 3;
    
    stops.forEach((stop, index) => {
      const x = padding + (width * (index / (stops.length - 1)));
      const y = padding + (height / 2) + (Math.sin(index) * (height / 4));
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw stop markers
    stops.forEach((stop, index) => {
      const x = padding + (width * (index / (stops.length - 1)));
      const y = padding + (height / 2) + (Math.sin(index) * (height / 4));
      
      ctx.beginPath();
      ctx.fillStyle = stop.type === 'pickup' ? '#2196F3' : '#F44336';
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 8px Arial';
      ctx.fillText((index + 1).toString(), x, y);
      
      // Draw stop label
      ctx.fillStyle = '#333';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(stop.address.split(',')[0], x, y + 20);
    });
    
    // Draw route info
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${selectedRoute.routeName} - ${selectedRoute.totalDistance}`, 10, 20);
    
  }, [selectedRoute]);

  return (
    <div className={className}>
      <div ref={mapRef} className="h-full w-full relative">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <p>Select a route to view on map</p>
        </div>
      </div>
    </div>
  );
} 