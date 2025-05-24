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
      case 'planned': return 'bg-purple-100 text-purple-800';
      case 'in-progress': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (project.status) {
      case 'planned': return 'Planned';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  return (
    <div 
      className={`border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer ${isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'border-gray-200'}`}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900 line-clamp-1">{project.name}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{project.address}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>${project.budget.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <div className="flex flex-wrap gap-1">
          {project.tags.map((tag, index) => (
            <span key={index} className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;