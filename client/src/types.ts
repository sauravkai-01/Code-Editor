export type Language = 'javascript' | 'python' | 'cpp' | 'html' | 'css';

export interface FileNode {
  id: string;
  name: string;
  language: Language;
  content: string;
}

export interface Project {
  id: string;
  name: string;
  files: FileNode[];
  shareId?: string;
}

export interface ConsoleMessage {
  id: string;
  type: 'stdout' | 'stderr' | 'info' | 'error';
  text: string;
  timestamp: number;
}

export interface Sentiment {
  label: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: number;
  sentiment?: Sentiment;
}


export interface User {
  id: string;
  name: string;
  avatar?: string;
  provider?: string;
}

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  autoSave: boolean;
}

export const LANGUAGE_MAP: Record<Language, string> = {
  javascript: 'javascript',
  python: 'python',
  cpp: 'cpp',
  html: 'html',
  css: 'css',
};

export const FILE_EXTENSIONS: Record<Language, string> = {
  javascript: '.js',
  python: '.py',
  cpp: '.cpp',
  html: '.html',
  css: '.css',
};
