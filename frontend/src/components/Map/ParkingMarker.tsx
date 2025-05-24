import React from 'react';
import { Marker } from '@react-google-maps/api';
import { ParkingData } from '../../types';

interface ParkingMarkerProps {
  parking: ParkingData;
  onClick: () => void;
}

const ParkingMarker: React.FC<ParkingMarkerProps> = ({ parking, onClick }) => {
  // Color based on availability
  const getColor = () => {
    const availability = (parking.availableSpots / parking.totalSpots) * 100;
    if (availability < 15) return '#EF4444'; // Red for low availability
    if (availability < 40) return '#F59E0B'; // Amber for medium availability
    return '#10B981'; // Green for high availability
  };

  const getMarkerIcon = () => {
    return {
      path: 'M13 3H11V11H5V13H11V21H13V13H19V11H13V3Z',
      fillColor: getColor(),
      fillOpacity: 0.8,
      strokeWeight: 1,
      strokeColor: '#ffffff',
      scale: 1.5,
      anchor: new google.maps.Point(12, 12),
    };
  };

  return (
    <Marker
      position={parking.coordinates}
      onClick={onClick}
      icon={getMarkerIcon()}
      zIndex={5}
    />
  );
};

export default ParkingMarker;