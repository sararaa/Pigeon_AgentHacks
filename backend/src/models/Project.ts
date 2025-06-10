import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  id: string;
  name: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed' | 'on-hold';
  startDate: string;
  endDate: string;
  budget: number;
  locationType: 'point' | 'line' | 'area';
  location: {
    lat: number;
    lng: number;
  };
  coordinates: {
    lat: number;
    lng: number;
  }[];
  address: string;
  department: string;
  tags: string[];
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['planned', 'in-progress', 'completed', 'on-hold'], required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  budget: { type: Number, required: true },
  locationType: { type: String, enum: ['point', 'line', 'area'], required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  coordinates: [{
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }],
  address: { type: String, required: true },
  department: { type: String, required: true },
  tags: [{ type: String }],
  color: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.model<IProject>('Project', ProjectSchema); 