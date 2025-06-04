import React from 'react';
import { Marker } from '@react-google-maps/api';
import { TrafficData } from '../../types';

interface TrafficMarkerProps {
  traffic: TrafficData;
  onClick: () => void;
}

const TrafficMarker: React.FC<TrafficMarkerProps> = ({ traffic, onClick }) => {
  const getMarkerIcon = () => {
    const color = traffic.congestionLevel === 'high' ? '#dc2626' :
                 traffic.congestionLevel === 'medium' ? '#f59e0b' :
                 '#22c55e';

    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 0.7,
      strokeWeight: 2,
      strokeColor: '#ffffff',
      scale: 8,
    };
  };

  return (
    <Marker
      position={traffic.location}
      onClick={onClick}
      icon={getMarkerIcon()}
      title={`Traffic Level: ${traffic.congestionLevel}`}
    />
  );
};

export default TrafficMarker;