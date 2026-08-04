import { useMemo, useState } from 'react';
import { X, Copy, Check, Braces, Regex } from 'lucide-react';

interface DevToolsPanelProps {
  onClose: () => void;
  onCopy?: (text: string) => void;
}

type Tab = 'json' | 'regex';

export function DevToolsPanel({ onClose, onCopy }: DevToolsPanelProps) {
  const [tab, setTab] = useState<Tab>('json');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal devtools-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Developer Tools</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="devtools-tabs">
          <button
            className={`devtools-tab ${tab === 'json' ? 'active' : ''}`}
            onClick={() => setTab('json')}
          >
            <Braces size={14} />
            JSON
          </button>
          <button
            className={`devtools-tab ${tab === 'regex' ? 'active' : ''}`}
            onClick={() => setTab('regex')}
          >
            <Regex size={14} />
            Regex
          </button>
        </div>

        <div className="modal-body devtools-body">
          {tab === 'json' ? <JsonTool onCopy={onCopy} /> : <RegexTool />}
        </div>
      </div>
    </div>
  );
}

function JsonTool({ onCopy }: { onCopy?: (text: string) => void }) {
  const [input, setInput] = useState('{"name":"CodeFlow","version":1,"features":["editor","run","share"]}');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const format = (minify = false) => {
    try {
      const parsed = JSON.parse(input);
      setOutput(minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
    }
  };

  const validate = () => {
    try {
      JSON.parse(input);
      setError('');
      setOutput('✓ Valid JSON');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    onCopy?.(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="devtools-tool">
      <p className="devtools-hint">Format API responses, config files, and debug JSON payloads.</p>
      <textarea
        className="devtools-textarea"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste JSON here..."
        spellCheck={false}
      />
      <div className="devtools-actions">
        <button className="btn btn-primary" onClick={() => format(false)}>Format</button>
        <button className="btn" onClick={() => format(true)}>Minify</button>
        <button className="btn" onClick={validate}>Validate</button>
      </div>
      {error && <div className="devtools-error">{error}</div>}
      {output && (
        <div className="devtools-output-wrap">
          <div className="devtools-output-header">
            <span>Output</span>
            <button className="btn-icon" onClick={handleCopy} title="Copy">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <pre className="devtools-output">{output}</pre>
        </div>
      )}
    </div>
  );
}

function RegexTool() {
  const [pattern, setPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState(
    'Contact us: hello@codeflow.dev or support@example.com\nInvalid: not-an-email',
  );

  const result = useMemo(() => {
    try {
      const regex = new RegExp(pattern, flags);
      const matches = text.match(regex);
      return { error: '', regex, matches, highlighted: highlightMatches(text, regex) };
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : 'Invalid regex',
        regex: null,
        matches: null,
        highlighted: null,
      };
    }
  }, [pattern, flags, text]);

  return (
    <div className="devtools-tool">
      <p className="devtools-hint">Test email patterns, log parsers, and validation rules before using in code.</p>
      <div className="regex-input-row">
        <span className="regex-slash">/</span>
        <input
          className="regex-pattern"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="pattern"
          spellCheck={false}
        />
        <span className="regex-slash">/</span>
        <input
          className="regex-flags"
          value={flags}
          onChange={(e) => setFlags(e.target.value)}
          placeholder="flags"
          spellCheck={false}
        />
      </div>
      <textarea
        className="devtools-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Test string..."
        spellCheck={false}
      />
      {result.error && <div className="devtools-error">{result.error}</div>}
      {!result.error && (
        <div className="devtools-output-wrap">
          <div className="devtools-output-header">
            <span>{result.matches ? `${result.matches.length} match(es)` : 'No matches'}</span>
          </div>
          <pre className="devtools-output regex-result">{result.highlighted}</pre>
          {result.matches && result.matches.length > 0 && (
            <div className="regex-match-list">
              {result.matches.map((m, i) => (
                <code key={i} className="regex-match-item">{m}</code>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function highlightMatches(text: string, regex: RegExp) {
  const parts: { text: string; match: boolean }[] = [];
  const globalRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = globalRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), match: false });
    }
    parts.push({ text: match[0], match: true });
    lastIndex = globalRegex.lastIndex;
    if (match[0].length === 0) globalRegex.lastIndex++;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), match: false });
  }

  return parts.map((p, i) =>
    p.match ? (
      <mark key={i} className="regex-highlight">{p.text}</mark>
    ) : (
      <span key={i}>{p.text}</span>
    ),
  );
}
