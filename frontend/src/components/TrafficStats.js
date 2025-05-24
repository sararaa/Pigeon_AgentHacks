import React from 'react';

function TrafficStats({ trafficData, agents }) {
  const congestionLevels = Object.values(trafficData).reduce((acc, segment) => {
    acc[segment.congestionLevel] = (acc[segment.congestionLevel] || 0) + 1;
    return acc;
  }, {});
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <h3>Traffic Statistics</h3>
      <div>
        <p>Active Agents: {agents.length}</p>
        <p>Road Segments: {Object.keys(trafficData).length}</p>
        <div>
          <h4>Congestion Levels:</h4>
          {Object.entries(congestionLevels).map(([level, count]) => (
            <p key={level} style={{ margin: '5px 0' }}>
              <span style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: level === 'low' ? '#00FF00' : 
                                level === 'medium' ? '#FFFF00' : 
                                level === 'high' ? '#FFA500' : '#FF0000',
                marginRight: '8px'
              }}></span>
              {level}: {count}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrafficStats;