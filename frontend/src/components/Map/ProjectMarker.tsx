import React from 'react';
import { Marker } from '@react-google-maps/api';
import { Project } from '../../types';

interface ProjectMarkerProps {
  project: Project;
  isSelected: boolean;
  onClick: () => void;
}

const ProjectMarker: React.FC<ProjectMarkerProps> = ({ project, isSelected, onClick }) => {
  // Status colors - darker variants
  const getMarkerIcon = () => {
    let color = '#1E40AF'; // Darker blue
    
    switch (project.status) {
      case 'planned':
        color = '#6B21A8'; // Darker purple
        break;
      case 'in-progress':
        color = '#B45309'; // Darker amber
        break;
      case 'completed':
        color = '#065F46'; // Darker green
        break;
      case 'on-hold':
        color = '#A16207'; // Darker yellow
        break;
    }

    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: isSelected ? 1.0 : 0.9,
      strokeWeight: isSelected ? 3 : 2,
      strokeColor: '#ffffff',
      scale: isSelected ? 15 : 12,
    };
  };

  return (
    <Marker
      position={project.location}
      onClick={onClick}
      icon={getMarkerIcon()}
      zIndex={isSelected ? 1000 : 10}
    />
  );
};

export default ProjectMarker;