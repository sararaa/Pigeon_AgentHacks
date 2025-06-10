import React from 'react';
import { Marker, Polyline, Polygon } from '@react-google-maps/api';
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
    <>
      {/* Main marker for all types */}
      <Marker
        position={project.location}
        onClick={onClick}
        icon={getMarkerIcon()}
        title={project.name}
      />

      {/* Line visualization */}
      {project.locationType === 'line' && project.coordinates && project.coordinates.length >= 2 && (
        <Polyline
          path={project.coordinates}
          options={{
            strokeColor: project.color,
            strokeOpacity: 0.8,
            strokeWeight: 3
          }}
        />
      )}

      {/* Area visualization */}
      {project.locationType === 'area' && project.coordinates && project.coordinates.length >= 3 && (
        <Polygon
          paths={project.coordinates}
          options={{
            fillColor: project.color,
            fillOpacity: 0.2,
            strokeColor: project.color,
            strokeOpacity: 0.8,
            strokeWeight: 2
          }}
        />
      )}
    </>
  );
};

export default ProjectMapMarker; 