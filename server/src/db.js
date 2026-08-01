import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codeflow';

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.warn('MongoDB unavailable — using in-memory storage:', err.message);
  }
}

const fileSchema = new mongoose.Schema({
  id: String,
  name: String,
  language: String,
  content: String,
});

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Untitled Project' },
    shareId: { type: String, unique: true, sparse: true },
    files: [fileSchema],
    ownerId: String,
    githubRepo: String,
  },
  { timestamps: true },
);

const userSchema = new mongoose.Schema(
  {
    provider: String, // 'github' | 'google' | 'local'
    providerId: String,

    // local auth fields
    email: { type: String, unique: true, sparse: true },
    passwordHash: String,

    name: String,
    avatar: String,
  },
  { timestamps: true },
);


export const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
export const User = mongoose.models.User || mongoose.model('User', userSchema);
