import { Project } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'pasadena_projects';

const validateDates = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

export const getStoredProjects = (): Project[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveProject = (project: Omit<Project, 'id'>): Project => {
  if (!validateDates(project.startDate, project.endDate)) {
    throw new Error('End date must be the same or after start date');
  }
  const projects = getStoredProjects();
  const newProject = { ...project, id: uuidv4() };
  projects.push(newProject);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  return newProject;
};

export const updateStoredProject = (project: Project): Project => {
  if (!validateDates(project.startDate, project.endDate)) {
    throw new Error('End date must be the same or after start date');
  }
  const projects = getStoredProjects();
  const index = projects.findIndex(p => p.id === project.id);
  if (index !== -1) {
    projects[index] = project;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return project;
  }
  throw new Error('Project not found');
};

export const deleteStoredProject = (id: string): void => {
  const projects = getStoredProjects();
  const filtered = projects.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}; 