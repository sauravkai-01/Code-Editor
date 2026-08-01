import { Router } from 'express';

const router = Router();

const builtinPlugins = [
  {
    id: 'eslint',
    name: 'ESLint',
    version: '1.0.0',
    description: 'JavaScript linting with inline error detection',
    enabled: true,
    type: 'linter',
  },
  {
    id: 'prettier',
    name: 'Prettier',
    version: '1.0.0',
    description: 'Code formatting on save',
    enabled: true,
    type: 'formatter',
  },
  {
    id: 'github-sync',
    name: 'GitHub Sync',
    version: '1.0.0',
    description: 'Push and pull projects from GitHub repositories',
    enabled: false,
    type: 'integration',
  },
  {
    id: 'emmet',
    name: 'Emmet',
    version: '1.0.0',
    description: 'HTML/CSS abbreviation expansion',
    enabled: true,
    type: 'productivity',
  },
];

const installedPlugins = new Map(builtinPlugins.map((p) => [p.id, p]));

router.get('/', (_req, res) => {
  res.json(Array.from(installedPlugins.values()));
});

router.post('/:id/toggle', (req, res) => {
  const plugin = installedPlugins.get(req.params.id);
  if (!plugin) return res.status(404).json({ error: 'Plugin not found' });

  plugin.enabled = !plugin.enabled;
  res.json(plugin);
});

router.post('/install', (req, res) => {
  const { id, name, description, type } = req.body;

  if (!id || !name) {
    return res.status(400).json({ error: 'id and name are required' });
  }

  const plugin = {
    id,
    name,
    description: description || '',
    version: '0.1.0',
    enabled: true,
    type: type || 'custom',
  };

  installedPlugins.set(id, plugin);
  res.json(plugin);
});

export default router;
