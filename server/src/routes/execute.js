import { Router } from 'express';
import { executeCode } from '../services/executor.js';

const router = Router();

router.post('/', async (req, res) => {
  const { code, language, filename, stdin } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'code and language are required' });
  }

  const allowed = ['python', 'cpp', 'javascript'];
  if (!allowed.includes(language)) {
    return res.status(400).json({ error: `Language "${language}" is not supported for server execution` });
  }

  try {
    const result = await executeCode(code, language, filename || 'main', stdin || '');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
