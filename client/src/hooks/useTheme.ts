import { useCallback, useEffect, useState } from 'react';
import type { EditorSettings } from '../types';

const STORAGE_KEY = 'codeflow-settings';
const THEME_KEY = 'codeflow-theme';

const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  minimap: true,
  autoSave: true,
};

export function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme, setTheme };
}

export function useSettings() {
  const [settings, setSettings] = useState<EditorSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const updateSettings = useCallback((partial: Partial<EditorSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { settings, updateSettings };
}

export function useKeyboardShortcuts(handlers: Record<string, () => void>) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (ctrl && key === 's') {
        e.preventDefault();
        handlers.save?.();
      } else if (ctrl && key === 'enter') {
        e.preventDefault();
        handlers.run?.();
      } else if (ctrl && key === 'n') {
        e.preventDefault();
        handlers.newFile?.();
      } else if (ctrl && key === 'w') {
        e.preventDefault();
        handlers.closeTab?.();
      } else if (ctrl && key === 'b') {
        e.preventDefault();
        handlers.toggleSidebar?.();
      } else if (ctrl && key === '`') {
        e.preventDefault();
        handlers.toggleConsole?.();
      } else if (ctrl && e.shiftKey && key === 'p') {
        e.preventDefault();
        handlers.commandPalette?.();
      } else if (ctrl && e.shiftKey && key === 'f') {
        e.preventDefault();
        handlers.searchProject?.();
      } else if (ctrl && e.shiftKey && key === 'v') {
        e.preventDefault();
        handlers.togglePreview?.();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlers]);
}
