import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import type { EditorSettings, Language } from '../types';
import { LANGUAGE_MAP } from '../types';

export interface CodeEditorHandle {
  format: () => void;
  goToLine: (line: number) => void;
  insertText: (text: string) => void;
  focusFind: () => void;
}

interface LintMarker {
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface RemoteCursor {
  userId: string;
  userName: string;
  color: string;
  fileId: string | null;
  line: number;
  column: number;
}

interface CodeEditorProps {
  value: string;
  language: Language;
  theme: 'dark' | 'light';
  settings: EditorSettings;
  onChange: (value: string) => void;
  onSave?: () => void;
  onCursorChange?: (line: number, column: number) => void;
  remoteCursors?: RemoteCursor[];
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
  function CodeEditor({
    value,
    language,
    theme,
    settings,
    onChange,
    onSave,
    onCursorChange,
    remoteCursors = [],
  }, ref) {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
    const lintTimer = useRef<ReturnType<typeof setTimeout>>();

    const decorationsByUserId = useRef<Map<string, string[]>>(new Map());
    const lastRemoteCursorsJsonRef = useRef('');

    useImperativeHandle(ref, () => ({
      format: () => editorRef.current?.getAction('editor.action.formatDocument')?.run(),
      goToLine: (line: number) => {
        editorRef.current?.revealLineInCenter(line);
        editorRef.current?.setPosition({ lineNumber: line, column: 1 });
        editorRef.current?.focus();
      },
      insertText: (text: string) => {
        const ed = editorRef.current;
        if (!ed) return;
        const pos = ed.getPosition();
        if (!pos) return;
        ed.executeEdits('snippet', [
          {
            range: new monacoRef.current!.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column),
            text,
          },
        ]);
      },
      focusFind: () => editorRef.current?.getAction('actions.find')?.run(),
    }));

    const applyMarkers = (markers: LintMarker[]) => {
      const model = editorRef.current?.getModel();
      const monaco = monacoRef.current;
      if (!model || !monaco) return;

      monaco.editor.setModelMarkers(
        model,
        'codeflow-lint',
        markers.map((m) => ({
          startLineNumber: m.line,
          startColumn: m.column,
          endLineNumber: m.endLine ?? m.line,
          endColumn: m.endColumn ?? m.column + 1,
          message: m.message,
          severity: m.severity === 'error'
            ? monaco.MarkerSeverity.Error
            : m.severity === 'warning'
              ? monaco.MarkerSeverity.Warning
              : monaco.MarkerSeverity.Info,
        })),
      );
    };

    useEffect(() => {
      if (!['javascript', 'python'].includes(language)) return;

      clearTimeout(lintTimer.current);
      lintTimer.current = setTimeout(async () => {
        try {
          const res = await fetch('/api/lint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: value, language }),
          });
          const data = await res.json();
          if (data.markers) applyMarkers(data.markers);
        } catch {
          // lint unavailable
        }
      }, 800);

      return () => clearTimeout(lintTimer.current);
    }, [value, language]);

    const updateRemoteCursorDecorations = (cursors: RemoteCursor[]) => {
      const editorApi = editorRef.current;
      const monacoApi = monacoRef.current;
      if (!editorApi || !monacoApi) return;

      const model = editorApi.getModel();
      if (!model) return;

      const nextJson = JSON.stringify(cursors.map((c) => [c.userId, c.line, c.column, c.color]));
      if (nextJson === lastRemoteCursorsJsonRef.current) return;
      lastRemoteCursorsJsonRef.current = nextJson;

      const existingAll: string[] = [];
      for (const ids of decorationsByUserId.current.values()) existingAll.push(...ids);

      const nextDecorations = cursors.map((c) => {
        const safe = (c.color || '#38bdf8').replace(/[^a-zA-Z0-9]/g, '');
        const colorClass = `remote-cursor-inline-${safe}`;

        return {
          range: new monacoApi.Range(c.line, c.column, c.line, c.column + 1),
          options: {
            isWholeLine: false,
            className: colorClass,
            inlineClassName: colorClass,
          },
        };
      });

      const newIds = editorApi.deltaDecorations(existingAll, nextDecorations as any);

      const nextByUserId = new Map<string, string[]>();
      for (let i = 0; i < cursors.length; i++) {
        const c = cursors[i];
        nextByUserId.set(c.userId, [newIds[i]]);
      }

      decorationsByUserId.current = nextByUserId;
    };

    useEffect(() => {
      updateRemoteCursorDecorations(remoteCursors);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remoteCursors]);

    const handleMount: OnMount = (ed, monaco) => {
      editorRef.current = ed;
      monacoRef.current = monaco;

      ed.onDidChangeCursorPosition((e: any) => {
        onCursorChange?.(e.position.lineNumber, e.position.column);
      });

      ed.addAction({
        id: 'save-file',
        label: 'Save File',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
        run: () => onSave?.(),
      });

      ed.addAction({
        id: 'format-doc',
        label: 'Format Document',
        keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF],
        run: () => ed.getAction('editor.action.formatDocument')?.run(),
      });

      ed.addAction({
        id: 'fold-all',
        label: 'Fold All',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.BracketLeft],
        run: () => ed.getAction('editor.foldAll')?.run(),
      });

      ed.addAction({
        id: 'unfold-all',
        label: 'Unfold All',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.BracketRight],
        run: () => ed.getAction('editor.unfoldAll')?.run(),
      });
    };

    return (
      <Editor
        height="100%"
        language={LANGUAGE_MAP[language]}
        value={value}
        theme={theme === 'dark' ? 'vs-dark' : 'vs'}
        onChange={(v) => onChange(v ?? '')}
        onMount={handleMount}
        options={{
          fontSize: settings.fontSize,
          fontFamily: "'JetBrains Mono', monospace",
          tabSize: settings.tabSize,
          wordWrap: settings.wordWrap ? 'on' : 'off',
          minimap: { enabled: settings.minimap },
          lineNumbers: 'on',
          folding: true,
          bracketPairColorization: { enabled: true },
          matchBrackets: 'always',
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          formatOnPaste: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          renderWhitespace: 'selection',
          padding: { top: 12 },
        }}
      />
    );
  },
);

