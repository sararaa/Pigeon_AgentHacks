export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed';
  startDate: string;
  endDate: string;
  budget: number;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  department: string;
  tags: string[];
}

export interface TrafficData {
  id: string;
  location: string;
  congestionLevel: number; // 0-100
  averageSpeed: number; // mph
  volume: number; // vehicles per hour
  timestamp: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface ParkingData {
  id: string;
  location: string;
  totalSpots: number;
  availableSpots: number;
  occupancyRate: number; // 0-100
  averageDuration: number; // minutes
  timestamp: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface MapLayer {
  id: string;
  name: string;
  isVisible: boolean;
  type: 'traffic' | 'parking' | 'projects' | 'base';
  icon: string;
}

export type MapViewType = 'standard' | 'satellite' | 'terrain';