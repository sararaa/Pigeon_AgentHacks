import React from 'react';
import axios from 'axios';

function ControlPanel({ isRunning, setIsRunning }) {
  const handleSpawnAgents = async () => {
    try {
      await axios.post('http://localhost:8000/api/agents/spawn', {
        count: 10,
        bounds: {
          north: 37.8049,
          south: 37.7449,
          east: -122.3894,
          west: -122.4494
        }
      });
    } catch (error) {
      console.error('Error spawning agents:', error);
    }
  };
  
  const toggleSimulation = async () => {
    try {
      if (isRunning) {
        await axios.post('http://localhost:8000/api/simulation/stop');
      } else {
        await axios.post('http://localhost:8000/api/simulation/start');
      }
      setIsRunning(!isRunning);
    } catch (error) {
      console.error('Error toggling simulation:', error);
    }
  };
  
  return (
    <div style={{ padding: '20px', marginBottom: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <h3>Control Panel</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button 
          onClick={handleSpawnAgents}
          disabled={isRunning}
          style={{
            padding: '10px 20px',
            backgroundColor: isRunning ? '#ccc' : '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          Spawn Agents
        </button>
        <button 
          onClick={toggleSimulation}
          style={{
            padding: '10px 20px',
            backgroundColor: isRunning ? '#d32f2f' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isRunning ? 'Stop Simulation' : 'Start Simulation'}
        </button>
      </div>
    </div>
  );
}

export default ControlPanel;