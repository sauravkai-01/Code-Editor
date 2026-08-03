import type { Language } from '../types';

interface StatusBarProps {
  fileName: string | null;
  language: Language | null;
  line: number;
  column: number;
  collaborators: number;
  connected: boolean;
  previewOpen: boolean;
}

export function StatusBar({
  fileName,
  language,
  line,
  column,
  collaborators,
  connected,
  previewOpen,
}: StatusBarProps) {
  return (
    <footer className="status-bar">
      <div className="status-left">
        {connected ? (
          <span className="status-item status-connected">● Live</span>
        ) : (
          <span className="status-item">○ Offline</span>
        )}
        {collaborators > 0 && (
          <span className="status-item">{collaborators} collaborator{collaborators !== 1 ? 's' : ''}</span>
        )}
      </div>
      <div className="status-center">
        {previewOpen && <span className="status-item">Preview</span>}
      </div>
      <div className="status-right">
        {fileName && <span className="status-item">{fileName}</span>}
        {language && <span className="status-item">{language.toUpperCase()}</span>}
        <span className="status-item">Ln {line}, Col {column}</span>
        <span className="status-item">UTF-8</span>
      </div>
    </footer>
  );
}
