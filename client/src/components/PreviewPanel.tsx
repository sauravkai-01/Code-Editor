import { RefreshCw, X } from 'lucide-react';
import { useMemo } from 'react';
import type { FileNode } from '../types';
import { buildPreviewHtml } from '../utils/preview';

interface PreviewPanelProps {
  files: FileNode[];
  onClose: () => void;
}

export function PreviewPanel({ files, onClose }: PreviewPanelProps) {
  const html = useMemo(() => buildPreviewHtml(files), [files]);

  const handleRefresh = () => {
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
    if (iframe) iframe.srcdoc = buildPreviewHtml(files);
  };

  return (
    <div className="preview-panel">
      <div className="panel-header">
        <span>Live Preview</span>
        <div className="panel-header-actions">
          <button className="btn-icon" onClick={handleRefresh} title="Refresh preview">
            <RefreshCw size={14} />
          </button>
          <button className="btn-icon" onClick={onClose} title="Close preview">
            <X size={14} />
          </button>
        </div>
      </div>
      <iframe
        id="preview-iframe"
        className="preview-iframe"
        srcDoc={html}
        sandbox="allow-scripts"
        title="HTML Preview"
      />
    </div>
  );
}
