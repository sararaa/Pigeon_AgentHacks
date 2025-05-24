import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import ControlPanel from './components/ControlPanel';
import TrafficStats from './components/TrafficStats';
import io from 'socket.io-client';
import './App.css';

function App() {
  const [agents, setAgents] = useState([]);
  const [trafficData, setTrafficData] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  
  useEffect(() => {
    const socket = io('http://localhost:8000');
    
    socket.on('state_update', (data) => {
      if (data.agents) {
        setAgents(data.agents);
      }
      if (data.traffic) {
        setTrafficData(data.traffic);
      }
    });
    
    return () => {
      socket.disconnect();
    };
  }, []);

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

export default App;