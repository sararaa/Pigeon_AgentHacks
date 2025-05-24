import React from 'react';
import { useMap } from '../../contexts/MapContext';
import TrafficOverview from './TrafficOverview';
import ParkingOverview from './ParkingOverview';
import ProjectOverview from './ProjectOverview';

const DataDashboard: React.FC = () => {
  const { trafficData, parkingData, projects } = useMap();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <TrafficOverview trafficData={trafficData} />
      <ParkingOverview parkingData={parkingData} />
      <ProjectOverview projects={projects} />
    </div>
  );
};

export default DataDashboard;