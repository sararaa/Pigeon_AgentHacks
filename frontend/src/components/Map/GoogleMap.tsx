import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, TrafficLayer, Libraries } from '@react-google-maps/api';
import { useMap } from '../../contexts/MapContext';
import { Project, TrafficData, ParkingData } from '../../types';
import { Car, ParkingCircle, Building } from 'lucide-react';
import ProjectMapMarker from './ProjectMapMarker';
import TrafficMarker from './TrafficMarker';
import ParkingMarker from './ParkingMarker';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const DEFAULT_CENTER = { lat: 34.1478, lng: -118.1445 }; // Center of Pasadena
const DEFAULT_ZOOM = 14;

const libraries: Libraries = ['places'];

interface MapProps {
    apiKey: string;
}

const MapComponent: React.FC<MapProps> = ({ apiKey }) => {
    const mapRef = useRef<google.maps.Map | null>(null);
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey || '',
        libraries
    });

    const {
        mapInstance,
        setMapInstance,
        mapLayers,
        projects,
        trafficData,
        parkingData,
        selectedProject,
        setSelectedProject,
        mapView,
        setIsMapLoaded
    } = useMap();

    const [selectedTraffic, setSelectedTraffic] = useState<TrafficData | null>(null);
    const [selectedParking, setSelectedParking] = useState<ParkingData | null>(null);

    console.log(setMapInstance);

    const onLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
        setIsMapLoaded(true);
        setMapInstance(map); // ✅ now globally accessible
        console.log("MAP LOADED", map);
        
        // Center on Pasadena
        map.setCenter({ lat: 34.1478, lng: -118.1445 });
        map.setZoom(13);
    }, [setIsMapLoaded, setMapInstance]);

    const handleMapLoad = (mapInstance: google.maps.Map) => {
        setMapInstance(mapInstance); // now you have access to the real map object
    };

    const onUnmount = useCallback(() => {
        mapRef.current = null;
        setIsMapLoaded(false);
    }, [setIsMapLoaded]);

    // Handle map click to unselect project
    const handleMapClick = useCallback(() => {
        setSelectedProject(null);
        setSelectedTraffic(null);
        setSelectedParking(null);
    }, [setSelectedProject]);

    // Set map type based on mapView
    useEffect(() => {
        if (mapRef.current) {
            switch (mapView) {
                case 'satellite':
                    mapRef.current.setMapTypeId(google.maps.MapTypeId.SATELLITE);
                    break;
                case 'terrain':
                    mapRef.current.setMapTypeId(google.maps.MapTypeId.TERRAIN);
                    break;
                default:
                    mapRef.current.setMapTypeId(google.maps.MapTypeId.ROADMAP);
            }
        }
    }, [mapView]);
    
    // Pan to selected project
    useEffect(() => {
        if (selectedProject && mapRef.current) {
            mapRef.current.panTo(selectedProject.location);
            mapRef.current.setZoom(15);
        }
    }, [selectedProject]);

    if (!isLoaded) {
        return <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <div className="animate-pulse text-gray-600">Loading Maps...</div>
        </div>;
    }
    
    const trafficLayerVisible = mapLayers.find(layer => layer.id === 'traffic')?.isVisible;
    const parkingLayerVisible = mapLayers.find(layer => layer.id === 'parking')?.isVisible;
    const projectsLayerVisible = mapLayers.find(layer => layer.id === 'projects')?.isVisible;

    const handleProjectClick = (project: Project) => {
        setSelectedProject(project);
    };

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick}
            options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
                zoomControl: true,
                styles: [
                    {
                        featureType: 'poi',
                        elementType: 'labels',
                        stylers: [{ visibility: 'off' }]
                    }
                ]
            }}
        >
            {/* Traffic Layer */}
            {trafficLayerVisible && <TrafficLayer />}

            {/* Project Markers */}
            {projectsLayerVisible && projects.map(project => (
                <ProjectMapMarker
                    key={project.id}
                    project={project}
                    onClick={() => handleProjectClick(project)}
                />
            ))}

            {/* Traffic Data Markers */}
            {trafficLayerVisible && trafficData.map((traffic, index) => (
                <TrafficMarker
                    key={`traffic-${index}`}
                    traffic={traffic}
                    onClick={() => setSelectedTraffic(traffic)}
                />
            ))}

            {/* Parking Data Markers */}
            {parkingLayerVisible && parkingData.map((parking, index) => (
                <ParkingMarker
                    key={`parking-${index}`}
                    parking={parking}
                    onClick={() => setSelectedParking(parking)}
                />
            ))}

            {/* Info Windows */}
            {selectedTraffic && (
                <InfoWindow
                    position={selectedTraffic.coordinates}
                    onCloseClick={() => setSelectedTraffic(null)}
                >
                    <div className="p-2 max-w-xs">
                        <h3 className="font-semibold text-gray-800">{selectedTraffic.location}</h3>
                        <p className="text-sm text-gray-600">Congestion: {selectedTraffic.congestionLevel}%</p>
                        <p className="text-sm text-gray-600">Avg. Speed: {selectedTraffic.averageSpeed} mph</p>
                        <p className="text-sm text-gray-600">Volume: {selectedTraffic.volume} vehicles/hr</p>
                    </div>
                </InfoWindow>
            )}

            {selectedParking && (
                <InfoWindow
                    position={selectedParking.coordinates}
                    onCloseClick={() => setSelectedParking(null)}
                >
                    <div className="p-2 max-w-xs">
                        <h3 className="font-semibold text-gray-800">{selectedParking.location}</h3>
                        <p className="text-sm text-gray-600">Available: {selectedParking.availableSpots}/{selectedParking.totalSpots}</p>
                        <p className="text-sm text-gray-600">Occupancy: {selectedParking.occupancyRate}%</p>
                        <p className="text-sm text-gray-600">Avg. Duration: {selectedParking.averageDuration} min</p>
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    );
};

export default React.memo(MapComponent);