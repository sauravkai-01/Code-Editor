import {
  Play,
  Save,
  Share2,
  Settings,
  Sun,
  Moon,
  PanelLeft,
  Terminal,
  MessageSquare,
  Github,
  Download,
  Cloud,
  Eye,
  Search,
  Braces,
  Wrench,
} from 'lucide-react';

interface ToolbarProps {
  theme: 'dark' | 'light';
  running: boolean;
  sidebarCollapsed: boolean;
  consoleOpen: boolean;
  chatOpen: boolean;
  previewOpen: boolean;
  onRun: () => void;
  onSave: () => void;
  onShare: () => void;
  onSettings: () => void;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onToggleConsole: () => void;
  onToggleChat: () => void;
  onTogglePreview: () => void;
  // onSearch: () => void;
  onSnippets: () => void;

  onDevTools: () => void;
  onCommandPalette: () => void;
  onExport: () => void;
  onCloudSave: () => void;
  onGitHub: () => void;
}

export function Toolbar({
  theme,
  running,
  consoleOpen,
  chatOpen,
  previewOpen,
  onRun,
  onSave,
  onShare,
  onSettings,
  onToggleTheme,
  onToggleSidebar,
  onToggleConsole,
  onToggleChat,
  onTogglePreview,
  // onSearch,
  onSnippets,
  onDevTools,
  onCommandPalette,
  onExport,
  onCloudSave,
  onGitHub,
}: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <button className="btn-icon" onClick={onToggleSidebar} title="Toggle Sidebar (Ctrl+B)">
          <PanelLeft size={18} />
        </button>
        <button className="btn-icon" onClick={onCommandPalette} title="Command Palette (Ctrl+Shift+P)">
          <Search size={18} />
        </button>
        <div className="logo">
          <span className="logo-icon">{'</>'}</span>
          <span className="logo-text">CodeFlow</span>
        </div>
      </div>

      <div className="toolbar-center">
        <button className="btn btn-primary" onClick={onRun} disabled={running} title="Run (Ctrl+Enter)">
          <Play size={16} />
          {running ? 'Running...' : 'Run'}
        </button>
        <button className="btn" onClick={onSave} title="Save (Ctrl+S)">
          <Save size={16} />
          Save
        </button>
        <button className="btn" onClick={onShare} title="Share project">
          <Share2 size={16} />
          Share
        </button>
        <button className="btn" onClick={onTogglePreview} title="Toggle preview">
          <Eye size={16} />
          Preview
        </button>
        <button className="btn" onClick={onSnippets} title="Insert snippet">
          <Braces size={16} />
          Snippets
        </button>
        <button className="btn" onClick={onDevTools} title="JSON formatter & regex tester">
          <Wrench size={16} />
          Tools
        </button>
        <button className="btn" onClick={onExport} title="Export as ZIP">
          <Download size={16} />
          Export
        </button>
        <button className="btn" onClick={onCloudSave} title="Save to cloud">
          <Cloud size={16} />
          Cloud
        </button>
        <button className="btn" onClick={onGitHub} title="GitHub integration">
          <Github size={16} />
          GitHub
        </button>
      </div>

      <div className="toolbar-right">
        <button
          className={`btn-icon ${previewOpen ? 'active' : ''}`}
          onClick={onTogglePreview}
          title="Live Preview"
        >
          <Eye size={18} />
        </button>
        <button
          className={`btn-icon ${consoleOpen ? 'active' : ''}`}
          onClick={onToggleConsole}
          title="Console (Ctrl+`)"
        >
          <Terminal size={18} />
        </button>
        <button
          className={`btn-icon ${chatOpen ? 'active' : ''}`}
          onClick={onToggleChat}
          title="Chat"
        >
          <MessageSquare size={18} />
        </button>
        <button className="btn-icon" onClick={onToggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="btn-icon" onClick={onSettings} title="Settings">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
