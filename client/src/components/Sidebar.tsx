import { useRef, useState } from 'react';
import {
  FileCode,
  FilePlus,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Trash2,
  Upload,
  Pencil,
  Clock,
} from 'lucide-react';
import type { FileNode } from '../types';
import type { RecentProject } from '../utils/recentProjects';
import { PROJECT_TEMPLATES } from '../utils/templates';

interface SidebarProps {
  files: FileNode[];
  activeFileId: string | null;
  collapsed: boolean;
  recentProjects: RecentProject[];
  onSelectFile: (id: string) => void;
  onNewFile: () => void;
  onDeleteFile: (id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
  onImportFiles: (files: FileList) => void;
  onLoadRecent: (project: RecentProject) => void;
  onLoadTemplate: (templateId: string) => void;
  projectName: string;
  onRenameProject: (name: string) => void;
}

export function Sidebar({
  files,
  activeFileId,
  collapsed,
  recentProjects,
  onSelectFile,
  onNewFile,
  onDeleteFile,
  onRenameFile,
  onImportFiles,
  onLoadRecent,
  onLoadTemplate,
  projectName,
  onRenameProject,
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renamingProject, setRenamingProject] = useState(false);
  const [projectNameValue, setProjectNameValue] = useState(projectName);

  if (collapsed) return null;

  const startRename = (file: FileNode) => {
    setRenamingId(file.id);
    setRenameValue(file.name);
  };

  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      onRenameFile(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const commitProjectRename = () => {
    if (projectNameValue.trim()) onRenameProject(projectNameValue.trim());
    setRenamingProject(false);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <FolderOpen size={16} />
        {renamingProject ? (
          <input
            className="rename-input"
            value={projectNameValue}
            onChange={(e) => setProjectNameValue(e.target.value)}
            onBlur={commitProjectRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitProjectRename();
              if (e.key === 'Escape') setRenamingProject(false);
            }}
            autoFocus
          />
        ) : (
          <span
            className="sidebar-title editable"
            onDoubleClick={() => {
              setProjectNameValue(projectName);
              setRenamingProject(true);
            }}
            title="Double-click to rename"
          >
            {projectName}
          </span>
        )}
      </div>

      <div className="sidebar-actions">
        <button className="btn-icon" onClick={onNewFile} title="New File (Ctrl+N)">
          <FilePlus size={16} />
        </button>
        <button className="btn-icon" onClick={() => fileInputRef.current?.click()} title="Import files">
          <Upload size={16} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          accept=".js,.jsx,.ts,.py,.cpp,.cc,.h,.html,.htm,.css,.txt"
          onChange={(e) => {
            if (e.target.files?.length) onImportFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      <nav className="file-tree">
        {files.map((file) => (
          <div
            key={file.id}
            className={`file-item ${activeFileId === file.id ? 'active' : ''}`}
            onClick={() => !renamingId && onSelectFile(file.id)}
          >
            <FileCode size={14} className="file-icon" />
            {renamingId === file.id ? (
              <input
                className="rename-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') commitRename();
                  if (e.key === 'Escape') setRenamingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <span className="file-name">{file.name}</span>
            )}
            <button
              className="btn-icon file-action"
              onClick={(e) => {
                e.stopPropagation();
                startRename(file);
              }}
              title="Rename"
            >
              <Pencil size={11} />
            </button>
            <button
              className="btn-icon file-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFile(file.id);
              }}
              title="Delete file"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </nav>

      {recentProjects.length > 0 && (
        <div className="sidebar-section">
          <details>
            <summary>
              <ChevronRight size={14} className="chevron-closed" />
              <ChevronDown size={14} className="chevron-open" />
              <Clock size={12} />
              Recent
            </summary>
            <div className="recent-list">
              {recentProjects.map((p) => (
                <button
                  key={p.id}
                  className="recent-item"
                  onClick={() => onLoadRecent(p)}
                  title={`${p.fileCount} files`}
                >
                  <span className="recent-name">{p.name}</span>
                  <span className="recent-date">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          </details>
        </div>
      )}

      <div className="sidebar-section">
        <details>
          <summary>
            <ChevronRight size={14} className="chevron-closed" />
            <ChevronDown size={14} className="chevron-open" />
            Templates
          </summary>
          <div className="template-list">
            {PROJECT_TEMPLATES.map((t) => (
              <button
                key={t.id}
                className="template-item"
                onClick={() => onLoadTemplate(t.id)}
                title={t.description}
              >
                <span className="template-name">{t.name}</span>
                <span className="template-desc">{t.description}</span>
              </button>
            ))}
          </div>
        </details>
      </div>

      <div className="sidebar-footer">
        <details>
          <summary>
            <ChevronRight size={14} className="chevron-closed" />
            <ChevronDown size={14} className="chevron-open" />
            Plugins
          </summary>
          <div className="plugin-list">
            <span className="plugin-item active">ESLint</span>
            <span className="plugin-item active">Prettier</span>
            <span className="plugin-item">GitHub Sync</span>
          </div>
        </details>
      </div>
    </aside>
  );
}
