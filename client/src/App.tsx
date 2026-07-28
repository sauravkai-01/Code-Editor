import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import JSZip from 'jszip';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { TabBar } from './components/TabBar';
import { CodeEditor, type CodeEditorHandle } from './components/CodeEditor';
import { ConsolePanel } from './components/ConsolePanel';
import { ChatPanel } from './components/ChatPanel';
import { SettingsModal } from './components/SettingsModal';
import { ShareModal } from './components/ShareModal';
import { CommandPalette, SearchPanel, type CommandItem } from './components/CommandPalette';
import { PreviewPanel } from './components/PreviewPanel';
import { SnippetsPanel } from './components/SnippetsPanel';
import { DevToolsPanel } from './components/DevToolsPanel';
import { StatusBar } from './components/StatusBar';
import { ToastContainer } from './components/ToastContainer';
import { useTheme, useSettings, useKeyboardShortcuts } from './hooks/useTheme';
import { useCodeRunner } from './hooks/useCodeRunner';
import { useCollaboration } from './hooks/useCollaboration';
import { useToast } from './hooks/useToast';
import { PROJECT_TEMPLATES } from './utils/templates';
import { createDefaultProject, createId, getLanguageFromFilename } from './utils/project';
import { getRecentProjects, saveRecentProject, type RecentProject } from './utils/recentProjects';
import type { FileNode, Project } from './types';
import './styles/index.css';

function getRoomIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('room');
}

