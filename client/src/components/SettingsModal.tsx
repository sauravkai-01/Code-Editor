import { X } from 'lucide-react';
import type { EditorSettings } from '../types';

interface SettingsModalProps {
  settings: EditorSettings;
  onUpdate: (partial: Partial<EditorSettings>) => void;
  onClose: () => void;
}

export function SettingsModal({ settings, onUpdate, onClose }: SettingsModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="setting-row">
            <label>Font Size</label>
            <input
              type="range"
              min={10}
              max={24}
              value={settings.fontSize}
              onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
            />
            <span>{settings.fontSize}px</span>
          </div>

          <div className="setting-row">
            <label>Tab Size</label>
            <select
              value={settings.tabSize}
              onChange={(e) => onUpdate({ tabSize: Number(e.target.value) })}
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </div>

          <div className="setting-row">
            <label>Word Wrap</label>
            <input
              type="checkbox"
              checked={settings.wordWrap}
              onChange={(e) => onUpdate({ wordWrap: e.target.checked })}
            />
          </div>

          <div className="setting-row">
            <label>Minimap</label>
            <input
              type="checkbox"
              checked={settings.minimap}
              onChange={(e) => onUpdate({ minimap: e.target.checked })}
            />
          </div>

          <div className="setting-row">
            <label>Auto Save</label>
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => onUpdate({ autoSave: e.target.checked })}
            />
          </div>

          <div className="shortcuts-section">
            <h3>Keyboard Shortcuts</h3>
            <div className="shortcut"><kbd>Ctrl+Enter</kbd> Run code</div>
            <div className="shortcut"><kbd>Ctrl+S</kbd> Save file</div>
            <div className="shortcut"><kbd>Ctrl+N</kbd> New file</div>
            <div className="shortcut"><kbd>Ctrl+W</kbd> Close tab</div>
            <div className="shortcut"><kbd>Ctrl+B</kbd> Toggle sidebar</div>
            <div className="shortcut"><kbd>Ctrl+`</kbd> Toggle console</div>
            <div className="shortcut"><kbd>Ctrl+Shift+P</kbd> Command palette</div>
            <div className="shortcut"><kbd>Ctrl+Shift+F</kbd> Search in project</div>
            <div className="shortcut"><kbd>Ctrl+Shift+V</kbd> Toggle preview</div>
            <div className="shortcut"><kbd>Shift+Alt+F</kbd> Format document</div>
          </div>
        </div>
      </div>
    </div>
  );
}
