import { X } from 'lucide-react';
import type { Language } from '../types';
import { SNIPPETS } from '../utils/snippets';

interface SnippetsPanelProps {
  language: Language | null;
  onInsert: (code: string) => void;
  onClose: () => void;
}

export function SnippetsPanel({ language, onInsert, onClose }: SnippetsPanelProps) {
  const snippets = language
    ? SNIPPETS.filter((s) => s.language === language)
    : SNIPPETS;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal snippets-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Code Snippets</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="snippets-grid">
          {snippets.map((s) => (
            <button
              key={s.id}
              className="snippet-card"
              onClick={() => {
                onInsert(s.code);
                onClose();
              }}
            >
              <span className="snippet-name">{s.name}</span>
              <span className="snippet-desc">{s.description}</span>
              <span className="snippet-lang">{s.language}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
