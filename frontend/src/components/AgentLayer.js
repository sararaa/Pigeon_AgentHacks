// frontend/src/components/AgentLayer.js
import React, { useEffect, useRef } from 'react';
import { OverlayView } from '@react-google-maps/api';

const AGENT_COLORS = {
  normal: '#00ff00',
  medium_stress: '#ffff00',
  high_stress: '#ff0000',
  stuck: '#ff0000',
  rethinking: '#ff00ff'
};

function AgentLayer({ agents, map }) {
  const markersRef = useRef({});

  useEffect(() => {
    if (!map) return;

    // Update or create markers
    agents.forEach(agent => {
      if (markersRef.current[agent.id]) {
        // Update existing marker
        updateAgentMarker(markersRef.current[agent.id], agent);
      } else {
        // Create new marker
        markersRef.current[agent.id] = createAgentMarker(agent, map);
      }
    });

    // Remove markers for agents that no longer exist
    Object.keys(markersRef.current).forEach(agentId => {
      if (!agents.find(a => a.id === agentId)) {
        markersRef.current[agentId].setMap(null);
        delete markersRef.current[agentId];
      }
    });
  }, [agents, map]);

  return null;
}

function createAgentMarker(agent, map) {
  const color = getAgentColor(agent);
  
  const marker = new window.google.maps.Marker({
    position: agent.position,
    map: map,
    icon: {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 6,
      fillColor: color,
      fillOpacity: 0.8,
      strokeColor: 'white',
      strokeWeight: 2,
    },
    zIndex: 1000,
  });

  // Add info window
  const infoWindow = new window.google.maps.InfoWindow({
    content: getAgentInfoContent(agent)
  });

  marker.addListener('click', () => {
    infoWindow.open(map, marker);
  });

  return marker;
}

function updateAgentMarker(marker, agent) {
  marker.setPosition(agent.position);
  
  const color = getAgentColor(agent);
  marker.setIcon({
    path: window.google.maps.SymbolPath.CIRCLE,
    scale: agent.is_rethinking ? 8 : 6,
    fillColor: color,
    fillOpacity: 0.8,
    strokeColor: 'white',
    strokeWeight: 2,
  });
}

function getAgentColor(agent) {
  if (agent.is_stuck) return AGENT_COLORS.stuck;
  if (agent.is_rethinking) return AGENT_COLORS.rethinking;
  if (agent.stress_level > 0.7) return AGENT_COLORS.high_stress;
  if (agent.stress_level > 0.3) return AGENT_COLORS.medium_stress;
  return AGENT_COLORS.normal;
}

function getAgentInfoContent(agent) {
  return `
    <div style="padding: 10px;">
      <strong>Agent ${agent.id.substring(0, 8)}</strong><br/>
      Personality: ${agent.personality}<br/>
      Stress Level: ${(agent.stress_level * 100).toFixed(1)}%<br/>
      Status: ${agent.is_stuck ? 'Stuck' : agent.is_rethinking ? 'Rethinking' : 'Moving'}<br/>
      Progress: ${(agent.route_progress * 100).toFixed(1)}%
    </div>
  `;
}

export default AgentLayer;