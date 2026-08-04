import { Trash2, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { ConsoleMessage } from '../types';

interface ConsolePanelProps {
  messages: ConsoleMessage[];
  stdin: string;
  onStdinChange: (value: string) => void;
  onClear: () => void;
}

export function ConsolePanel({ messages, stdin, onStdinChange, onClear }: ConsolePanelProps) {
  const [stdinOpen, setStdinOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const outputText = messages
    .map((m) => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.text}`)
    .join('\n');

  const handleCopy = async () => {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="console-panel">
      <div className="panel-header">
        <span>Console</span>
        <div className="panel-header-actions">
          <button
            className="btn-icon"
            onClick={handleCopy}
            title="Copy output"
            disabled={messages.length === 0}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button className="btn-icon" onClick={onClear} title="Clear console">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="stdin-section">
        <button
          className="stdin-toggle"
          onClick={() => setStdinOpen((v) => !v)}
          title="Program input (stdin) for Python/C++"
        >
          {stdinOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span>STDIN Input</span>
          {stdin.trim() && <span className="stdin-badge">has data</span>}
        </button>
        {stdinOpen && (
          <textarea
            className="stdin-textarea"
            value={stdin}
            onChange={(e) => onStdinChange(e.target.value)}
            placeholder="Enter program input (one value per line)&#10;e.g. for C++: 5&#10;1 2 3 4 5"
            spellCheck={false}
          />
        )}
      </div>

      <div className="console-output">
        {messages.length === 0 ? (
          <span className="console-empty">Run code to see output here (Ctrl+Enter)</span>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`console-line console-${msg.type}`}>
              <span className="console-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
              <span className="console-text">{msg.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
