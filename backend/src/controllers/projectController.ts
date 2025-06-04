import { Request, Response } from 'express';
import Project, { IProject } from '../models/Project';

export const getAllProjects = async (_req: Request, res: Response<IProject[]>) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json([]);
  }
};

export const createProject = async (req: Request<{}, IProject, Omit<IProject, '_id'>>, res: Response<IProject>) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({} as IProject);
  }
};

export const updateProject = async (
  req: Request<{ id: string }, IProject, Partial<IProject>>,
  res: Response<IProject>
) => {
  try {
    const { id } = req.params;
    const project = await Project.findOneAndUpdate(
      { id },
      req.body,
      { new: true }
    );
    if (!project) {
      res.status(404).json({} as IProject);
    } else {
      res.json(project);
    }
  } catch (error) {
    res.status(400).json({} as IProject);
  }
};

export const deleteProject = async (
  req: Request<{ id: string }>,
  res: Response<{ message: string }>
) => {
  try {
    const { id } = req.params;
    const project = await Project.findOneAndDelete({ id });
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
    } else {
      res.json({ message: 'Project deleted successfully' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error deleting project' });
  }
}; 