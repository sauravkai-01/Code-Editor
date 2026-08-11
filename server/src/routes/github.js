import { Router } from 'express';

const router = Router();

router.get('/repos', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated. Connect via /auth/github first.' });
  }
  res.json({ message: 'GitHub integration ready', user: req.user.name });
});

router.post('/push', async (req, res) => {
  const { repoName, files, commitMessage } = req.body;

  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({
    success: true,
    message: `Would push ${files?.length ?? 0} files to ${repoName}`,
    commitMessage: commitMessage || 'Update from CodeFlow',
    hint: 'Full GitHub push requires GITHUB_CLIENT_ID with repo scope',
  });
});

router.post('/import', async (req, res) => {
  const { repoUrl } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ error: 'repoUrl is required' });
  }

  res.json({
    success: true,
    message: `Import from ${repoUrl} initiated`,
    hint: 'Connect GitHub OAuth to enable full repo import',
  });
});

export default router;
