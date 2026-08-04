import { useRef, useState, useEffect } from 'react';

import { Send, Sparkles } from 'lucide-react';
import type { ChatMessage } from '../types';
import { useSentiment } from '../hooks/useSentiment';

interface ChatPanelProps {


  messages: ChatMessage[];
  userName: string;
  collaborators: { id: string; name: string; color: string }[];
  onSend: (text: string, sentiment?: ChatMessage['sentiment']) => void;
  connected: boolean;
}

export function ChatPanel({ messages, userName, collaborators, onSend, connected }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const { analyze } = useSentiment();

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');

    // Sentiment analysis is best-effort; UI should still send message even if it fails.
    try {
      const sentiment = await analyze(text);
      onSend(text, sentiment);
    } catch {
      onSend(text);
    }
  };


  return (
    <div className="chat-panel">
      <div className="panel-header">
        <span>Team Chat {connected ? '🟢' : '🔴'}</span>
        <div className="collaborators">
          {collaborators.map((c) => (
            <span key={c.id} className="collab-badge" style={{ borderColor: c.color }} title={c.name}>
              {c.name[0].toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <span className="chat-empty">No messages yet. Say hello!</span>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`chat-msg ${msg.user === userName ? 'own' : ''}`}>
              <span className="chat-user">{msg.user}</span>
              <span className="chat-text">{msg.text}</span>
              {msg.sentiment && (
                <span
                  style={{
                    marginTop: 4,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                  }}
                  title={`Label: ${msg.sentiment.label}, score: ${msg.sentiment.score}`}
                >
                  <Sparkles size={13} />
                  Sentiment: {msg.sentiment.label} ({msg.sentiment.score.toFixed(2)})
                </span>
              )}
            </div>
          ))
        )}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}

          placeholder="Type a message..."
        />
        <button className="btn-icon" onClick={handleSend}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
