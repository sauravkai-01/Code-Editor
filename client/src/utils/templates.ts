import type { Project } from '../types';
import { createId } from './project';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  tags: string[];
  create: () => Project;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'todo-app',
    name: 'Todo App',
    description: 'Full-stack todo list with localStorage persistence',
    tags: ['web', 'javascript'],
    create: () => ({
      id: createId(),
      name: 'Todo App',
      files: [
        {
          id: createId(),
          name: 'index.html',
          language: 'html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Todo App</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="app">
    <h1>My Tasks</h1>
    <form id="todo-form">
      <input type="text" id="todo-input" placeholder="Add a task..." required />
      <button type="submit">Add</button>
    </form>
    <ul id="todo-list"></ul>
    <p class="stats"><span id="count">0</span> tasks remaining</p>
  </div>
  <script src="app.js"></script>
</body>
</html>
`,
        },
        {
          id: createId(),
          name: 'style.css',
          language: 'css',
          content: `* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: system-ui, sans-serif;
  background: #f4f4f5;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 420px;
}

h1 { margin-bottom: 1rem; font-size: 1.5rem; }

#todo-form { display: flex; gap: 8px; margin-bottom: 1rem; }

#todo-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  font-size: 14px;
}

button {
  padding: 10px 16px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

#todo-list { list-style: none; }

#todo-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f4f4f5;
}

#todo-list li.done span { text-decoration: line-through; color: #a1a1aa; }

.stats { margin-top: 1rem; font-size: 13px; color: #71717a; }
`,
        },
        {
          id: createId(),
          name: 'app.js',
          language: 'javascript',
          content: `const STORAGE_KEY = 'todos';

function loadTodos() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function render() {
  const todos = loadTodos();
  const list = document.getElementById('todo-list');
  list.innerHTML = todos.map((t, i) => \`
    <li class="\${t.done ? 'done' : ''}">
      <input type="checkbox" data-idx="\${i}" \${t.done ? 'checked' : ''} />
      <span>\${t.text}</span>
      <button data-delete="\${i}" style="margin-left:auto;background:#ef4444">×</button>
    </li>
  \`).join('');
  document.getElementById('count').textContent =
    todos.filter(t => !t.done).length;
}

document.getElementById('todo-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('todo-input');
  const todos = loadTodos();
  todos.push({ text: input.value.trim(), done: false });
  saveTodos(todos);
  input.value = '';
  render();
});

document.getElementById('todo-list').addEventListener('click', (e) => {
  const todos = loadTodos();
  if (e.target.dataset.idx !== undefined) {
    todos[+e.target.dataset.idx].done = e.target.checked;
    saveTodos(todos);
    render();
  }
  if (e.target.dataset.delete !== undefined) {
    todos.splice(+e.target.dataset.delete, 1);
    saveTodos(todos);
    render();
  }
});

render();
console.log('Todo app loaded — open Preview to interact');
`,
        },
      ],
    }),
  },
  {
    id: 'api-client',
    name: 'API Client',
    description: 'Fetch data from public APIs with error handling',
    tags: ['javascript', 'api'],
    create: () => ({
      id: createId(),
      name: 'API Client',
      files: [
        {
          id: createId(),
          name: 'api.js',
          language: 'javascript',
          content: `// Real-world API client pattern — runs in browser sandbox
async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
  return res.json();
}

async function main() {
  try {
    // Free public API — no key required
    const user = await fetchJSON('https://jsonplaceholder.typicode.com/users/1');
    console.log('User:', user.name, '|', user.email);

    const posts = await fetchJSON('https://jsonplaceholder.typicode.com/posts?userId=1&_limit=3');
    console.log('\\nRecent posts:');
    posts.forEach(p => console.log(\`  • \${p.title}\`));
  } catch (err) {
    console.error('Request failed:', err.message);
  }
}

main();
`,
        },
      ],
    }),
  },
  {
    id: 'python-csv',
    name: 'CSV Data Processor',
    description: 'Parse and analyze CSV data — common data engineering task',
    tags: ['python', 'data'],
    create: () => ({
      id: createId(),
      name: 'CSV Processor',
      files: [
        {
          id: createId(),
          name: 'process.py',
          language: 'python',
          content: `# CSV data processing — paste sample data in STDIN panel
# Format: name,age,city (one row per line, header optional)

import sys

def parse_csv(text):
    rows = []
    for line in text.strip().split('\\n'):
        if line.strip():
            rows.append([c.strip() for c in line.split(',')])
    return rows

def analyze(rows):
    if not rows:
        print("No data")
        return

    if rows[0][0].lower() in ('name', 'id', 'email'):
        data = rows[1:]
    else:
        data = rows

    print(f"Rows: {len(data)}")
    if data and len(data[0]) >= 2:
        try:
            ages = [int(r[1]) for r in data if len(r) > 1]
            print(f"Average age: {sum(ages)/len(ages):.1f}")
            print(f"Min age: {min(ages)}, Max age: {max(ages)}")
        except ValueError:
            pass
    for row in data[:5]:
        print(f"  {', '.join(row)}")
    if len(data) > 5:
        print(f"  ... and {len(data)-5} more")

# Read from stdin — add sample data in the STDIN panel below console
sample = """name,age,city
Alice,28,New York
Bob,34,San Francisco
Carol,22,Boston
Dave,41,Chicago
Eve,31,Seattle"""

if not sys.stdin.isatty():
    text = sys.stdin.read()
else:
    text = sample

rows = parse_csv(text)
analyze(rows)
`,
        },
      ],
    }),
  },
  {
    id: 'cpp-io',
    name: 'C++ Fast I/O',
    description: 'Competitive programming template with fast input/output',
    tags: ['cpp', 'algorithms'],
    create: () => ({
      id: createId(),
      name: 'C++ Fast I/O',
      files: [
        {
          id: createId(),
          name: 'solution.cpp',
          language: 'cpp',
          content: `// Competitive programming template
// Add test input in STDIN panel (e.g. "5\\n1 2 3 4 5")
#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];

    sort(arr.begin(), arr.end());

  cout << "Sorted: ";
    for (int x : arr) cout << x << " ";
    cout << "\\nSum: " << accumulate(arr.begin(), arr.end(), 0) << endl;

    return 0;
}
`,
        },
      ],
    }),
  },
  {
    id: 'form-validation',
    name: 'Form Validation',
    description: 'Contact form with real-time validation patterns',
    tags: ['web', 'html'],
    create: () => ({
      id: createId(),
      name: 'Form Validation',
      files: [
        {
          id: createId(),
          name: 'index.html',
          language: 'html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Contact Form</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <form id="contact-form" novalidate>
    <h2>Contact Us</h2>
    <div class="field">
      <label>Email</label>
      <input type="email" id="email" required />
      <span class="error" id="email-error"></span>
    </div>
    <div class="field">
      <label>Phone</label>
      <input type="tel" id="phone" placeholder="555-123-4567" />
      <span class="error" id="phone-error"></span>
    </div>
    <div class="field">
      <label>Message</label>
      <textarea id="message" rows="4" required minlength="10"></textarea>
      <span class="error" id="message-error"></span>
    </div>
    <button type="submit">Send</button>
    <p id="success" class="success hidden">Message sent!</p>
  </form>
  <script src="validate.js"></script>
</body>
</html>
`,
        },
        {
          id: createId(),
          name: 'style.css',
          language: 'css',
          content: `body { font-family: system-ui; max-width: 400px; margin: 4rem auto; padding: 0 1rem; }
form { display: flex; flex-direction: column; gap: 1rem; }
.field { display: flex; flex-direction: column; gap: 4px; }
label { font-weight: 600; font-size: 14px; }
input, textarea { padding: 10px; border: 1px solid #d4d4d8; border-radius: 8px; font-size: 14px; }
input.invalid, textarea.invalid { border-color: #ef4444; }
.error { color: #ef4444; font-size: 12px; min-height: 16px; }
.success { color: #22c55e; font-weight: 600; }
.hidden { display: none; }
button { padding: 12px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; }
`,
        },
        {
          id: createId(),
          name: 'validate.js',
          language: 'javascript',
          content: `const rules = {
  email: (v) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v) ? '' : 'Invalid email address',
  phone: (v) => !v || /^\\d{3}-\\d{3}-\\d{4}$/.test(v) ? '' : 'Use format 555-123-4567',
  message: (v) => v.length >= 10 ? '' : 'Message must be at least 10 characters',
};

function validate(id) {
  const el = document.getElementById(id);
  const err = document.getElementById(id + '-error');
  const msg = rules[id](el.value.trim());
  err.textContent = msg;
  el.classList.toggle('invalid', !!msg);
  return !msg;
}

['email', 'phone', 'message'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => validate(id));
});

document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const ok = ['email', 'phone', 'message'].every(validate);
  if (ok) {
    document.getElementById('success').classList.remove('hidden');
    console.log('Form valid — ready to submit to API');
  }
});

console.log('Open Preview to test the form');
`,
        },
      ],
    }),
  },
];
