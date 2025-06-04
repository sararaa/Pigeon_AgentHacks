import React, { useState } from 'react';
import { useMap } from '../../contexts/MapContext';
import { Project } from '../../types';
import {
  Clock,
  BarChart3,
  Calendar,
  DollarSign,
  MapPin,
  Check,
  Timer,
  AlertCircle
} from 'lucide-react';
import ProjectCard from './ProjectCard';

const ProjectList: React.FC = () => {
  const { projects, selectedProject, setSelectedProject } = useMap();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProjects = statusFilter === 'all'
    ? projects
    : projects.filter(project => project.status === statusFilter);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 flex flex-wrap items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">City Projects</h3>

        <div className="flex space-x-1 mt-2 sm:mt-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 text-sm rounded-md transition-colors duration-150 ${
              statusFilter === 'all'
                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('planned')}
            className={`px-3 py-1 text-sm rounded-md transition-colors duration-150 ${
              statusFilter === 'planned'
                ? 'bg-purple-600 dark:bg-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Planned
          </button>
          <button
            onClick={() => setStatusFilter('in-progress')}
            className={`px-3 py-1 text-sm rounded-md transition-colors duration-150 ${
              statusFilter === 'in-progress'
                ? 'bg-amber-500 dark:bg-amber-400 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 text-sm rounded-md transition-colors duration-150 ${
              statusFilter === 'completed'
                ? 'bg-green-600 dark:bg-green-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Completed
          </button>
        </div>
      </div>
      
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              isSelected={selectedProject?.id === project.id}
              onClick={() => setSelectedProject(project)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
            No projects found with the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;