function getUserName(): string {
  const stored = localStorage.getItem('codeflow-username');
  if (stored) return stored;
  const name = `User${Math.floor(Math.random() * 1000)}`;
  localStorage.setItem('codeflow-username', name);
  return name;
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const { run, running, messages, clearConsole, stdin, setStdin } = useCodeRunner();


  const { toasts, showToast, dismiss } = useToast();
  const editorRef = useRef<CodeEditorHandle>(null);

  const [project, setProject] = useState<Project>(createDefaultProject);
  const [openTabs, setOpenTabs] = useState<string[]>([project.files[0].id]);
  const [activeFileId, setActiveFileId] = useState<string | null>(project.files[0].id);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [snippetsOpen, setSnippetsOpen] = useState(false);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [userName] = useState(getUserName);
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>(getRecentProjects);

  const roomId = useMemo(() => getRoomIdFromUrl() ?? project.shareId ?? project.id, [project]);
  const isRemoteChange = useRef(false);

  const canEdit = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') !== 'view';
  }, [roomId]);


  const activeFile = project.files.find((f) => f.id === activeFileId) ?? null;

  const handleRemoteChange = useCallback((fileId: string, content: string) => {
    isRemoteChange.current = true;
    setProject((prev) => ({
      ...prev,
      files: prev.files.map((f) => (f.id === fileId ? { ...f, content } : f)),
    }));
  }, []);

  const handleFilesSync = useCallback((files: FileNode[]) => {
    isRemoteChange.current = true;
    setProject((prev) => ({ ...prev, files }));
  }, []);

  // Remote cursors currently used for rendering is handled inside CodeEditor.


  const { connected, collaborators, chatMessages, broadcastChange, syncFiles, sendChat } =

    useCollaboration({
      roomId,
      userName,
      canEdit,
      onRemoteChange: handleRemoteChange,
      onFilesSync: handleFilesSync,
      onRemoteCursor: (_userId, _remoteName, _fileId, _line, _column) => {
        // TODO: Monaco decoration rendering will read remoteCursors from state.
      },

    });






  const codeBroadcastTimers = useRef<Record<string, number>>({});

  const updateFileContent = useCallback(
    (content: string) => {
      if (!activeFileId) return;
      const fileId = activeFileId;

      setProject((prev) => ({
        ...prev,
        files: prev.files.map((f) => (f.id === fileId ? { ...f, content } : f)),
      }));

      if (!isRemoteChange.current) {
        // Debounce network broadcasts to improve collaboration performance.
        const existing = codeBroadcastTimers.current[fileId];
        if (existing) window.clearTimeout(existing);

        codeBroadcastTimers.current[fileId] = window.setTimeout(() => {
          broadcastChange(fileId, content);
        }, 200);
      }

      isRemoteChange.current = false;
    },
    [broadcastChange],
  );


  const handleSave = useCallback(async () => {
    saveRecentProject(project);
    setRecentProjects(getRecentProjects());
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      const data = await res.json();
      if (data.shareId) {
        setProject((prev) => ({ ...prev, shareId: data.shareId }));
      }
      showToast('Project saved to cloud', 'success');
      syncFiles(project.files);
    } catch {
      localStorage.setItem('codeflow-project', JSON.stringify(project));
      showToast('Project saved locally', 'success');
    }
  }, [project, showToast, syncFiles]);

  const handleRun = useCallback(() => {
    if (!activeFile) return;
    setConsoleOpen(true);
    run(activeFile.content, activeFile.language, activeFile.name);
  }, [activeFile, run]);

  const handleShare = useCallback(async () => {
    try {
      const res = await fetch('/api/projects/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      const data = await res.json();
      const url = `${window.location.origin}?room=${data.shareId}`;
      setShareUrl(url);
      setShareOpen(true);
      window.history.replaceState({}, '', `?room=${data.shareId}`);
      showToast('Share link created', 'success');
    } catch {
      const url = `${window.location.origin}?room=${roomId}`;
      setShareUrl(url);
      setShareOpen(true);
    }
  }, [project, roomId, showToast]);

  const handleExport = useCallback(async () => {
    const zip = new JSZip();
    project.files.forEach((f) => zip.file(f.name, f.content));
    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}.zip`;
    a.click();
    showToast('Project exported as ZIP', 'success');
  }, [project, showToast]);

  const handleGitHub = useCallback(() => {
    window.open('/auth/github', '_blank', 'width=600,height=700');
  }, []);

  const handleSelectFile = useCallback((id: string, line?: number) => {
    setActiveFileId(id);
    setOpenTabs((prev) => (prev.includes(id) ? prev : [...prev, id]));
    if (line) setTimeout(() => editorRef.current?.goToLine(line), 100);
  }, []);

  const handleCloseTab = useCallback(
    (id: string) => {
      setOpenTabs((prev) => {
        const next = prev.filter((t) => t !== id);
        if (activeFileId === id && next.length > 0) {
          setActiveFileId(next[next.length - 1]);
        } else if (next.length === 0) {
          setActiveFileId(null);
        }
        return next;
      });
    },
    [activeFileId],
  );

  const handleNewFile = useCallback(() => {
    const name = prompt('File name (e.g. utils.js):', 'untitled.js');
    if (!name) return;
    const file: FileNode = {
      id: createId(),
      name,
      language: getLanguageFromFilename(name),
      content: '',
    };
    setProject((prev) => {
      const next = { ...prev, files: [...prev.files, file] };
      syncFiles(next.files);
      return next;
    });
    handleSelectFile(file.id);
  }, [handleSelectFile, syncFiles]);

  const handleDeleteFile = useCallback(
    (id: string) => {
      if (project.files.length <= 1) return;
      setProject((prev) => {
        const next = { ...prev, files: prev.files.filter((f) => f.id !== id) };
        syncFiles(next.files);
        return next;
      });
      handleCloseTab(id);
    },
    [project.files.length, handleCloseTab, syncFiles],
  );

  const handleRenameFile = useCallback(
    (id: string, newName: string) => {
      setProject((prev) => ({
        ...prev,
        files: prev.files.map((f) =>
          f.id === id
            ? { ...f, name: newName, language: getLanguageFromFilename(newName) }
            : f,
        ),
      }));
      showToast(`Renamed to ${newName}`, 'info');
    },
    [showToast],
  );

  const handleImportFiles = useCallback(
    async (fileList: FileList) => {
      const newFiles: FileNode[] = [];
      for (const file of Array.from(fileList)) {
        const content = await file.text();
        newFiles.push({
          id: createId(),
          name: file.name,
          language: getLanguageFromFilename(file.name),
          content,
        });
      }
      setProject((prev) => {
        const next = { ...prev, files: [...prev.files, ...newFiles] };
        syncFiles(next.files);
        return next;
      });
      if (newFiles[0]) handleSelectFile(newFiles[0].id);
      showToast(`Imported ${newFiles.length} file(s)`, 'success');
    },
    [handleSelectFile, showToast, syncFiles],
  );

  const handleLoadTemplate = useCallback(
    (templateId: string) => {
      const template = PROJECT_TEMPLATES.find((t) => t.id === templateId);
      if (!template) return;
      const next = template.create();
      setProject(next);
      setOpenTabs(next.files.map((f) => f.id));
      setActiveFileId(next.files[0]?.id ?? null);
      syncFiles(next.files);
      showToast(`Loaded "${template.name}" template`, 'success');
    },
    [showToast, syncFiles],
  );

  const handleLoadRecent = useCallback(
    (recent: RecentProject) => {
      setProject(recent.snapshot);
      setOpenTabs(recent.snapshot.files.map((f) => f.id));
      setActiveFileId(recent.snapshot.files[0]?.id ?? null);
      showToast(`Loaded "${recent.name}"`, 'info');
    },
    [showToast],
  );

  const handleInsertSnippet = useCallback(
    (code: string) => {
      editorRef.current?.insertText(code);
      showToast('Snippet inserted', 'success');
    },
    [showToast],
  );

  const commands: CommandItem[] = useMemo(
    () => [
      { id: 'run', label: 'Run Code', shortcut: 'Ctrl+Enter', group: 'Execution', action: handleRun },
      { id: 'save', label: 'Save Project', shortcut: 'Ctrl+S', group: 'File', action: handleSave },
      { id: 'new', label: 'New File', shortcut: 'Ctrl+N', group: 'File', action: handleNewFile },
      { id: 'export', label: 'Export as ZIP', group: 'File', action: handleExport },
      { id: 'share', label: 'Share Project', group: 'File', action: handleShare },
      { id: 'format', label: 'Format Document', shortcut: 'Shift+Alt+F', group: 'Editor', action: () => editorRef.current?.format() },
      { id: 'find', label: 'Find in File', shortcut: 'Ctrl+F', group: 'Editor', action: () => editorRef.current?.focusFind() },
      { id: 'search', label: 'Search in Project', shortcut: 'Ctrl+Shift+F', group: 'Editor', action: () => setSearchOpen(true) },
      { id: 'snippets', label: 'Insert Snippet', group: 'Editor', action: () => setSnippetsOpen(true) },
      { id: 'devtools', label: 'Developer Tools (JSON / Regex)', group: 'Tools', action: () => setDevToolsOpen(true) },
      { id: 'preview', label: 'Toggle Live Preview', group: 'View', action: () => setPreviewOpen((v) => !v) },
      { id: 'console', label: 'Toggle Console', shortcut: 'Ctrl+`', group: 'View', action: () => setConsoleOpen((v) => !v) },
      { id: 'chat', label: 'Toggle Chat', group: 'View', action: () => setChatOpen((v) => !v) },
      { id: 'sidebar', label: 'Toggle Sidebar', shortcut: 'Ctrl+B', group: 'View', action: () => setSidebarCollapsed((v) => !v) },
      { id: 'theme', label: 'Toggle Theme', group: 'View', action: toggleTheme },
      { id: 'settings', label: 'Open Settings', group: 'Preferences', action: () => setSettingsOpen(true) },
    ],
    [handleRun, handleSave, handleNewFile, handleExport, handleShare, toggleTheme],
  );

  useKeyboardShortcuts({
    save: handleSave,
    run: handleRun,
    newFile: handleNewFile,
    closeTab: () => activeFileId && handleCloseTab(activeFileId),
    toggleSidebar: () => setSidebarCollapsed((v) => !v),
    toggleConsole: () => setConsoleOpen((v) => !v),
    commandPalette: () => setCommandOpen(true),
    searchProject: () => setSearchOpen(true),
    togglePreview: () => setPreviewOpen((v) => !v),
  });

  useEffect(() => {
    if (!settings.autoSave) return;
    const timer = setInterval(() => {
      localStorage.setItem('codeflow-project', JSON.stringify(project));
      saveRecentProject(project);
    }, 30000);
    return () => clearInterval(timer);
  }, [project, settings.autoSave]);

  useEffect(() => {
    const room = getRoomIdFromUrl();
    if (!room) return;

    // If entering view mode, ensure we do not keep local edit history from previous sessions
    // (remote updates will still apply)


    fetch(`/api/projects/share/${room}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.files) {
          setProject(data);
          setOpenTabs(data.files.map((f: FileNode) => f.id));
          setActiveFileId(data.files[0]?.id ?? null);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="app">
      <Toolbar
        theme={theme}
        running={running}
        sidebarCollapsed={sidebarCollapsed}
        consoleOpen={consoleOpen}
        chatOpen={chatOpen}
        previewOpen={previewOpen}
        onRun={handleRun}
        onSave={handleSave}
        onShare={handleShare}
        onSettings={() => setSettingsOpen(true)}
        onToggleTheme={toggleTheme}
        onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
        onToggleConsole={() => setConsoleOpen((v) => !v)}
        onToggleChat={() => setChatOpen((v) => !v)}
        onTogglePreview={() => setPreviewOpen((v) => !v)}

        onSnippets={() => setSnippetsOpen(true)}
        onDevTools={() => setDevToolsOpen(true)}
        onCommandPalette={() => setCommandOpen(true)}
        onExport={handleExport}
        onCloudSave={handleSave}
        onGitHub={handleGitHub}
      />

      <div className="main-layout">
        <Sidebar
          files={project.files}
          activeFileId={activeFileId}
          collapsed={sidebarCollapsed}
          recentProjects={recentProjects}
          onSelectFile={handleSelectFile}
          onNewFile={handleNewFile}
          onDeleteFile={handleDeleteFile}
          onRenameFile={handleRenameFile}
          onImportFiles={handleImportFiles}
          onLoadRecent={handleLoadRecent}
          onLoadTemplate={handleLoadTemplate}
          projectName={project.name}
          onRenameProject={(name) => setProject((p) => ({ ...p, name }))}
        />

        <div className="editor-area">
          <TabBar
            openTabs={openTabs}
            files={project.files}
            activeFileId={activeFileId}
            onSelectTab={handleSelectFile}
            onCloseTab={handleCloseTab}
          />

          <div className={`editor-split ${previewOpen ? 'with-preview' : ''}`}>
            <div className="editor-container">
              {activeFile ? (
                <CodeEditor
                  ref={editorRef}
                  key={activeFile.id}
                  value={activeFile.content}
                  language={activeFile.language}
                  theme={theme}
                  settings={settings}
                  onChange={updateFileContent}
                  onSave={handleSave}
                  onCursorChange={(line, column) => setCursor({ line, column })}
                />
              ) : (
                <div className="editor-empty">Open a file to start coding</div>
              )}
            </div>

            {previewOpen && (
              <PreviewPanel files={project.files} onClose={() => setPreviewOpen(false)} />
            )}
          </div>

          {consoleOpen && (
            <ConsolePanel
              messages={messages}
              stdin={stdin}
              onStdinChange={setStdin}
              onClear={clearConsole}
            />
          )}

          <StatusBar
            fileName={activeFile?.name ?? null}
            language={activeFile?.language ?? null}
            line={cursor.line}
            column={cursor.column}
            collaborators={collaborators.length}
            connected={connected}
            previewOpen={previewOpen}
          />
        </div>

        {chatOpen && (
          <ChatPanel
            messages={chatMessages}
            userName={userName}
            collaborators={collaborators}
            onSend={sendChat}
            connected={connected}
          />
        )}

      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <CommandPalette open={commandOpen} commands={commands} onClose={() => setCommandOpen(false)} />
      <SearchPanel
        open={searchOpen}
        files={project.files}
        onSelect={handleSelectFile}
        onClose={() => setSearchOpen(false)}
      />

      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdate={updateSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {shareOpen && (
          <ShareModal
          shareUrl={shareUrl}
          onClose={() => setShareOpen(false)}
        />

      )}


      {snippetsOpen && (
        <SnippetsPanel
          language={activeFile?.language ?? null}
          onInsert={handleInsertSnippet}
          onClose={() => setSnippetsOpen(false)}
        />
      )}

      {devToolsOpen && (
        <DevToolsPanel
          onClose={() => setDevToolsOpen(false)}
          onCopy={() => showToast('Copied to clipboard', 'success')}
        />
      )}
    </div>
  );
}
