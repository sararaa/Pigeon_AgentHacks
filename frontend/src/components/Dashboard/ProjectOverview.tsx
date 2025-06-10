import React from 'react';
import { Project } from '../../types';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Building, DollarSign } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ProjectOverviewProps {
  projects: Project[];
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ projects }) => {
  const { isDarkMode } = useTheme();

  // Count by status
  const plannedCount = projects.filter(p => p.status === 'planned').length;
  const inProgressCount = projects.filter(p => p.status === 'in-progress').length;
  const completedCount = projects.filter(p => p.status === 'completed').length;
  const onHoldCount = projects.filter(p => p.status === 'on-hold').length;
  
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

  const onHoldBudget = projects
    .filter(p => p.status === 'on-hold')
    .reduce((acc, curr) => acc + curr.budget, 0);
  
  // Chart data
  const chartData = {
    labels: ['Planned', 'In Progress', 'Completed', 'On Hold'],
    datasets: [
      {
        data: [plannedCount, inProgressCount, completedCount, onHoldCount],
        backgroundColor: ['#9333EA', '#F59E0B', '#10B981', '#EAB308'],
        borderColor: [isDarkMode ? '#1F2937' : '#ffffff', isDarkMode ? '#1F2937' : '#ffffff', isDarkMode ? '#1F2937' : '#ffffff', isDarkMode ? '#1F2937' : '#ffffff'],
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
          color: isDarkMode ? '#D1D5DB' : '#374151',
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
        titleColor: isDarkMode ? '#D1D5DB' : '#111827',
        bodyColor: isDarkMode ? '#D1D5DB' : '#374151',
        borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
        borderWidth: 1,
      }
    },
    cutout: '65%',
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full transition-colors duration-200">
      <div className="flex items-center mb-4">
        <Building className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Project Overview</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Total Projects</p>
          <div className="flex items-end">
            <span className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{projects.length}</span>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Total Budget</p>
          <div className="flex items-end">
            <span className="text-2xl font-semibold text-gray-800 dark:text-gray-200">${(totalBudget / 1000000).toFixed(1)}M</span>
          </div>
        </div>
      </div>
      
      <div className="h-40 mb-2">
        <Doughnut data={chartData} options={chartOptions} />
      </div>
      
      <p className="text-sm text-gray-500 dark:text-gray-400">Budget Allocation</p>
      <div className="flex items-center justify-center space-x-4 text-xs mt-1">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-600 dark:bg-purple-500 rounded-full mr-1"></div>
          <span className="text-gray-600 dark:text-gray-300">${(plannedBudget / 1000000).toFixed(1)}M</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-amber-500 dark:bg-amber-400 rounded-full mr-1"></div>
          <span className="text-gray-600 dark:text-gray-300">${(inProgressBudget / 1000000).toFixed(1)}M</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-600 dark:bg-green-500 rounded-full mr-1"></div>
          <span className="text-gray-600 dark:text-gray-300">${(completedBudget / 1000000).toFixed(1)}M</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 dark:bg-yellow-400 rounded-full mr-1"></div>
          <span className="text-gray-600 dark:text-gray-300">${(onHoldBudget / 1000000).toFixed(1)}M</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;