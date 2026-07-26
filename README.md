# CodeFlow — Online Code Editor

A modern, full-featured online code editor with real-time collaboration, multi-language support, and cloud project storage.

![CodeFlow](https://img.shields.io/badge/CodeFlow-Editor-6366f1)

## Features

- **Monaco Editor** — VS Code's editor with syntax highlighting for JavaScript, Python, C++, HTML, and CSS
- **IntelliSense** — Auto-completion, bracket matching, code folding, and inline diagnostics
- **Multi-file tabs** — Work on multiple files with a file tree sidebar
- **Run code** — JavaScript runs in-browser; Python and C++ execute on a sandboxed server
- **Real-time collaboration** — WebSocket-based live editing and team chat
- **Shareable links** — Generate URLs to share projects with collaborators
- **Dark/Light themes** — Toggle with system preference detection
- **Cloud storage** — Save projects to MongoDB (with local fallback)
- **Export** — Download projects as ZIP files
- **GitHub OAuth** — Connect GitHub for version control integration
- **Plugin system** — Extensible architecture for linters, formatters, and integrations
- **STDIN input** — Provide program input for Python/C++ (and `readline()` in JS)
- **Developer Tools** — JSON formatter/validator and regex tester
- **Project templates** — Todo app, API client, CSV processor, form validation, and more
- **Execution timing** — See how long each run takes
- **Copy console output** — One-click copy for sharing results

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Monaco Editor |
| Backend | Node.js, Express.js |
| Database | MongoDB (optional) |
| Real-time | Socket.IO |
| Auth | Passport.js (GitHub + Google OAuth2) |
| Deployment | Docker, AWS/Vercel-ready |

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3 (for running Python code)
- g++ (for running C++ code)
- MongoDB (optional)

### Development

```bash
# Install all dependencies
npm run install:all

# Copy environment config
cp .env.example .env

# Start both frontend and backend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Production Build

```bash
npm run build
npm start
```

### Docker

```bash
docker-compose up --build
```

App available at http://localhost:3001

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Run code |
| `Ctrl+S` | Save project |
| `Ctrl+N` | New file |
| `Ctrl+W` | Close tab |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+\`` | Toggle console |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/execute` | Run Python/C++ code |
| POST | `/api/projects` | Save project |
| POST | `/api/projects/share` | Create shareable link |
| GET | `/api/projects/share/:id` | Load shared project |
| GET | `/api/plugins` | List plugins |
| GET | `/auth/github` | GitHub OAuth login |
| GET | `/auth/google` | Google OAuth login |

## Project Structure

```
codeflow-editor/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── styles/         # Global CSS
│   │   └── utils/          # Helpers
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Code execution sandbox
│   │   ├── auth.js         # OAuth setup
│   │   ├── socket.js       # WebSocket collaboration
│   │   └── index.js        # Server entry
│   └── package.json
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Configuration

Set environment variables in `.env`:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/codeflow
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

## License

MIT
