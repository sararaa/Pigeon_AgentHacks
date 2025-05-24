import React from 'react';
import { TrafficData } from '../../types';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Car, TrendingUp } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface TrafficOverviewProps {
  trafficData: TrafficData[];
}

const TrafficOverview: React.FC<TrafficOverviewProps> = ({ trafficData }) => {
  // Calculate average congestion
  const avgCongestion = trafficData.reduce((acc, curr) => acc + curr.congestionLevel, 0) / trafficData.length;
  
  // Calculate average speed
  const avgSpeed = trafficData.reduce((acc, curr) => acc + curr.averageSpeed, 0) / trafficData.length;
  
  // Total traffic volume
  const totalVolume = trafficData.reduce((acc, curr) => acc + curr.volume, 0);
  
  // Chart data
  const chartData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [
      {
        data: [
          trafficData.filter(t => t.congestionLevel < 50).length,
          trafficData.filter(t => t.congestionLevel >= 50 && t.congestionLevel < 75).length,
          trafficData.filter(t => t.congestionLevel >= 75).length
        ],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderColor: ['#ffffff', '#ffffff', '#ffffff'],
        borderWidth: 2,
      },
    ],
  };
  
  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((acc: number, val: number) => acc + val, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '65%',
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-full">
      <div className="flex items-center mb-4">
        <Car className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-800">Traffic Overview</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700 mb-1">Avg. Congestion</p>
          <div className="flex items-end">
            <span className="text-2xl font-semibold text-gray-800">{Math.round(avgCongestion)}%</span>
          </div>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700 mb-1">Avg. Speed</p>
          <div className="flex items-end">
            <span className="text-2xl font-semibold text-gray-800">{Math.round(avgSpeed)}</span>
            <span className="text-sm text-gray-600 ml-1 mb-0.5">mph</span>
          </div>
        </div>
      </div>
      
      <div className="h-40 mb-2">
        <Doughnut data={chartData} options={chartOptions} />
      </div>
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-500">Total Traffic Volume</p>
        <div className="flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
          <p className="text-xl font-semibold text-gray-800">{totalVolume.toLocaleString()}</p>
          <span className="text-xs text-gray-500 ml-1">vehicles/hr</span>
        </div>
      </div>
    </div>
  );
};

export default TrafficOverview;