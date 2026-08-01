import { spawn } from 'child_process';
import { writeFile, mkdir, rm } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SANDBOX_DIR = path.join(__dirname, '../../sandbox');

const TIMEOUT_MS = 10000;
const MAX_OUTPUT = 50000;

const DANGEROUS_PATTERNS = [
  /\bimport\s+os\b/,
  /\bos\.system\b/,
  /\bsubprocess\b/,
  /\beval\s*\(/,
  /\bexec\s*\(/,
  /\bopen\s*\(/,
  /\b__import__\b/,
  /\brequire\s*\(\s*['"]child_process/,
  /\bprocess\.exit\b/,
  /\bfs\./,
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
];

function sanitizeCode(code, language) {
  if (language === 'python') {
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(code)) {
        throw new Error(`Blocked: potentially unsafe pattern detected (${pattern})`);
      }
    }
  }
}

async function runInSandbox(fn) {
  await mkdir(SANDBOX_DIR, { recursive: true });
  const workDir = path.join(SANDBOX_DIR, `run-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await mkdir(workDir, { recursive: true });

  try {
    return await fn(workDir);
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

function truncate(str) {
  if (!str || str.length <= MAX_OUTPUT) return str;
  return str.slice(0, MAX_OUTPUT) + '\n... (output truncated)';
}

function runProcess(command, args, options = {}) {
  const { cwd, stdin = '' } = options;

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let killed = false;

    const proc = spawn(command, args, { cwd, shell: false });
    const timer = setTimeout(() => {
      killed = true;
      proc.kill('SIGTERM');
    }, TIMEOUT_MS);

    proc.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
      if (stdout.length > MAX_OUTPUT) proc.kill('SIGTERM');
    });
    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    if (stdin) {
      proc.stdin.write(stdin);
    }
    proc.stdin.end();

    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        stdout: truncate(stdout),
        stderr: truncate(stderr),
        error: killed
          ? 'Execution timed out (10s limit)'
          : code !== 0
            ? `Process exited with code ${code}`
            : undefined,
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      resolve({ stdout: '', stderr: '', error: err.message });
    });
  });
}

export async function executeCode(code, language, filename, stdin = '') {
  sanitizeCode(code, language);

  switch (language) {
    case 'python':
      return runPython(code, filename, stdin);
    case 'cpp':
      return runCpp(code, filename, stdin);
    case 'javascript':
      return runNodeJs(code, filename, stdin);
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}

async function runPython(code, filename, stdin) {
  return runInSandbox(async (workDir) => {
    const filePath = path.join(workDir, `${filename}.py`);
    await writeFile(filePath, code);
    const result = await runProcess('python', [filePath], { cwd: workDir, stdin });
    if (result.error && !result.stdout && !result.stderr) {
      return { ...result, error: result.error };
    }
    return { stdout: result.stdout, stderr: result.stderr, error: result.stderr ? result.error : undefined };
  });
}

async function runCpp(code, filename, stdin) {
  return runInSandbox(async (workDir) => {
    const sourceFile = path.join(workDir, `${filename}.cpp`);
    const binary = path.join(workDir, 'a.out');
    await writeFile(sourceFile, code);

    const compile = await runProcess('g++', ['-std=c++17', '-O2', sourceFile, '-o', binary], {
      cwd: workDir,
    });

    if (compile.stderr && !compile.stdout) {
      return { stderr: truncate(compile.stderr), error: 'Compilation failed' };
    }

    return runProcess(binary, [], { cwd: workDir, stdin });
  });
}

async function runNodeJs(code, filename, stdin) {
  return runInSandbox(async (workDir) => {
    const filePath = path.join(workDir, `${filename}.js`);
    await writeFile(filePath, code);
    return runProcess('node', ['--disallow-code-generation-from-strings', filePath], {
      cwd: workDir,
      stdin,
    });
  });
}
