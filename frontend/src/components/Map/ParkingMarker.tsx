import React from 'react';
import { Marker } from '@react-google-maps/api';
import { ParkingData } from '../../types';

interface ParkingMarkerProps {
  parking: ParkingData;
  onClick: () => void;
}

const ParkingMarker: React.FC<ParkingMarkerProps> = ({ parking, onClick }) => {
  const getMarkerIcon = () => {
    const occupancyRate = (parking.availableSpots / parking.totalSpots) * 100;
    const color = occupancyRate > 50 ? '#22c55e' :
                 occupancyRate > 20 ? '#f59e0b' :
                 '#dc2626';

    return {
      path: 'M 0,0 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0 M 0,-8 L 0,8 M -8,0 L 8,0',
      fillColor: color,
      fillOpacity: 0.7,
      strokeWeight: 2,
      strokeColor: '#ffffff',
      scale: 1,
    };
  };

  return (
    <Marker
      position={parking.location}
      onClick={onClick}
      icon={getMarkerIcon()}
      title={`${parking.name}: ${parking.availableSpots}/${parking.totalSpots} spots available`}
    />
  );
};

export default ParkingMarker;