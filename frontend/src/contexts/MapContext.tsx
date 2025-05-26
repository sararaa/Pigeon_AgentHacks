import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MapLayer, MapViewType, Project, TrafficData, ParkingData } from '../types';
import { mapLayers, mockProjects, mockTrafficData, mockParkingData } from '../data/mockData';

interface MapContextProps {
    mapInstance: google.maps.Map | null;
    setMapInstance: (map: google.maps.Map | null) => void;
    mapLayers: MapLayer[];
    selectedProject: Project | null;
    mapView: MapViewType;
    projects: Project[];
    trafficData: TrafficData[];
    parkingData: ParkingData[];
    toggleLayer: (layerId: string) => void;
    setSelectedProject: (project: Project | null) => void;
    setMapView: (view: MapViewType) => void;
    isMapLoaded: boolean;
    setIsMapLoaded: (loaded: boolean) => void;
}

const MapContext = createContext<MapContextProps | undefined>(undefined);

export const MapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [layers, setLayers] = useState<MapLayer[]>(mapLayers);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [mapView, setMapView] = useState<MapViewType>('standard');
    const [projects] = useState<Project[]>(mockProjects);
    const [trafficData] = useState<TrafficData[]>(mockTrafficData);
    const [parkingData] = useState<ParkingData[]>(mockParkingData);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
    const toggleLayer = (layerId: string) => {
        setLayers(prevLayers =>
            prevLayers.map(layer =>
                layer.id === layerId
                    ? { ...layer, isVisible: !layer.isVisible }
                    : layer
            )
        );
    };

    return (
        <MapContext.Provider
            value={{
                mapInstance,
                setMapInstance,
                mapLayers: layers,
                selectedProject,
                mapView,
                projects,
                trafficData,
                parkingData,
                toggleLayer,
                setSelectedProject,
                setMapView,
                isMapLoaded,
                setIsMapLoaded
            }}
        >
            {children}
        </MapContext.Provider>
    );
};

export const useMap = () => {
    const context = useContext(MapContext);
    if (context === undefined) {
        console.error('useMap must be used within a MapProvider');
        throw new Error('useMap must be used within a MapProvider');
    }
    return context;
};