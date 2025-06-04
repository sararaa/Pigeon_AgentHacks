import { AreaMetrics, TrafficMetrics, InfrastructureMetrics, EnvironmentalMetrics } from '../types';

export const areaMetrics: AreaMetrics[] = [
  {
    id: 1,
    name: 'Old Pasadena',
    population: 45000,
    density: 12000,
    landArea: 3.2,
    avgPropertyValue: 950000,
    commercialZones: 55,
    residentialZones: 30,
    mixedUseZones: 15
  },
  {
    id: 2,
    name: 'South Lake',
    population: 35000,
    density: 9500,
    landArea: 2.8,
    avgPropertyValue: 850000,
    commercialZones: 40,
    residentialZones: 45,
    mixedUseZones: 15
  },
  {
    id: 3,
    name: 'Playhouse District',
    population: 28000,
    density: 8500,
    landArea: 2.5,
    avgPropertyValue: 780000,
    commercialZones: 35,
    residentialZones: 50,
    mixedUseZones: 15
  }
];

export const trafficMetrics: TrafficMetrics[] = [
  {
    areaId: 1,
    peakHourVolume: 2800,
    avgSpeed: 18,
    congestionIndex: 82,
    publicTransitRidership: 25000,
    avgCommuteTime: 28,
    parkingOccupancy: 95,
    accidentRate: 2.1,
    peakHours: ['8:00-10:00', '16:30-18:30']
  },
  {
    areaId: 2,
    peakHourVolume: 2200,
    avgSpeed: 22,
    congestionIndex: 75,
    publicTransitRidership: 18000,
    avgCommuteTime: 25,
    parkingOccupancy: 88,
    accidentRate: 1.8,
    peakHours: ['7:30-9:30', '16:00-18:00']
  },
  {
    areaId: 3,
    peakHourVolume: 1800,
    avgSpeed: 25,
    congestionIndex: 65,
    publicTransitRidership: 15000,
    avgCommuteTime: 22,
    parkingOccupancy: 82,
    accidentRate: 1.5,
    peakHours: ['8:00-10:00', '17:00-19:00']
  }
];

export const infrastructureMetrics: InfrastructureMetrics[] = [
  {
    areaId: 1,
    roadConditionIndex: 85,
    bridgeHealthScore: 90,
    maintenanceBacklog: 8,
    constructionProjects: 5,
    publicSpaceUtilization: 88,
    infrastructureAge: 12,
    plannedImprovements: 4,
    annualMaintenanceBudget: 8500000
  },
  {
    areaId: 2,
    roadConditionIndex: 88,
    bridgeHealthScore: 92,
    maintenanceBacklog: 6,
    constructionProjects: 3,
    publicSpaceUtilization: 85,
    infrastructureAge: 10,
    plannedImprovements: 3,
    annualMaintenanceBudget: 7200000
  },
  {
    areaId: 3,
    roadConditionIndex: 82,
    bridgeHealthScore: 88,
    maintenanceBacklog: 9,
    constructionProjects: 4,
    publicSpaceUtilization: 80,
    infrastructureAge: 15,
    plannedImprovements: 5,
    annualMaintenanceBudget: 6800000
  }
];

export const environmentalMetrics: EnvironmentalMetrics[] = [
  {
    areaId: 1,
    airQualityIndex: 72,
    noiseLevel: 68,
    greenSpaceCoverage: 18,
    energyConsumption: 380000,
    wasteRecyclingRate: 48,
    carbonEmissions: 320000,
    treeCanopyCoverage: 25,
    sustainabilityScore: 78
  },
  {
    areaId: 2,
    airQualityIndex: 75,
    noiseLevel: 65,
    greenSpaceCoverage: 22,
    energyConsumption: 320000,
    wasteRecyclingRate: 52,
    carbonEmissions: 280000,
    treeCanopyCoverage: 28,
    sustainabilityScore: 82
  },
  {
    areaId: 3,
    airQualityIndex: 78,
    noiseLevel: 62,
    greenSpaceCoverage: 25,
    energyConsumption: 290000,
    wasteRecyclingRate: 50,
    carbonEmissions: 260000,
    treeCanopyCoverage: 30,
    sustainabilityScore: 85
  }
]; 