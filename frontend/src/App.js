// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { LoadScript } from '@react-google-maps/api';
import MapView from './components/MapView';
import ControlPanel from './components/ControlPanel';
import StatsDisplay from './components/StatsDisplay';
import { WebSocketProvider } from './services/websocket';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const libraries = ['places', 'geometry'];

function App() {
  const [agents, setAgents] = useState([]);
  const [roadConditions, setRoadConditions] = useState({});
  const [stats, setStats] = useState({});
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        libraries={libraries}
      >
        <WebSocketProvider
          url={`${process.env.REACT_APP_BACKEND_URL}/ws`}
          onMessage={(data) => {
            if (data.agents) setAgents(data.agents);
            if (data.road_conditions) setRoadConditions(data.road_conditions);
            if (data.stats) setStats(data.stats);
          }}
        >
          <Box sx={{ display: 'flex', height: '100vh' }}>
            <MapView
              agents={agents}
              roadConditions={roadConditions}
            />
            <Box sx={{ width: 400, display: 'flex', flexDirection: 'column' }}>
              <ControlPanel
                isRunning={isSimulationRunning}
                onToggleSimulation={setIsSimulationRunning}
              />
              <StatsDisplay stats={stats} />
            </Box>
          </Box>
        </WebSocketProvider>
      </LoadScript>
    </ThemeProvider>
  );
}

export default App;