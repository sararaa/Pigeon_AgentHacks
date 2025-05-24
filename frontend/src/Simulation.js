import MapView from './components/MapView';
import ControlPanel from './components/ControlPanel';
import TrafficStats from './components/TrafficStats';
import React, { useState } from 'react'; 
import './styles/Simulation.css';

function Simulation() {
  const [agents, setAgents] = useState([]);
  const [roadConditions, setRoadConditions] = useState({});
  const [stats, setStats] = useState({});
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);

  return (
    <div className="App">
      <div className="main-container">
        <MapView 
          agents={agents}
          trafficData={trafficData}
        />
        <div className="sidebar">
          <ControlPanel 
            isRunning={isRunning}
            setIsRunning={setIsRunning}
            setAgents={setAgents}
          />
          <TrafficStats 
            trafficData={trafficData}
            agents={agents}
          />
        </div>
      </div>
    </div>
  );
}

export default Simulation;