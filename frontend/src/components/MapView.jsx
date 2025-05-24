import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline, Circle, Polygon } from '@react-google-maps/api';
import io from 'socket.io-client';

const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

const center = {
  lat: 37.7749,
  lng: -122.4194
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

const TrafficMap = () => {
  const [agents, setAgents] = useState([]);
  const [roadBlocks, setRoadBlocks] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({
    total_agents: 0,
    avg_stress: 0,
    stuck_agents: 0,
    rethinking_agents: 0
  });
  const [map, setMap] = useState(null);
  const socketRef = useRef(null);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [roadBlockMode, setRoadBlockMode] = useState(false);
  const [placeAgentMode, setPlaceAgentMode] = useState(false);
  const [agentOrigin, setAgentOrigin] = useState(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    socketRef.current = io('http://localhost:8000');
    
    socketRef.current.on('connect', () => {
      console.log('Connected to Socket.IO server');
      setIsConnected(true);
    });
    
    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      setIsConnected(false);
    });
    
    socketRef.current.on('traffic_update', (data) => {
      try {
        const update = typeof data === 'string' ? JSON.parse(data) : data;
        console.log('Traffic update received:', update);
        
        if (update.agents) {
          setAgents(update.agents);
        }
        
        if (update.road_conditions) {
          const blocks = Object.entries(update.road_conditions).map(([key, value]) => ({
            id: key,
            position: value.location
          }));
          setRoadBlocks(blocks);
        }
        
        if (update.stats) {
          setStats(update.stats);
        }
      } catch (error) {
        console.error('Error parsing traffic update:', error);
      }
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const startSimulation = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/simulation/start', {
        method: 'POST'
      });
      const data = await response.json();
      console.log('Simulation started:', data);
      setIsSimulationRunning(true);
    } catch (error) {
      console.error('Error starting simulation:', error);
    }
  };

  const stopSimulation = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/simulation/stop', {
        method: 'POST'
      });
      const data = await response.json();
      console.log('Simulation stopped:', data);
      setIsSimulationRunning(false);
    } catch (error) {
      console.error('Error stopping simulation:', error);
    }
  };

  const spawnAgents = async (origin = null, destination = null) => {
    try {
      const body = origin && destination ? {
        count: 1,
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng }
      } : {
        count: 5,
        bounds: {
          north: center.lat + 0.01,
          south: center.lat - 0.01,
          east: center.lng + 0.01,
          west: center.lng - 0.01
        }
      };
      
      const response = await fetch('http://localhost:8000/api/agents/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      console.log('Agents spawned:', data);
    } catch (error) {
      console.error('Error spawning agents:', error);
    }
  };

  const handleMapClick = async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    if (roadBlockMode) {
      // Place road block
      try {
        const response = await fetch('http://localhost:8000/api/roads/block', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lng })
        });
        const data = await response.json();
        console.log('Road blocked:', data);
      } catch (error) {
        console.error('Error blocking road:', error);
      }
    } else if (placeAgentMode) {
      // Place agent with custom route
      if (!agentOrigin) {
        // Set origin
        setAgentOrigin({ lat, lng });
        alert('Origin set! Now click the destination.');
      } else {
        // Set destination and spawn agent
        await spawnAgents(agentOrigin, { lat, lng });
        setAgentOrigin(null);
        setPlaceAgentMode(false);
        alert('Agent spawned with custom route!');
      }
    }
  };

  const removeRoadBlock = async (blockId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/roads/block/${blockId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      console.log('Road unblocked:', data);
    } catch (error) {
      console.error('Error removing road block:', error);
    }
  };

  const getAgentColor = (agent) => {
    // Color based on stress level
    const stress = agent.stress_level || 0;
    if (stress > 0.7) return '#ff0000'; // Red for high stress
    if (stress > 0.4) return '#ff9900'; // Orange for medium stress
    return '#00ff00'; // Green for low stress
  };

  const getAgentIcon = (agent) => {
    const color = getAgentColor(agent);
    
    // Add a pulsing effect for stressed agents
    if (agent.is_rethinking) {
      return {
        path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
        fillColor: '#ff00ff', // Purple for rethinking
        fillOpacity: 0.9,
        strokeColor: '#fff',
        strokeWeight: 3,
        scale: 1.2,
        anchor: { x: 12, y: 12 }
      };
    }
    
    if (agent.is_stuck) {
      return {
        path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
        fillColor: '#000000', // Black for stuck
        fillOpacity: 0.9,
        strokeColor: '#fff',
        strokeWeight: 2,
        scale: 0.8,
        anchor: { x: 12, y: 12 }
      };
    }
    
    return {
      path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
      fillColor: color,
      fillOpacity: 0.8,
      strokeColor: '#000',
      strokeWeight: 1,
      scale: agent.stress_level > 0.7 ? 1.0 : 0.8,
      anchor: { x: 12, y: 12 }
    };
  };

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <div style={{ 
        marginBottom: '10px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Traffic Simulation Control</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <span style={{ 
            marginRight: '20px',
            padding: '5px 10px',
            borderRadius: '4px',
            backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
            color: isConnected ? '#155724' : '#721c24'
          }}>
            {isConnected ? '✅ Connected' : '❌ Disconnected'}
          </span>
          <span style={{
            padding: '5px 10px',
            borderRadius: '4px',
            backgroundColor: isSimulationRunning ? '#cce5ff' : '#e2e3e5',
            color: isSimulationRunning ? '#004085' : '#383d41'
          }}>
            {isSimulationRunning ? '▶️ Running' : '⏸️ Stopped'}
          </span>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <button 
            onClick={startSimulation} 
            disabled={isSimulationRunning}
            style={{
              padding: '8px 16px',
              marginRight: '10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSimulationRunning ? 'not-allowed' : 'pointer',
              opacity: isSimulationRunning ? 0.6 : 1
            }}
          >
            ▶️ Start Simulation
          </button>
          <button 
            onClick={stopSimulation} 
            disabled={!isSimulationRunning}
            style={{
              padding: '8px 16px',
              marginRight: '10px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: !isSimulationRunning ? 'not-allowed' : 'pointer',
              opacity: !isSimulationRunning ? 0.6 : 1
            }}
          >
            ⏹️ Stop Simulation
          </button>
          <button 
            onClick={() => spawnAgents()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🚗 Spawn 5 Random Agents
          </button>
        </div>
        
        <div style={{ 
          marginBottom: '15px',
          padding: '10px',
          backgroundColor: '#e9ecef',
          borderRadius: '4px'
        }}>
          <strong>Map Interaction Modes:</strong>
          <div style={{ marginTop: '10px' }}>
            <button 
              onClick={() => {
                setRoadBlockMode(!roadBlockMode);
                setPlaceAgentMode(false);
                setAgentOrigin(null);
              }}
              style={{ 
                marginRight: '10px',
                backgroundColor: roadBlockMode ? '#ff6b6b' : '#ffffff',
                color: roadBlockMode ? 'white' : '#333',
                border: roadBlockMode ? 'none' : '1px solid #ddd',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
            >
              🚧 {roadBlockMode ? 'Road Block Mode ON' : 'Road Block Mode OFF'}
            </button>
            
            <button 
              onClick={() => {
                setPlaceAgentMode(!placeAgentMode);
                setRoadBlockMode(false);
                setAgentOrigin(null);
              }}
              style={{ 
                backgroundColor: placeAgentMode ? '#4dabf7' : '#ffffff',
                color: placeAgentMode ? 'white' : '#333',
                border: placeAgentMode ? 'none' : '1px solid #ddd',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
            >
              🚗 {placeAgentMode ? 'Custom Route Mode ON' : 'Custom Route Mode OFF'}
            </button>
          </div>
          
          <div style={{ 
            marginTop: '10px', 
            fontSize: '14px', 
            color: '#495057',
            fontStyle: 'italic'
          }}>
            {roadBlockMode && '👆 Click anywhere on the map to place a yellow road block. Click existing blocks to remove them.'}
            {placeAgentMode && !agentOrigin && '👆 Click on the map to set the agent\'s starting point (green marker).'}
            {placeAgentMode && agentOrigin && '👆 Now click to set the destination. The agent will navigate between these points.'}
            {!roadBlockMode && !placeAgentMode && '💡 Use the buttons above to interact with the map. Yellow blocks will make agents reroute!'}
          </div>
        </div>
        
        <div style={{ 
          padding: '10px',
          backgroundColor: '#fff3cd',
          borderRadius: '4px',
          border: '1px solid #ffeaa7'
        }}>
          <strong>📊 Live Statistics:</strong>
          <div style={{ marginTop: '5px', fontSize: '14px' }}>
            <span style={{ marginRight: '15px' }}>🚗 Agents: <strong>{stats.total_agents}</strong></span>
            <span style={{ marginRight: '15px' }}>😰 Avg Stress: <strong>{(stats.avg_stress * 100).toFixed(1)}%</strong></span>
            <span style={{ marginRight: '15px' }}>🛑 Stuck: <strong>{stats.stuck_agents}</strong></span>
            <span>🤔 Rethinking: <strong>{stats.rethinking_agents}</strong></span>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#e8f4f8',
          borderRadius: '4px',
          border: '1px solid #bee5eb',
          fontSize: '12px'
        }}>
          <strong>🎨 Agent Colors:</strong>
          <div style={{ marginTop: '5px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <span>🟢 Green = Low Stress</span>
            <span>🟠 Orange = Medium Stress</span>
            <span>🔴 Red = High Stress</span>
            <span>🟣 Purple = Rethinking Route</span>
            <span>⚫ Black = Stuck</span>
          </div>
        </div>
      </div>
      
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={13}
          options={mapOptions}
          onClick={handleMapClick}
          onLoad={setMap}
        >
          {/* Render agents */}
          {agents.map((agent) => (
            <Marker
              key={agent.id}
              position={{
                lat: agent.position.lat,
                lng: agent.position.lng
              }}
              icon={getAgentIcon(agent)}
              title={`Agent: ${agent.id}\nStress: ${(agent.stress_level * 100).toFixed(1)}%\nPersonality: ${agent.personality}`}
            />
          ))}
          
          {/* Render road blocks */}
          {roadBlocks.map((block) => {
            // Create a rectangle around the block position
            const size = 0.0005; // Approximately 50 meters
            const paths = [
              { lat: block.position.lat - size, lng: block.position.lng - size },
              { lat: block.position.lat - size, lng: block.position.lng + size },
              { lat: block.position.lat + size, lng: block.position.lng + size },
              { lat: block.position.lat + size, lng: block.position.lng - size }
            ];
            
            return (
              <Polygon
                key={block.id}
                paths={paths}
                options={{
                  fillColor: '#FFD700',
                  fillOpacity: 0.7,
                  strokeColor: '#FFA500',
                  strokeOpacity: 1,
                  strokeWeight: 3,
                  clickable: true
                }}
                onClick={() => {
                  if (window.confirm('Remove this road block?')) {
                    removeRoadBlock(block.id);
                  }
                }}
              />
            );
          })}
          
          {/* Show origin marker when placing agent */}
          {agentOrigin && (
            <Marker
              position={agentOrigin}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: '#00ff00',
                fillOpacity: 0.8,
                strokeColor: '#000',
                strokeWeight: 2,
                scale: 8
              }}
              title="Agent Origin"
            />
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default TrafficMap;