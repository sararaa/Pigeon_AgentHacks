import React from 'react';
import { Marker } from '@react-google-maps/api';
import { Project } from '../../types';

interface ProjectMapMarkerProps {
  project: Project;
  onClick: () => void;
}

const ProjectMapMarker: React.FC<ProjectMapMarkerProps> = ({ project, onClick }) => {
  const getMarkerIcon = () => {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: project.color,
      fillOpacity: 0.9,
      strokeWeight: 2,
      strokeColor: '#ffffff',
      scale: 12,
    };
  };

  return (
    <Marker
      position={project.location}
      onClick={onClick}
      icon={getMarkerIcon()}
      title={project.name}
    />
  );
};

export default ProjectMapMarker; 