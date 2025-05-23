// frontend/src/components/MapView.js
import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';
import AgentLayer from './AgentLayer';
import api from '../services/api';

const mapContainerStyle = {
  flex: 1,
  height: '100vh'
};

const center = {
  lat: 37.7749,
  lng: -122.4194
};

const options = {
  styles: [
    {
      featureType: 'all',
      elementType: 'geometry',
      stylers: [{ color: '#242f3e' }]
    },
    {
      featureType: 'all',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#242f3e' }]
    },
    {
      featureType: 'all',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#746855' }]
    }
  ],
  disableDefaultUI: false,
  zoomControl: true,
};

function MapView({ agents, roadConditions }) {
  const [map, setMap] = useState(null);
  const [blockMode, setBlockMode] = useState(false);
  const [blockedLocations, setBlockedLocations] = useState([]);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const handleMapClick = useCallback(async (e) => {
    if (!blockMode) return;

    const location = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };

    try {
      await api.post('/roads/block', { location });
      setBlockedLocations([...blockedLocations, location]);
    } catch (error) {
      console.error('Failed to block road:', error);
    }
  }, [blockMode, blockedLocations]);

  return (
    <>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
        options={options}
        onLoad={onLoad}
        onClick={handleMapClick}
      >
        {/* Agent markers */}
        <AgentLayer agents={agents} map={map} />

        {/* Blocked road markers */}
        {Object.entries(roadConditions).map(([key, condition]) => (
          condition.blocked && (
            <Marker
              key={key}
              position={condition.location}
              icon={{
                url: '/blocked-road-icon.png',
                scaledSize: new window.google.maps.Size(30, 30),
              }}
            />
          )
        ))}

        {/* Traffic layer */}
        {map && (
          <TrafficLayer map={map} />
        )}
      </GoogleMap>

      {/* Block mode indicator */}
      {blockMode && (
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'error.main',
            color: 'white',
            px: 3,
            py: 1,
            borderRadius: 2,
          }}
        >
          Click on map to block roads
        </Box>
      )}
    </>
  );
}

// Custom Traffic Layer Component
function TrafficLayer({ map }) {
  useEffect(() => {
    const trafficLayer = new window.google.maps.TrafficLayer();
    trafficLayer.setMap(map);

    return () => {
      trafficLayer.setMap(null);
    };
  }, [map]);

  return null;
}

export default MapView;