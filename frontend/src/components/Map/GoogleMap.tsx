import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, TrafficLayer } from '@react-google-maps/api';
import { useMap } from '../../contexts/MapContext';
import { Project, TrafficData, ParkingData } from '../../types';
import { Car, ParkingCircle, Building } from 'lucide-react';
import ProjectMarker from './ProjectMarker';
import TrafficMarker from './TrafficMarker';
import ParkingMarker from './ParkingMarker';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const center = {
    lat: 37.7749,
    lng: -122.4194
};

const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ['places'];

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
    }, [setIsMapLoaded, setMapInstance]);

    const handleMapLoad = (mapInstance: google.maps.Map) => {
        setMapInstance(mapInstance); // now you have access to the real map object
    };


    const onUnmount = useCallback(() => {
        mapRef.current = null;
        setIsMapLoaded(false);
    }, [setIsMapLoaded]);

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

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
            onLoad={onLoad}
            onUnmount={onUnmount}
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
            {/* Traffic Layer from Google Maps */}
            {trafficLayerVisible && <TrafficLayer />}

            {/* Project Markers */}
            {projectsLayerVisible && projects.map(project => (
                <ProjectMarker
                    key={project.id}
                    project={project}
                    isSelected={selectedProject?.id === project.id}
                    onClick={() => setSelectedProject(project)}
                />
            ))}

            {/* Traffic Data Markers */}
            {trafficLayerVisible && trafficData.map(traffic => (
                <TrafficMarker
                    key={traffic.id}
                    traffic={traffic}
                    onClick={() => setSelectedTraffic(traffic)}
                />
            ))}

            {/* Parking Data Markers */}
            {parkingLayerVisible && parkingData.map(parking => (
                <ParkingMarker
                    key={parking.id}
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