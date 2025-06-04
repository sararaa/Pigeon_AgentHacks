import React, { useState } from 'react';
import { AreaMetrics, TrafficMetrics, InfrastructureMetrics, EnvironmentalMetrics } from '../../types';
import { areaMetrics, trafficMetrics, infrastructureMetrics, environmentalMetrics } from '../../data/analyticsData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { FaCity, FaCar, FaRoad, FaLeaf } from 'react-icons/fa';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsOverview: React.FC = () => {
  const [selectedArea, setSelectedArea] = useState<number>(1);

  const currentArea = areaMetrics.find(area => area.id === selectedArea);
  const currentTraffic = trafficMetrics.find(traffic => traffic.areaId === selectedArea);
  const currentInfra = infrastructureMetrics.find(infra => infra.areaId === selectedArea);
  const currentEnv = environmentalMetrics.find(env => env.areaId === selectedArea);

  const zoneData = [
    { name: 'Commercial', value: currentArea?.commercialZones || 0 },
    { name: 'Residential', value: currentArea?.residentialZones || 0 },
    { name: 'Mixed Use', value: currentArea?.mixedUseZones || 0 },
  ];

  const trafficData = [
    { name: 'Peak Hour Volume', value: currentTraffic?.peakHourVolume || 0 },
    { name: 'Transit Ridership', value: currentTraffic?.publicTransitRidership || 0 },
    { name: 'Parking Occupancy', value: currentTraffic?.parkingOccupancy || 0 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Analytics Overview</h2>
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(Number(e.target.value))}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
        >
          {areaMetrics.map(area => (
            <option key={area.id} value={area.id}>{area.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <FaCity className="text-2xl text-blue-500" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Area Overview</h3>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-300">Population: {currentArea?.population.toLocaleString()}</p>
            <p className="text-gray-600 dark:text-gray-300">Density: {currentArea?.density}/km²</p>
            <p className="text-gray-600 dark:text-gray-300">Land Area: {currentArea?.landArea} km²</p>
          </div>
          <div className="mt-4">
            <PieChart width={200} height={200}>
              <Pie
                data={zoneData}
                cx={100}
                cy={100}
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {zoneData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <FaCar className="text-2xl text-green-500" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Traffic Metrics</h3>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-300">Congestion Index: {currentTraffic?.congestionIndex}%</p>
            <p className="text-gray-600 dark:text-gray-300">Avg Speed: {currentTraffic?.avgSpeed} mph</p>
            <p className="text-gray-600 dark:text-gray-300">Accident Rate: {currentTraffic?.accidentRate}</p>
          </div>
          <div className="mt-4">
            <BarChart width={200} height={200} data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <FaRoad className="text-2xl text-yellow-500" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Infrastructure</h3>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-300">Road Condition: {currentInfra?.roadConditionIndex}%</p>
            <p className="text-gray-600 dark:text-gray-300">Bridge Health: {currentInfra?.bridgeHealthScore}%</p>
            <p className="text-gray-600 dark:text-gray-300">Projects: {currentInfra?.constructionProjects}</p>
          </div>
          <div className="mt-4">
            <LineChart width={200} height={200} data={[
              { name: 'Maintenance', value: currentInfra?.maintenanceBacklog || 0 },
              { name: 'Projects', value: currentInfra?.constructionProjects || 0 },
              { name: 'Planned', value: currentInfra?.plannedImprovements || 0 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <FaLeaf className="text-2xl text-red-500" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Environmental</h3>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-300">Air Quality: {currentEnv?.airQualityIndex}</p>
            <p className="text-gray-600 dark:text-gray-300">Noise Level: {currentEnv?.noiseLevel} dB</p>
            <p className="text-gray-600 dark:text-gray-300">Green Space: {currentEnv?.greenSpaceCoverage}%</p>
          </div>
          <div className="mt-4">
            <BarChart width={200} height={200} data={[
              { name: 'Air Quality', value: currentEnv?.airQualityIndex || 0 },
              { name: 'Recycling', value: currentEnv?.wasteRecyclingRate || 0 },
              { name: 'Tree Cover', value: currentEnv?.treeCanopyCoverage || 0 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#ff7675" />
            </BarChart>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview; 