import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ChatMessage, FileNode } from '../types';

interface Collaborator {
  id: string;
  name: string;
  color: string;
}

interface UseCollaborationOptions {
  roomId: string;
  userName: string;
  canEdit: boolean;
  onRemoteChange: (fileId: string, content: string) => void;
  onFilesSync: (files: FileNode[]) => void;
  onRemoteCursor?: (userId: string, userName: string, fileId: string | null, line: number, column: number) => void;
}


const COLORS = ['#f87171', '#fb923c', '#fbbf24', '#4ade80', '#38bdf8', '#a78bfa', '#f472b6'];

export function useCollaboration({
  roomId,
  userName,
  canEdit,
  onRemoteChange,
  onFilesSync,
  onRemoteCursor,
}: UseCollaborationOptions) {

  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const socket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-room', { roomId, userName, canEdit });

    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('room-users', (users: Collaborator[]) => {
      setCollaborators(users);
    });

    socket.on('code-change', ({ fileId, content }: { fileId: string; content: string }) => {
      onRemoteChange(fileId, content);
    });

    socket.on('files-sync', (files: FileNode[]) => {
      onFilesSync(files);
    });

    socket.on('chat-message', (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socket.on(
      'cursor-update',
      ({ userId, userName: remoteName, fileId, line, column }: any) => {
        onRemoteCursor?.(userId, remoteName, fileId ?? null, line, column);
      },
    );


    return () => {
      socket.disconnect();
    };
  }, [roomId, userName, onRemoteChange, onFilesSync]);

  const broadcastChange = useCallback((fileId: string, content: string) => {
    if (!canEdit) return;
    socketRef.current?.emit('code-change', { roomId, fileId, content });
  }, [roomId, canEdit]);


  const syncFiles = useCallback((files: FileNode[]) => {
    if (!canEdit) return;
    socketRef.current?.emit('files-sync', { roomId, files });
  }, [roomId, canEdit]);


  const updateCursor = useCallback(
    (payload: { fileId: string | null; line: number; column: number }) => {
      if (!canEdit) {
        // still allow publishing cursor in view mode
      }
      socketRef.current?.emit('cursor-update', {
        roomId,
        fileId: payload.fileId,
        line: payload.line,
        column: payload.column,
      });
    },
    [roomId],
  );

  const sendChat = useCallback((text: string, sentiment?: ChatMessage['sentiment']) => {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      user: userName,
      text,
      timestamp: Date.now(),
      sentiment,
    };
    socketRef.current?.emit('chat-message', { roomId, message: msg });
    setChatMessages((prev) => [...prev, msg]);
  }, [roomId, userName]);



  const userColor = COLORS[userName.length % COLORS.length];

  return {
    connected,
    collaborators,
    chatMessages,
    broadcastChange,
    syncFiles,
    sendChat,
    updateCursor,
    userColor,
  };
}

