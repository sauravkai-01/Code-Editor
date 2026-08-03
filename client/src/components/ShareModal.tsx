import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareModalProps {
  shareUrl: string;
  onClose: () => void;
}


export function ShareModal({ shareUrl, onClose }: ShareModalProps) {



  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Share Project</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="share-desc">
            Anyone with this link can view and collaborate on your project in real time.
          </p>
          <div className="share-url-row">
            <input type="text" readOnly value={shareUrl} className="share-url-input" />
            <button className="btn btn-primary" onClick={handleCopy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
