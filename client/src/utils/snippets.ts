import type { Language } from '../types';

export interface Snippet {
  id: string;
  name: string;
  language: Language;
  description: string;
  code: string;
}

export const SNIPPETS: Snippet[] = [
  {
    id: 'js-fetch',
    name: 'Fetch API',
    language: 'javascript',
    description: 'Async fetch with error handling',
    code: `async function fetchData(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}
`,
  },
  {
    id: 'js-class',
    name: 'ES6 Class',
    language: 'javascript',
    description: 'Class with constructor and method',
    code: `class MyClass {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return \`Hello, \${this.name}!\`;
  }
}
`,
  },
  {
    id: 'py-main',
    name: 'Python main guard',
    language: 'python',
    description: 'if __name__ == "__main__" block',
    code: `def main():
    print("Hello from Python")

if __name__ == "__main__":
    main()
`,
  },
  {
    id: 'py-listcomp',
    name: 'List comprehension',
    language: 'python',
    description: 'Filter and transform a list',
    code: `numbers = range(1, 11)
evens = [n * 2 for n in numbers if n % 2 == 0]
print(evens)
`,
  },
  {
    id: 'cpp-template',
    name: 'C++ template function',
    language: 'cpp',
    description: 'Generic template with main',
    code: `#include <iostream>

template<typename T>
T maxVal(T a, T b) {
    return a > b ? a : b;
}

int main() {
    std::cout << maxVal(3, 7) << std::endl;
    return 0;
}
`,
  },
  {
    id: 'html-boiler',
    name: 'HTML5 boilerplate',
    language: 'html',
    description: 'Basic HTML5 document structure',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Document</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>
`,
  },
  {
    id: 'js-debounce',
    name: 'Debounce function',
    language: 'javascript',
    description: 'Limit how often a function fires — search inputs, resize handlers',
    code: `function debounce(fn, delayMs = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}

const onSearch = debounce((query) => {
  console.log('Searching:', query);
}, 300);
`,
  },
  {
    id: 'js-trycatch-async',
    name: 'Async try/catch',
    language: 'javascript',
    description: 'Standard async error handling pattern',
    code: `async function fetchUser(id) {
  try {
    const res = await fetch(\`/api/users/\${id}\`);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch user:', err.message);
    return null;
  }
}
`,
  },
  {
    id: 'js-localstorage',
    name: 'localStorage helper',
    language: 'javascript',
    description: 'Type-safe JSON storage — used in every web app',
    code: `const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  },
};
`,
  },
  {
    id: 'py-requests',
    name: 'HTTP GET with urllib',
    language: 'python',
    description: 'Fetch JSON from an API without external libraries',
    code: `import json
from urllib.request import urlopen

def fetch_json(url):
    with urlopen(url) as res:
        return json.loads(res.read().decode())

data = fetch_json('https://jsonplaceholder.typicode.com/todos/1')
print(data['title'])
`,
  },
  {
    id: 'py-csv',
    name: 'Read CSV from string',
    language: 'python',
    description: 'Parse comma-separated data — common in data jobs',
    code: `import csv
from io import StringIO

csv_text = """name,score
Alice,95
Bob,87
Carol,92"""

reader = csv.DictReader(StringIO(csv_text))
for row in reader:
    print(f"{row['name']}: {row['score']}")
`,
  },
  {
    id: 'py-datetime',
    name: 'Date formatting',
    language: 'python',
    description: 'Format timestamps for logs and reports',
    code: `from datetime import datetime, timezone

now = datetime.now(timezone.utc)
print(now.strftime('%Y-%m-%d %H:%M:%S UTC'))
print(now.isoformat())
`,
  },
  {
    id: 'css-flex',
    name: 'Flexbox center',
    language: 'css',
    description: 'Center content with flexbox',
    code: `.container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
`,
  },
];
