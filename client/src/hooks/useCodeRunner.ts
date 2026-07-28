import { useCallback, useState } from 'react';
import type { ConsoleMessage, Language } from '../types';

const API_BASE = '/api';

export function useCodeRunner() {
  const [running, setRunning] = useState(false);
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  const [stdin, setStdin] = useState('');

  const addMessage = useCallback((type: ConsoleMessage['type'], text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type, text, timestamp: Date.now() },
    ]);
  }, []);

  const clearConsole = useCallback(() => setMessages([]), []);

  const runJavaScript = useCallback(
    async (code: string, input: string) => {
      setRunning(true);
      const start = performance.now();
      addMessage('info', '▶ Running JavaScript in browser sandbox...');

      const logs: string[] = [];
      const errors: string[] = [];
      const stdinLines = input.split('\n');

      const sandboxConsole = {
        log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
        error: (...args: unknown[]) => errors.push(args.map(String).join(' ')),
        warn: (...args: unknown[]) => logs.push('[warn] ' + args.map(String).join(' ')),
        info: (...args: unknown[]) => logs.push('[info] ' + args.map(String).join(' ')),
      };

      try {
        const stdinHelper = `
const __stdinLines = ${JSON.stringify(stdinLines)};
let __stdinIdx = 0;
function readline() { return __stdinLines[__stdinIdx++] ?? ''; }
`;
        const fn = new Function('console', `"use strict";\n${stdinHelper}\n${code}`);
        const result = fn(sandboxConsole);

        logs.forEach((l) => addMessage('stdout', l));
        if (result !== undefined) {
          addMessage('stdout', String(result));
        }
        errors.forEach((e) => addMessage('stderr', e));

        if (logs.length === 0 && errors.length === 0) {
          addMessage('info', '✓ Execution completed (no output)');
        }
      } catch (err) {
        addMessage('error', err instanceof Error ? err.message : String(err));
      } finally {
        const ms = Math.round(performance.now() - start);
        addMessage('info', `⏱ Finished in ${ms}ms`);
        setRunning(false);
      }
    },
    [addMessage],
  );

  const runOnServer = useCallback(
    async (code: string, language: Language, filename: string, input: string) => {
      setRunning(true);
      const start = performance.now();
      addMessage('info', `▶ Running ${language} on server...`);

      try {
        const res = await fetch(`${API_BASE}/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language, filename, stdin: input }),
        });

        const data = await res.json();

        if (data.stdout) addMessage('stdout', data.stdout);
        if (data.stderr) addMessage('stderr', data.stderr);
        if (data.error) addMessage('error', data.error);

        if (!data.stdout && !data.stderr && !data.error) {
          addMessage('info', '✓ Execution completed');
        }
      } catch (err) {
        addMessage('error', `Server error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        const ms = Math.round(performance.now() - start);
        addMessage('info', `⏱ Finished in ${ms}ms`);
        setRunning(false);
      }
    },
    [addMessage],
  );

  const run = useCallback(
    async (code: string, language: Language, filename: string) => {
      clearConsole();
      if (language === 'javascript') {
        await runJavaScript(code, stdin);
      } else if (language === 'html' || language === 'css') {
        addMessage('info', 'HTML/CSS files are for preview — open index.html in a browser tab.');
      } else {
        await runOnServer(code, language, filename, stdin);
      }
    },
    [clearConsole, runJavaScript, runOnServer, addMessage, stdin],
  );

  return { run, running, messages, clearConsole, addMessage, stdin, setStdin };
}
