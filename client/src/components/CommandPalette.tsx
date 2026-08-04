import { useEffect, useRef, useState } from 'react';
import { Search, Command } from 'lucide-react';

export interface CommandItem {
  id: string;
  label: string;
  shortcut?: string;
  group: string;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  commands: CommandItem[];
  onClose: () => void;
}

export function CommandPalette({ open, commands, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.group.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  if (!open) return null;

  const run = (cmd: CommandItem) => {
    onClose();
    cmd.action();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter' && filtered[selected]) {
      e.preventDefault();
      run(filtered[selected]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const groups = [...new Set(filtered.map((c) => c.group))];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <div className="command-input-row">
          <Command size={16} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
          />
        </div>
        <div className="command-list">
          {filtered.length === 0 ? (
            <div className="command-empty">No matching commands</div>
          ) : (
            groups.map((group) => (
              <div key={group}>
                <div className="command-group-label">{group}</div>
                {filtered
                  .filter((c) => c.group === group)
                  .map((cmd) => {
                    const idx = filtered.indexOf(cmd);
                    return (
                      <button
                        key={cmd.id}
                        className={`command-item ${idx === selected ? 'selected' : ''}`}
                        onClick={() => run(cmd)}
                        onMouseEnter={() => setSelected(idx)}
                      >
                        <span>{cmd.label}</span>
                        {cmd.shortcut && <kbd>{cmd.shortcut}</kbd>}
                      </button>
                    );
                  })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface SearchPanelProps {
  open: boolean;
  files: { id: string; name: string; content: string }[];
  onSelect: (fileId: string, line?: number) => void;
  onClose: () => void;
}

export function SearchPanel({ open, files, onSelect, onClose }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  const results = query.length >= 2
    ? files.flatMap((file) => {
        const lines = file.content.split('\n');
        return lines
          .map((line, i) => ({ file, line: i + 1, text: line }))
          .filter((r) => r.text.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 5)
          .map((r) => ({ ...r, key: `${r.file.id}:${r.line}` }));
      }).slice(0, 30)
    : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="command-palette search-panel" onClick={(e) => e.stopPropagation()}>
        <div className="command-input-row">
          <Search size={16} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
            placeholder="Search in project files..."
          />
        </div>
        <div className="command-list">
          {query.length < 2 ? (
            <div className="command-empty">Type at least 2 characters to search</div>
          ) : results.length === 0 ? (
            <div className="command-empty">No results found</div>
          ) : (
            results.map((r) => (
              <button
                key={r.key}
                className="command-item search-result"
                onClick={() => {
                  onSelect(r.file.id, r.line);
                  onClose();
                }}
              >
                <span className="search-file">{r.file.name}:{r.line}</span>
                <span className="search-line">{r.text.trim().slice(0, 80)}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
