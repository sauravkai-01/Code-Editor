import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Project } from '../db.js';

const router = Router();
const memoryStore = new Map();

router.post('/', async (req, res) => {
  const project = req.body;

  try {
    if (Project.db?.readyState === 1) {
      const shareId = project.shareId || uuidv4().slice(0, 8);
      const saved = await Project.findOneAndUpdate(
        { shareId },
        { ...project, shareId },
        { upsert: true, new: true },
      );
      return res.json({ id: saved._id, shareId: saved.shareId });
    }
  } catch {
    // fall through to memory store
  }

  const shareId = project.shareId || uuidv4().slice(0, 8);
  memoryStore.set(shareId, { ...project, shareId });
  res.json({ shareId });
});

router.post('/share', async (req, res) => {
  const project = req.body;
  const shareId = uuidv4().slice(0, 8);

  try {
    if (Project.db?.readyState === 1) {
      await Project.findOneAndUpdate(
        { shareId },
        { ...project, shareId },
        { upsert: true, new: true },
      );
    } else {
      memoryStore.set(shareId, { ...project, shareId });
    }
  } catch {
    memoryStore.set(shareId, { ...project, shareId });
  }

  res.json({ shareId });
});

router.get('/share/:shareId', async (req, res) => {
  const { shareId } = req.params;

  try {
    if (Project.db?.readyState === 1) {
      const project = await Project.findOne({ shareId });
      if (project) return res.json(project);
    }
  } catch {
    // fall through
  }

  const project = memoryStore.get(shareId);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

router.get('/:id', async (req, res) => {
  try {
    if (Project.db?.readyState === 1) {
      const project = await Project.findById(req.params.id);
      if (project) return res.json(project);
    }
  } catch {
    // fall through
  }

  res.status(404).json({ error: 'Project not found' });
});

export default router;
