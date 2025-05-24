import React from 'react';
import { Marker } from '@react-google-maps/api';
import { Project } from '../../types';

interface ProjectMarkerProps {
  project: Project;
  isSelected: boolean;
  onClick: () => void;
}

const ProjectMarker: React.FC<ProjectMarkerProps> = ({ project, isSelected, onClick }) => {
  // Status colors
  const getMarkerIcon = () => {
    let color = '#2563EB'; // Default blue
    
    switch (project.status) {
      case 'planned':
        color = '#9333EA'; // Purple
        break;
      case 'in-progress':
        color = '#F59E0B'; // Amber
        break;
      case 'completed':
        color = '#10B981'; // Green
        break;
    }

    return {
      path: 'M12 0C5.4 0 0 5.4 0 12c0 6.6 5.4 12 12 12 6.6 0 12-5.4 12-12C24 5.4 18.6 0 12 0zm0 2c5.5 0 10 4.5 10 10 0 5.5-4.5 10-10 10-5.5 0-10-4.5-10-10C2 6.5 6.5 2 12 2zm1 5v7.6l5.7 3.3-1 1.7-6.7-4V7z',
      fillColor: color,
      fillOpacity: isSelected ? 1.0 : 0.8,
      strokeWeight: isSelected ? 2 : 1,
      strokeColor: '#fff',
      scale: isSelected ? 1.3 : 1.0,
      anchor: new google.maps.Point(12, 12),
    };
  };

  return (
    <Marker
      position={project.location}
      onClick={onClick}
      icon={getMarkerIcon()}
      animation={isSelected ? google.maps.Animation.BOUNCE : undefined}
      zIndex={isSelected ? 1000 : 10}
    />
  );
};

export default ProjectMarker;