import { Project } from '../types';
import Papa from 'papaparse';

// Convert projects to CSV string
export const projectsToCsv = (projects: Project[]): string => {
  return Papa.unparse(projects.map(project => ({
    ...project,
    location: `${project.location.lat},${project.location.lng}`, // Combine lat/lng for CSV
    tags: project.tags.join('|') // Join tags with pipe separator
  })));
};

// Parse CSV string back to projects
export const csvToProjects = (csvString: string): Project[] => {
  const results = Papa.parse(csvString, { header: true });
  return results.data.map((row: any) => {
    const [lat, lng] = row.location.split(',').map(Number);
    return {
      ...row,
      budget: Number(row.budget),
      location: { lat, lng },
      tags: row.tags ? row.tags.split('|') : []
    };
  });
};

// Save projects by downloading CSV file
export const downloadProjectsCsv = (projects: Project[]): void => {
  const csvString = projectsToCsv(projects);
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'projects.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Load projects from CSV file
export const loadProjectsFromCsv = (file: File): Promise<Project[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvString = event.target?.result as string;
        const projects = csvToProjects(csvString);
        resolve(projects);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}; 