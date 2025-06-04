import express, { Router } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { getAllProjects, createProject, updateProject, deleteProject } from './controllers/projectController';

dotenv.config();

const app = express();
const router = Router();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = 'mongodb+srv://pasadena:pasadena123@cluster0.mongodb.net/pasadena_projects?retryWrites=true&w=majority';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
router.get('/projects', getAllProjects);
router.post('/projects', createProject);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

// Apply routes with prefix
app.use('/api', router);

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  }); 