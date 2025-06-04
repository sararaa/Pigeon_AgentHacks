import { Project, TrafficData, ParkingData, MapLayer } from '../types';
import { MapIcon, Car, ParkingCircle, BuildingIcon, LayersIcon } from 'lucide-react';

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Colorado Boulevard Revitalization',
    description: 'Streetscape improvements and pedestrian enhancements along Colorado Boulevard in Old Pasadena',
    status: 'in-progress',
    startDate: '2024-01-15',
    endDate: '2024-08-30',
    budget: 5200000,
    location: {
      lat: 34.1453,
      lng: -118.1513
    },
    address: '300 E Colorado Blvd, Pasadena, CA',
    department: 'Public Works',
    tags: ['infrastructure', 'pedestrian', 'beautification']
  },
  {
    id: '2',
    name: 'Rose Bowl Stadium Upgrades',
    description: 'Modernization of facilities and safety improvements at the historic Rose Bowl Stadium',
    status: 'planned',
    startDate: '2024-06-01',
    endDate: '2025-01-15',
    budget: 8500000,
    location: {
      lat: 34.1613,
      lng: -118.1676
    },
    address: '1001 Rose Bowl Dr, Pasadena, CA',
    department: 'Parks & Recreation',
    tags: ['sports', 'renovation', 'historic']
  },
  {
    id: '3',
    name: 'Lake Avenue Complete Streets',
    description: 'Implementation of bike lanes and traffic calming measures on Lake Avenue',
    status: 'in-progress',
    startDate: '2024-02-01',
    endDate: '2024-07-30',
    budget: 3800000,
    location: {
      lat: 34.1478,
      lng: -118.1325
    },
    address: '500 S Lake Ave, Pasadena, CA',
    department: 'Transportation',
    tags: ['bicycle', 'safety', 'traffic']
  },
  {
    id: '4',
    name: 'Playhouse District Arts Center',
    description: 'New community arts center and performance space in the Playhouse District',
    status: 'planned',
    startDate: '2024-09-01',
    endDate: '2025-06-30',
    budget: 12000000,
    location: {
      lat: 34.1461,
      lng: -118.1391
    },
    address: '39 S El Molino Ave, Pasadena, CA',
    department: 'Cultural Affairs',
    tags: ['arts', 'community', 'development']
  }
];

export const mockTrafficData: TrafficData[] = [
  {
    id: '1',
    location: 'Colorado & Fair Oaks',
    congestionLevel: 85,
    averageSpeed: 15,
    volume: 1200,
    timestamp: new Date().toISOString(),
    coordinates: {
      lat: 34.1453,
      lng: -118.1513
    }
  },
  {
    id: '2',
    location: 'Lake & California',
    congestionLevel: 65,
    averageSpeed: 22,
    volume: 800,
    timestamp: new Date().toISOString(),
    coordinates: {
      lat: 34.1478,
      lng: -118.1325
    }
  },
  {
    id: '3',
    location: 'Orange Grove & Colorado',
    congestionLevel: 75,
    averageSpeed: 18,
    volume: 950,
    timestamp: new Date().toISOString(),
    coordinates: {
      lat: 34.1456,
      lng: -118.1592
    }
  }
];

export const mockParkingData: ParkingData[] = [
  {
    id: '1',
    location: 'Marengo Parking Garage',
    totalSpots: 450,
    availableSpots: 85,
    occupancyRate: 81,
    averageDuration: 180,
    timestamp: new Date().toISOString(),
    coordinates: {
      lat: 34.1467,
      lng: -118.1397
    }
  },
  {
    id: '2',
    location: 'De Lacey Parking Structure',
    totalSpots: 650,
    availableSpots: 230,
    occupancyRate: 65,
    averageDuration: 150,
    timestamp: new Date().toISOString(),
    coordinates: {
      lat: 34.1458,
      lng: -118.1517
    }
  },
  {
    id: '3',
    location: 'Schoolhouse Parking Garage',
    totalSpots: 350,
    availableSpots: 45,
    occupancyRate: 87,
    averageDuration: 210,
    timestamp: new Date().toISOString(),
    coordinates: {
      lat: 34.1472,
      lng: -118.1442
    }
  }
];

export const mapLayers: MapLayer[] = [
  {
    id: 'traffic',
    name: 'Traffic Data',
    isVisible: false,
    type: 'traffic',
    icon: 'car'
  },
  {
    id: 'parking',
    name: 'Parking Data',
    isVisible: false,
    type: 'parking',
    icon: 'parking'
  },
  {
    id: 'projects',
    name: 'City Projects',
    isVisible: false,
    type: 'projects',
    icon: 'building'
  }
];