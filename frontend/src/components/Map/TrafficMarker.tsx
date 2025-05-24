import React from 'react';
import { Marker } from '@react-google-maps/api';
import { TrafficData } from '../../types';

interface TrafficMarkerProps {
  traffic: TrafficData;
  onClick: () => void;
}

const TrafficMarker: React.FC<TrafficMarkerProps> = ({ traffic, onClick }) => {
  // Color based on congestion level
  const getColor = () => {
    if (traffic.congestionLevel >= 75) return '#EF4444'; // Red for high congestion
    if (traffic.congestionLevel >= 50) return '#F59E0B'; // Amber for medium congestion
    return '#10B981'; // Green for low congestion
  };

  const getMarkerIcon = () => {
    return {
      path: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z',
      fillColor: getColor(),
      fillOpacity: 0.8,
      strokeWeight: 1,
      strokeColor: '#ffffff',
      scale: 1.2,
      anchor: new google.maps.Point(12, 12),
    };
  };

  return (
    <Marker
      position={traffic.coordinates}
      onClick={onClick}
      icon={getMarkerIcon()}
      zIndex={5}
    />
  );
};

export default TrafficMarker;