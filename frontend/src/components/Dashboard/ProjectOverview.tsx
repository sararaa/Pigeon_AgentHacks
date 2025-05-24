import React from 'react';
import { Project } from '../../types';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Building, DollarSign } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ProjectOverviewProps {
  projects: Project[];
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ projects }) => {
  // Count by status
  const plannedCount = projects.filter(p => p.status === 'planned').length;
  const inProgressCount = projects.filter(p => p.status === 'in-progress').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;
  
  // Calculate total budget
  const totalBudget = projects.reduce((acc, curr) => acc + curr.budget, 0);
  
  // Calculate budget allocation by status
  const plannedBudget = projects
    .filter(p => p.status === 'planned')
    .reduce((acc, curr) => acc + curr.budget, 0);
    
  const inProgressBudget = projects
    .filter(p => p.status === 'in-progress')
    .reduce((acc, curr) => acc + curr.budget, 0);
    
  const completedBudget = projects
    .filter(p => p.status === 'completed')
    .reduce((acc, curr) => acc + curr.budget, 0);
  
  // Chart data
  const chartData = {
    labels: ['Planned', 'In Progress', 'Completed'],
    datasets: [
      {
        data: [plannedCount, inProgressCount, completedCount],
        backgroundColor: ['#9333EA', '#F59E0B', '#10B981'],
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
    },
    cutout: '65%',
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-full">
      <div className="flex items-center mb-4">
        <Building className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-800">Project Overview</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700 mb-1">Total Projects</p>
          <div className="flex items-end">
            <span className="text-2xl font-semibold text-gray-800">{projects.length}</span>
          </div>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700 mb-1">Total Budget</p>
          <div className="flex items-end">
            <span className="text-2xl font-semibold text-gray-800">${(totalBudget / 1000000).toFixed(1)}M</span>
          </div>
        </div>
      </div>
      
      <div className="h-40 mb-2">
        <Doughnut data={chartData} options={chartOptions} />
      </div>
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-500">Budget Allocation</p>
        <div className="flex items-center justify-center space-x-4 text-xs mt-1">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-600 rounded-full mr-1"></div>
            <span>${(plannedBudget / 1000000).toFixed(1)}M</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-amber-500 rounded-full mr-1"></div>
            <span>${(inProgressBudget / 1000000).toFixed(1)}M</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-600 rounded-full mr-1"></div>
            <span>${(completedBudget / 1000000).toFixed(1)}M</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;