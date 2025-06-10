export type MapViewType = 'standard' | 'satellite' | 'terrain';

export interface MapLayer {
    id: string;
    name: string;
    isVisible: boolean;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    status: 'planned' | 'in-progress' | 'completed';
    startDate: string;
    endDate: string;
    budget: number;
    locationType: 'point' | 'line' | 'area';
    location: {
        lat: number;
        lng: number;
    };
    coordinates: {
        lat: number;
        lng: number;
    }[];
    address: string;
    department: string;
    tags: string[];
    color: string; // Hex color code for the project marker
}

export interface TrafficData {
    location: {
        lat: number;
        lng: number;
    };
    congestionLevel: 'low' | 'medium' | 'high';
    timestamp: string;
}

export interface ParkingData {
    location: {
        lat: number;
        lng: number;
    };
    availableSpots: number;
    totalSpots: number;
    name: string;
}

// ... rest of the types ... 