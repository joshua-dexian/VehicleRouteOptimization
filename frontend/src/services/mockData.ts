import { Depot } from './api';

// Mock depot data with coordinates for map display
export const mockDepots: Depot[] = [
  {
    id: 1,
    name: "Central Depot",
    address: "Chennai Central, Chennai, Tamil Nadu, India",
    status: "Active",
    lat: 13.0827,
    lng: 80.2707,
    capacity: "Large"
  },
  {
    id: 2,
    name: "North Warehouse",
    address: "Ambattur, Chennai, Tamil Nadu, India",
    status: "Active",
    lat: 13.1143,
    lng: 80.1548,
    capacity: "Medium"
  },
  {
    id: 3,
    name: "South Hub",
    address: "Tambaram, Chennai, Tamil Nadu, India",
    status: "Maintenance",
    lat: 12.9249,
    lng: 80.1000,
    capacity: "Large"
  },
  {
    id: 4,
    name: "East Distribution Center",
    address: "Sholinganallur, Chennai, Tamil Nadu, India",
    status: "Active",
    lat: 12.9010,
    lng: 80.2279,
    capacity: "Small"
  },
  {
    id: 5,
    name: "West Storage Facility",
    address: "Porur, Chennai, Tamil Nadu, India",
    status: "Active",
    lat: 13.0374,
    lng: 80.1417,
    capacity: "Medium"
  }
]; 