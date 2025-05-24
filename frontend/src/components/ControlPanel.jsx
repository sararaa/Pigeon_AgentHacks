import React, { useCallback } from 'react';
import axios from 'axios';

export default function ControlPanel({ isRunning, setIsRunning }) {
  const handleSpawnAgents = useCallback(async () => {
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
  }, []);

  const toggleSimulation = useCallback(async () => {
    try {
      const endpoint = isRunning
        ? 'http://localhost:8000/api/simulation/stop'
        : 'http://localhost:8000/api/simulation/start';
      await axios.post(endpoint);
      setIsRunning(prev => !prev);
    } catch (error) {
      console.error('Error toggling simulation:', error);
    }
  }, [isRunning, setIsRunning]);

  return (
    <section className="p-5 mb-5 bg-gray-100 rounded-lg">
      <h3 className="text-xl font-semibold mb-3">Control Panel</h3>
      <div className="flex flex-col gap-3">
        <button
          onClick={handleSpawnAgents}
          disabled={isRunning}
          className={`py-2 px-5 rounded text-white border-none ${isRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`}
        >
          Spawn Agents
        </button>
        <button
          onClick={toggleSimulation}
          className={`py-2 px-5 rounded text-white border-none cursor-pointer ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {isRunning ? 'Stop Simulation' : 'Start Simulation'}
        </button>
      </div>
    </section>
  );
}
