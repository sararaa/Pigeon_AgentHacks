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

export interface AreaMetrics {
  id: number;
  name: string;
  population: number;
  density: number;
  landArea: number;
  avgPropertyValue: number;
  commercialZones: number;
  residentialZones: number;
  mixedUseZones: number;
}

export interface TrafficMetrics {
  areaId: number;
  peakHourVolume: number;
  avgSpeed: number;
  congestionIndex: number;
  publicTransitRidership: number;
  avgCommuteTime: number;
  parkingOccupancy: number;
  accidentRate: number;
  peakHours: string[];
}

export interface InfrastructureMetrics {
  areaId: number;
  roadConditionIndex: number;
  bridgeHealthScore: number;
  maintenanceBacklog: number;
  constructionProjects: number;
  publicSpaceUtilization: number;
  infrastructureAge: number;
  plannedImprovements: number;
  annualMaintenanceBudget: number;
}

export interface EnvironmentalMetrics {
  areaId: number;
  airQualityIndex: number;
  noiseLevel: number;
  greenSpaceCoverage: number;
  energyConsumption: number;
  wasteRecyclingRate: number;
  carbonEmissions: number;
  treeCanopyCoverage: number;
  sustainabilityScore: number;
}