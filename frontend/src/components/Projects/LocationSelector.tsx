import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker, Polygon, Polyline } from '@react-google-maps/api';
import { useMap } from '../../contexts/MapContext';
import { MapPin, LineChart, Square } from 'lucide-react';

interface Coordinate {
  lat: number;
  lng: number;
}

interface LocationSelectorProps {
  initialLocation?: Coordinate;
  initialCoordinates?: Coordinate[];
  initialLocationType?: 'point' | 'line' | 'area';
  onLocationChange: (location: Coordinate, coordinates: Coordinate[] | undefined, locationType: 'point' | 'line' | 'area') => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  initialLocation = { lat: 34.1478, lng: -118.1445 },
  initialCoordinates = [],
  initialLocationType = 'point',
  onLocationChange
}) => {
  const { mapInstance } = useMap();
  const [locationType, setLocationType] = useState<'point' | 'line' | 'area'>(initialLocationType);
  const [coordinates, setCoordinates] = useState<Coordinate[]>(initialCoordinates);
  const [mainLocation, setMainLocation] = useState<Coordinate>(initialLocation);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const newCoord = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };

    if (locationType === 'point') {
      setMainLocation(newCoord);
      setCoordinates([]);
      onLocationChange(newCoord, undefined, locationType);
    } else {
      const newCoordinates = [...coordinates];
      
      if (locationType === 'line' && newCoordinates.length >= 2) {
        newCoordinates.length = 0;
      }
      
      if (locationType === 'area' && newCoordinates.length >= 4) {
        newCoordinates.length = 0;
      }
      
      newCoordinates.push(newCoord);
      setCoordinates(newCoordinates);
      
      // For line and area, use the center point as the main location
      if (newCoordinates.length > 0) {
        const center = calculateCenter(newCoordinates);
        setMainLocation(center);
        onLocationChange(center, newCoordinates, locationType);
      }
    }
  }, [locationType, coordinates, onLocationChange]);

  const calculateCenter = (coords: Coordinate[]): Coordinate => {
    const total = coords.reduce(
      (acc, coord) => ({
        lat: acc.lat + coord.lat,
        lng: acc.lng + coord.lng
      }),
      { lat: 0, lng: 0 }
    );
    
    return {
      lat: total.lat / coords.length,
      lng: total.lng / coords.length
    };
  };

  const handleTypeChange = (type: 'point' | 'line' | 'area', e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    setLocationType(type);
    setCoordinates([]);
    onLocationChange(mainLocation, undefined, type);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <button
          type="button" // Explicitly set button type
          onClick={(e) => handleTypeChange('point', e)}
          className={`flex items-center px-3 py-2 rounded-md ${
            locationType === 'point'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          <MapPin className="h-4 w-4 mr-2" />
          Point
        </button>
        <button
          type="button" // Explicitly set button type
          onClick={(e) => handleTypeChange('line', e)}
          className={`flex items-center px-3 py-2 rounded-md ${
            locationType === 'line'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          <LineChart className="h-4 w-4 mr-2" />
          Line
        </button>
        <button
          type="button" // Explicitly set button type
          onClick={(e) => handleTypeChange('area', e)}
          className={`flex items-center px-3 py-2 rounded-md ${
            locationType === 'area'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          <Square className="h-4 w-4 mr-2" />
          Area
        </button>
      </div>

      <div className="h-[300px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={mainLocation}
          zoom={15}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
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
          {locationType === 'point' && (
            <Marker
              position={mainLocation}
              draggable
              onDragEnd={(e) => {
                if (e.latLng) {
                  const newLocation = {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng()
                  };
                  setMainLocation(newLocation);
                  onLocationChange(newLocation, undefined, locationType);
                }
              }}
            />
          )}

          {locationType === 'line' && coordinates.length > 0 && (
            <>
              <Polyline
                path={coordinates}
                options={{
                  strokeColor: '#2563eb',
                  strokeOpacity: 1,
                  strokeWeight: 3
                }}
              />
              {coordinates.map((coord, index) => (
                <Marker
                  key={index}
                  position={coord}
                  label={`${index + 1}`}
                />
              ))}
            </>
          )}

          {locationType === 'area' && coordinates.length > 0 && (
            <>
              <Polygon
                paths={coordinates}
                options={{
                  fillColor: '#2563eb',
                  fillOpacity: 0.2,
                  strokeColor: '#2563eb',
                  strokeOpacity: 1,
                  strokeWeight: 2
                }}
              />
              {coordinates.map((coord, index) => (
                <Marker
                  key={index}
                  position={coord}
                  label={`${index + 1}`}
                />
              ))}
            </>
          )}
        </GoogleMap>
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        {locationType === 'point' && 'Click on the map to set a location point, or drag the marker to adjust.'}
        {locationType === 'line' && 'Click to add up to 2 points to create a line. Click again to start over.'}
        {locationType === 'area' && 'Click to add up to 4 points to create an area. Click again to start over.'}
      </div>
    </div>
  );
};

export default LocationSelector; 