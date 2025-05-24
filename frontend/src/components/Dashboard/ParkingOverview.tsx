import React from 'react';
import { ParkingData } from '../../types';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { ParkingSquare, Clock } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ParkingOverviewProps {
  parkingData: ParkingData[];
}

const ParkingOverview: React.FC<ParkingOverviewProps> = ({ parkingData }) => {
  // Calculate totals
  const totalSpots = parkingData.reduce((acc, curr) => acc + curr.totalSpots, 0);
  const availableSpots = parkingData.reduce((acc, curr) => acc + curr.availableSpots, 0);
  const occupiedSpots = totalSpots - availableSpots;
  const occupancyRate = Math.round((occupiedSpots / totalSpots) * 100);
  
  // Average duration
  const avgDuration = Math.round(
    parkingData.reduce((acc, curr) => acc + curr.averageDuration, 0) / parkingData.length
  );
  
  // Chart data
  const chartData = {
    labels: ['Available', 'Occupied'],
    datasets: [
      {
        data: [availableSpots, occupiedSpots],
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: ['#ffffff', '#ffffff'],
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
            const percentage = Math.round((value / totalSpots) * 100);
            return `${label}: ${value} spots (${percentage}%)`;
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
        <ParkingSquare className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-800">Parking Overview</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700 mb-1">Available Spots</p>
          <div className="flex items-end">
            <span className="text-2xl font-semibold text-gray-800">{availableSpots}</span>
            <span className="text-xs text-gray-500 ml-1 mb-0.5">/ {totalSpots}</span>
          </div>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700 mb-1">Occupancy Rate</p>
          <div className="flex items-end">
            <span className="text-2xl font-semibold text-gray-800">{occupancyRate}%</span>
          </div>
        </div>
      </div>
      
      <div className="h-40 mb-2">
        <Doughnut data={chartData} options={chartOptions} />
      </div>
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-500">Average Parking Duration</p>
        <div className="flex items-center justify-center">
          <Clock className="h-4 w-4 text-blue-600 mr-1" />
          <p className="text-xl font-semibold text-gray-800">{avgDuration}</p>
          <span className="text-xs text-gray-500 ml-1">minutes</span>
        </div>
      </div>
    </div>
  );
};

export default ParkingOverview;