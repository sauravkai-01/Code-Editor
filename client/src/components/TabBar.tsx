import { X } from 'lucide-react';
import type { FileNode } from '../types';

interface TabBarProps {
  openTabs: string[];
  files: FileNode[];
  activeFileId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
}

export function TabBar({ openTabs, files, activeFileId, onSelectTab, onCloseTab }: TabBarProps) {
  return (
    <div className="tab-bar">
      {openTabs.map((tabId) => {
        const file = files.find((f) => f.id === tabId);
        if (!file) return null;

        return (
          <div
            key={tabId}
            className={`tab ${activeFileId === tabId ? 'active' : ''}`}
            onClick={() => onSelectTab(tabId)}
          >
            <span className="tab-lang">{file.language.slice(0, 2).toUpperCase()}</span>
            <span className="tab-name">{file.name}</span>
            <button
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tabId);
              }}
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
