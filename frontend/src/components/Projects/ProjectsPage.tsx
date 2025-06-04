import React, { useState } from 'react';
import { useMap } from '../../contexts/MapContext';
import { Project } from '../../types';
import { Plus, Calendar, DollarSign, Edit2, Check, X, MapPin, Building2, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { geocodeAddress } from '../../utils/geocoding';

// Predefined colors for projects
const projectColors = [
  { name: 'Blue', value: '#2563eb' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Green', value: '#059669' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Pink', value: '#db2777' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Indigo', value: '#4f46e5' },
];

const ProjectsPage: React.FC = () => {
  const { projects, addProject, updateProject, deleteProject, setSelectedProject, mapInstance } = useMap();
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Project>>({});
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({
    name: '',
    description: '',
    status: 'planned',
    startDate: '',
    endDate: '',
    budget: 0,
    location: { lat: 34.1478, lng: -118.1445 },
    address: '',
    department: '',
    tags: [],
    color: projectColors[0].value
  });

  const handleEditClick = (project: Project) => {
    setEditingProject(project.id);
    setEditForm(project);
  };

  const validateDates = (startDate: string, endDate: string): boolean => {
    if (!startDate || !endDate) return true; // Don't validate if either date is empty
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>, isNewProject: boolean) => {
    const newStartDate = e.target.value;
    if (isNewProject) {
      const endDate = newProject.endDate;
      if (endDate && !validateDates(newStartDate, endDate)) {
        toast.error('Start date cannot be after end date');
        return;
      }
      setNewProject({ ...newProject, startDate: newStartDate });
    } else {
      const endDate = editForm.endDate || '';
      if (endDate && !validateDates(newStartDate, endDate)) {
        toast.error('Start date cannot be after end date');
        return;
      }
      setEditForm({ ...editForm, startDate: newStartDate });
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>, isNewProject: boolean) => {
    const newEndDate = e.target.value;
    if (isNewProject) {
      const startDate = newProject.startDate;
      if (startDate && !validateDates(startDate, newEndDate)) {
        toast.error('End date cannot be before start date');
        return;
      }
      setNewProject({ ...newProject, endDate: newEndDate });
    } else {
      const startDate = editForm.startDate || '';
      if (startDate && !validateDates(startDate, newEndDate)) {
        toast.error('End date cannot be before start date');
        return;
      }
      setEditForm({ ...editForm, endDate: newEndDate });
    }
  };

  const handleSaveEdit = async (projectId: string) => {
    if (!editForm.name || !editForm.description) {
      toast.error('Name and description are required');
      return;
    }

    if (!validateDates(editForm.startDate || '', editForm.endDate || '')) {
      toast.error('End date must be the same or after start date');
      return;
    }

    try {
      // If address was changed, update the location
      const currentProject = projects.find(p => p.id === projectId);
      if (editForm.address && editForm.address !== currentProject?.address) {
        const location = await geocodeAddress(editForm.address);
        editForm.location = location;
      }

      await updateProject({ ...currentProject!, ...editForm });
      setEditingProject(null);

      // Center map on the updated project location
      if (mapInstance && editForm.location) {
        mapInstance.panTo(editForm.location);
        mapInstance.setZoom(15);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update project');
      }
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProject.name || !newProject.description || !newProject.address) {
      toast.error('Name, description, and address are required');
      return;
    }

    if (!validateDates(newProject.startDate, newProject.endDate)) {
      toast.error('End date must be the same or after start date');
      return;
    }

    try {
      // Geocode the address to get coordinates
      const location = await geocodeAddress(newProject.address);
      const projectToAdd = {
        ...newProject,
        location
      };

      await addProject(projectToAdd);
      setIsAddingProject(false);

      // Center map on the new project location
      if (mapInstance) {
        mapInstance.panTo(location);
        mapInstance.setZoom(15);
      }

      setNewProject({
        name: '',
        description: '',
        status: 'planned',
        startDate: '',
        endDate: '',
        budget: 0,
        location: { lat: 34.1478, lng: -118.1445 },
        address: '',
        department: '',
        tags: [],
        color: projectColors[0].value
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create project');
      }
    }
  };

  const colorPickerJSX = (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Marker Color
      </label>
      <div className="grid grid-cols-8 gap-2">
        {projectColors.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => isAddingProject 
              ? setNewProject({ ...newProject, color: color.value })
              : setEditForm({ ...editForm, color: color.value })
            }
            className={`w-8 h-8 rounded-full border-2 ${
              (isAddingProject ? newProject.color : editForm.color) === color.value
                ? 'border-blue-500 dark:border-blue-400'
                : 'border-transparent'
            }`}
            style={{ backgroundColor: color.value }}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and track all city planning projects</p>
        </div>
        <button
          onClick={() => setIsAddingProject(true)}
          className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Project
        </button>
      </div>

      {/* Project List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timeline</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  {editingProject === project.id ? (
                    // Edit Mode
                    <td colSpan={6} className="px-6 py-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                            <input
                              type="text"
                              value={editForm.name || ''}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                            <input
                              type="text"
                              value={editForm.department || ''}
                              onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                          <textarea
                            value={editForm.description || ''}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                            <input
                              type="date"
                              value={editForm.startDate?.split('T')[0] || ''}
                              onChange={(e) => handleStartDateChange(e, false)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                            <input
                              type="date"
                              value={editForm.endDate?.split('T')[0] || ''}
                              onChange={(e) => handleEndDateChange(e, false)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget</label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-gray-500">$</span>
                              <input
                                type="number"
                                value={editForm.budget || 0}
                                onChange={(e) => setEditForm({ ...editForm, budget: Number(e.target.value) })}
                                className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select
                              value={editForm.status || 'planned'}
                              onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Project['status'] })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                            >
                              <option value="planned">Planned</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                          <input
                            type="text"
                            value={editForm.address || ''}
                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                          />
                        </div>

                        {colorPickerJSX}

                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setEditingProject(null)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(project.id)}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition-colors"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </td>
                  ) : (
                    // View Mode
                    <>
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center">
                            <div className="font-medium text-gray-900 dark:text-gray-100">{project.name}</div>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{project.description}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {project.address}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.status === 'planned' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' :
                          project.status === 'in-progress' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' :
                          'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        }`}>
                          {project.status === 'in-progress' ? 'In Progress' : 
                           project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(project.startDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs mt-1">
                            to {new Date(project.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {project.budget.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Building2 className="h-4 w-4 mr-1" />
                          {project.department}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditClick(project)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Project Modal */}
      {isAddingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Add New Project</h2>
              <button
                onClick={() => setIsAddingProject(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                  rows={3}
                  placeholder="Enter project description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => handleStartDateChange(e, true)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => handleEndDateChange(e, true)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Budget
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: Number(e.target.value) })}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                    placeholder="Enter budget amount"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value as Project['status'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                >
                  <option value="planned">Planned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={newProject.department}
                  onChange={(e) => setNewProject({ ...newProject, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                  placeholder="Enter department name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={newProject.address}
                  onChange={(e) => setNewProject({ ...newProject, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                  placeholder="Enter project address"
                />
              </div>

              {colorPickerJSX}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsAddingProject(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition-colors"
                >
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage; 