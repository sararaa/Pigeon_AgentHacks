import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MapLayer, MapViewType, Project, TrafficData, ParkingData } from '../types';
import { mapLayers, mockTrafficData, mockParkingData } from '../data/mockData';
import { getStoredProjects, saveProject, updateStoredProject, deleteStoredProject } from '../utils/storage';
import { toast } from 'react-hot-toast';

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
    setProjects: (projects: Project[]) => void;
    addProject: (project: Omit<Project, 'id'>) => Promise<void>;
    updateProject: (project: Project) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
}

interface MapProviderProps {
    children: ReactNode;
}

const MapContext = createContext<MapContextProps | undefined>(undefined);

export const MapProvider: React.FC<MapProviderProps> = ({ children }) => {
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [mapView, setMapView] = useState<MapViewType>('standard');
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [layers, setLayers] = useState<MapLayer[]>(mapLayers);
    const [projects, setProjects] = useState<Project[]>([]);

    // Load projects from local storage on mount
    useEffect(() => {
        const storedProjects = getStoredProjects();
        setProjects(storedProjects);
    }, []);

    const toggleLayer = (layerId: string) => {
        setLayers(prevLayers =>
            prevLayers.map(layer =>
                layer.id === layerId
                    ? { ...layer, isVisible: !layer.isVisible }
                    : layer
            )
        );
    };

    const addProject = async (project: Omit<Project, 'id'>) => {
        try {
            const newProject = saveProject(project);
            setProjects(prev => [...prev, newProject]);
            toast.success('Project created successfully');
        } catch (error) {
            console.error('Error creating project:', error);
            toast.error('Failed to create project');
            throw error;
        }
    };

    const updateProject = async (project: Project) => {
        try {
            const updatedProject = updateStoredProject(project);
            setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
            toast.success('Project updated successfully');
        } catch (error) {
            console.error('Error updating project:', error);
            toast.error('Failed to update project');
            throw error;
        }
    };

    const deleteProject = async (id: string) => {
        try {
            deleteStoredProject(id);
            setProjects(prev => prev.filter(p => p.id !== id));
            if (selectedProject?.id === id) {
                setSelectedProject(null);
            }
            toast.success('Project deleted successfully');
        } catch (error) {
            console.error('Error deleting project:', error);
            toast.error('Failed to delete project');
            throw error;
        }
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
                setProjects,
                trafficData: mockTrafficData,
                parkingData: mockParkingData,
                toggleLayer,
                setSelectedProject,
                setMapView,
                isMapLoaded,
                setIsMapLoaded,
                addProject,
                updateProject,
                deleteProject
            }}
        >
            {children}
        </MapContext.Provider>
    );
};

export const useMap = () => {
    const context = useContext(MapContext);
    if (context === undefined) {
        throw new Error('useMap must be used within a MapProvider');
    }
    return context;
};

export default MapContext;