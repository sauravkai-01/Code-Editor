import type { FileNode, Language, Project } from '../types';


export function createId(): string {
  return crypto.randomUUID();
}

export const DEFAULT_FILES: FileNode[] = [
  {
    id: 'welcome-js',
    name: 'main.js',
    language: 'javascript',
    content: `// Welcome to CodeFlow — press Ctrl+Enter to run
function greet(name) {
  return \`Hello, \${name}! Welcome to CodeFlow.\`;
}

console.log(greet('Developer'));

// Try editing and running this code
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log('Doubled:', doubled);
`,
  },
  {
    id: 'welcome-py',
    name: 'main.py',
    language: 'python',
    content: `# Python example — runs on the server
def fibonacci(n):
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

print("Fibonacci sequence:", fibonacci(10))
`,
  },
  {
    id: 'welcome-cpp',
    name: 'main.cpp',
    language: 'cpp',
    content: `// C++ example — compiled and run on the server
#include <iostream>
#include <vector>

int main() {
    std::vector<int> nums = {1, 2, 3, 4, 5};
    int sum = 0;
    for (int n : nums) sum += n;
    std::cout << "Sum: " << sum << std::endl;
    return 0;
}
`,
  },
  {
    id: 'welcome-html',
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CodeFlow Preview</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h1>Hello from CodeFlow!</h1>
  <p>Edit HTML and CSS files side by side.</p>
</body>
</html>
`,
  },
  {
    id: 'welcome-css',
    name: 'style.css',
    language: 'css',
    content: `body {
  font-family: system-ui, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}
`,
  },
];

export function createDefaultProject(): Project {
  return {
    id: createId(),
    name: 'My Project',
    files: DEFAULT_FILES.map((f) => ({ ...f, id: createId() })),
  };
}

export function getLanguageFromFilename(name: string): Language {
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
  const map: Record<string, Language> = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'javascript',
    '.py': 'python',
    '.cpp': 'cpp',
    '.cc': 'cpp',
    '.h': 'cpp',
    '.html': 'html',
    '.htm': 'html',
    '.css': 'css',
  };
  return map[ext] ?? 'javascript';
}
