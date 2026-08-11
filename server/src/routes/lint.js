import { Router } from 'express';

const router = Router();

function lintJavaScript(code) {
  const markers = [];
  const lines = code.split('\n');

  lines.forEach((line, i) => {
    const lineNum = i + 1;

    if (/\bconsole\.log\b/.test(line) && !line.trim().startsWith('//')) {
      markers.push({
        line: lineNum,
        column: line.indexOf('console') + 1,
        message: 'Unexpected console statement',
        severity: 'warning',
      });
    }

    if (/\bvar\s+/.test(line)) {
      markers.push({
        line: lineNum,
        column: line.indexOf('var') + 1,
        message: 'Unexpected var, use let or const instead',
        severity: 'warning',
      });
    }

    if (/==(?!=)/.test(line) && !/===/.test(line)) {
      const idx = line.search(/[^=]==[^=]/);
      if (idx >= 0) {
        markers.push({
          line: lineNum,
          column: idx + 2,
          message: 'Use === instead of ==',
          severity: 'warning',
        });
      }
    }

    const openParens = (line.match(/\(/g) || []).length;
    const closeParens = (line.match(/\)/g) || []).length;
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    if (openParens !== closeParens || openBraces !== closeBraces) {
      if (line.trim() && !line.trim().endsWith(',') && !line.includes('//')) {
        markers.push({
          line: lineNum,
          column: 1,
          message: 'Possible unbalanced brackets on this line',
          severity: 'info',
        });
      }
    }
  });

  return markers.slice(0, 20);
}

function lintPython(code) {
  const markers = [];
  const lines = code.split('\n');
  let indentStack = [0];

  lines.forEach((line, i) => {
    const lineNum = i + 1;
    const trimmed = line.trimEnd();

    if (!trimmed || trimmed.startsWith('#')) return;

    const indent = line.length - line.trimStart().length;

    if (trimmed.endsWith(':')) {
      indentStack.push(indent + 4);
    }

    if (indent > 0 && indent % 4 !== 0) {
      markers.push({
        line: lineNum,
        column: 1,
        message: 'Indentation is not a multiple of 4',
        severity: 'warning',
      });
    }

    if (/\bprint\s/.test(trimmed) && !trimmed.startsWith('#')) {
      markers.push({
        line: lineNum,
        column: trimmed.indexOf('print') + 1,
        message: 'Print statement found',
        severity: 'info',
      });
    }

    if (/^\s*except\s*:/.test(trimmed)) {
      markers.push({
        line: lineNum,
        column: trimmed.indexOf('except') + 1,
        message: 'Bare except clause — catch specific exceptions',
        severity: 'warning',
      });
    }
  });

  return markers.slice(0, 20);
}

router.post('/', (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'code and language are required' });
  }

  let markers = [];
  if (language === 'javascript') markers = lintJavaScript(code);
  else if (language === 'python') markers = lintPython(code);

  res.json({ markers });
});

export default router;
