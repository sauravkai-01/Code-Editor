import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import session from 'express-session';
import { setupSocket } from './socket.js';
import { connectDB } from './db.js';
import { setupAuth } from './auth.js';
import executeRouter from './routes/execute.js';
import projectsRouter from './routes/projects.js';
import githubRouter from './routes/github.js';
import pluginsRouter from './routes/plugins.js';
import lintRouter from './routes/lint.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const app = express();
const server = createServer(app);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'codeflow-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  }),
);

setupAuth(app);
setupSocket(server);

app.use('/api/execute', executeRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/github', githubRouter);
app.use('/api/plugins', pluginsRouter);
app.use('/api/lint', lintRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

const clientDist = path.join(__dirname, '../../client/dist');

if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'), (err) => {
      if (err) res.status(404).json({ error: 'Not found' });
    });
  });
}

connectDB();

server.listen(PORT, () => {
  console.log(`CodeFlow server running on http://localhost:${PORT}`);
});
