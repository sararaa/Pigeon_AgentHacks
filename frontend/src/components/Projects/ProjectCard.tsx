import React from 'react';
import { Project } from '../../types';
import { MapPin, Calendar, DollarSign } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, isSelected, onClick }) => {
  const getStatusColor = () => {
    switch (project.status) {
      case 'planned': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'in-progress': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300';
      case 'completed': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'on-hold': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusText = () => {
    switch (project.status) {
      case 'planned': return 'Planned';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'on-hold': return 'On Hold';
      default: return 'Unknown';
    }
  };

  return (
    <div 
      className={`border dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/30 cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-md dark:shadow-lg dark:shadow-black/30' : 'border-gray-200'
      } bg-white dark:bg-gray-800`}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{project.name}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{project.description}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{project.address}</span>
          </div>
          
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>${project.budget.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap gap-1">
          {project.tags.map((tag, index) => (
            <span key={index} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;