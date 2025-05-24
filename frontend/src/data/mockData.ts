import { Project, TrafficData, ParkingData, MapLayer } from '../types';
import { MapIcon, Car, ParkingCircle, BuildingIcon, LayersIcon } from 'lucide-react';

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Downtown Revitalization',
    description: 'Modernizing the downtown area with new sidewalks, lighting, and green spaces.',
    status: 'in-progress',
    startDate: '2025-01-15',
    endDate: '2025-12-20',
    budget: 2500000,
    location: {
      lat: 37.7749,
      lng: -122.4194
    },
    address: '123 Market St, San Francisco, CA',
    department: 'Urban Development',
    tags: ['infrastructure', 'public spaces', 'lighting']
  },
  {
    id: '2',
    name: 'Bike Lane Expansion',
    description: 'Adding 12 miles of protected bike lanes throughout the city.',
    status: 'planned',
    startDate: '2025-03-10',
    endDate: '2025-08-15',
    budget: 850000,
    location: {
      lat: 37.7845,
      lng: -122.4338
    },
    address: '456 Green St, San Francisco, CA',
    department: 'Transportation',
    tags: ['cycling', 'transportation', 'safety']
  },
  {
    id: '3',
    name: 'Central Park Renovation',
    description: 'Upgrading facilities at Central Park including playgrounds and restrooms.',
    status: 'completed',
    startDate: '2024-05-01',
    endDate: '2024-12-15',
    budget: 1200000,
    location: {
      lat: 37.7695,
      lng: -122.4091
    },
    address: '789 Park Ave, San Francisco, CA',
    department: 'Parks & Recreation',
    tags: ['parks', 'recreation', 'public spaces']
  },
  {
    id: '4',
    name: 'Smart Traffic Signals',
    description: 'Installing AI-powered traffic signals at 25 key intersections.',
    status: 'in-progress',
    startDate: '2024-11-01',
    endDate: '2025-04-30',
    budget: 1800000,
    location: {
      lat: 37.7911,
      lng: -122.4011
    },
    address: '101 Mission St, San Francisco, CA',
    department: 'Transportation',
    tags: ['smart city', 'traffic', 'technology']
  }
];

export const mockTrafficData: TrafficData[] = [
  {
    id: 't1',
    location: 'Market & 5th',
    congestionLevel: 78,
    averageSpeed: 12,
    volume: 850,
    timestamp: '2025-02-15T08:30:00',
    coordinates: {
      lat: 37.7835,
      lng: -122.4089
    }
  },
  {
    id: 't2',
    location: 'Van Ness & Geary',
    congestionLevel: 65,
    averageSpeed: 18,
    volume: 720,
    timestamp: '2025-02-15T08:30:00',
    coordinates: {
      lat: 37.7853,
      lng: -122.4222
    }
  },
  {
    id: 't3',
    location: 'Embarcadero & Howard',
    congestionLevel: 45,
    averageSpeed: 25,
    volume: 580,
    timestamp: '2025-02-15T08:30:00',
    coordinates: {
      lat: 37.7906,
      lng: -122.3895
    }
  },
  {
    id: 't4',
    location: '19th Ave & Lincoln',
    congestionLevel: 82,
    averageSpeed: 8,
    volume: 910,
    timestamp: '2025-02-15T08:30:00',
    coordinates: {
      lat: 37.7642,
      lng: -122.4769
    }
  }
];

export const mockParkingData: ParkingData[] = [
  {
    id: 'p1',
    location: 'Union Square Garage',
    totalSpots: 850,
    availableSpots: 127,
    occupancyRate: 85,
    averageDuration: 156,
    timestamp: '2025-02-15T08:30:00',
    coordinates: {
      lat: 37.7879,
      lng: -122.4075
    }
  },
  {
    id: 'p2',
    location: 'Civic Center Garage',
    totalSpots: 1200,
    availableSpots: 423,
    occupancyRate: 65,
    averageDuration: 187,
    timestamp: '2025-02-15T08:30:00',
    coordinates: {
      lat: 37.7795,
      lng: -122.4174
    }
  },
  {
    id: 'p3',
    location: 'Fifth & Mission Garage',
    totalSpots: 2500,
    availableSpots: 568,
    occupancyRate: 77,
    averageDuration: 143,
    timestamp: '2025-02-15T08:30:00',
    coordinates: {
      lat: 37.7833,
      lng: -122.4062
    }
  },
  {
    id: 'p4',
    location: 'North Beach Garage',
    totalSpots: 350,
    availableSpots: 42,
    occupancyRate: 88,
    averageDuration: 122,
    timestamp: '2025-02-15T08:30:00',
    coordinates: {
      lat: 37.8002,
      lng: -122.4084
    }
  }
];

export const mapLayers: MapLayer[] = [
  {
    id: 'base',
    name: 'Base Map',
    isVisible: true,
    type: 'base',
    icon: 'layers'
  },
  {
    id: 'traffic',
    name: 'Traffic Data',
    isVisible: true,
    type: 'traffic',
    icon: 'car'
  },
  {
    id: 'parking',
    name: 'Parking Data',
    isVisible: true,
    type: 'parking',
    icon: 'parking'
  },
  {
    id: 'projects',
    name: 'City Projects',
    isVisible: true,
    type: 'projects',
    icon: 'building'
  }
];