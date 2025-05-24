import React from 'react';

export default function TrafficStats({ trafficData, agents }) {
    const congestionLevels = Object.values(trafficData).reduce((acc, segment) => {
      acc[segment.congestionLevel] = (acc[segment.congestionLevel] || 0) + 1;
      return acc;
    }, {});
  
    return (
      <section className="p-5 bg-gray-100 rounded-lg">
        <h3 className="text-xl font-semibold mb-3">Traffic Statistics</h3>
        <p>Active Agents: {agents.length}</p>
        <p>Road Segments: {Object.keys(trafficData).length}</p>
        <div className="mt-3">
          <h4 className="font-semibold mb-2">Congestion Levels:</h4>
          {Object.entries(congestionLevels).map(([level, count]) => (
            <p key={level} className="mb-1 flex items-center">
              <span
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{
                  backgroundColor:
                    level === 'low'
                      ? '#00FF00'
                      : level === 'medium'
                      ? '#FFFF00'
                      : level === 'high'
                      ? '#FFA500'
                      : '#FF0000'
                }}
              ></span>
              {level}: {count}
            </p>
          ))}
        </div>
      </section>
    );
  }