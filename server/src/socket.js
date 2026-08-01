import { Server } from 'socket.io';

const rooms = new Map();

const COLORS = ['#f87171', '#fb923c', '#fbbf24', '#4ade80', '#38bdf8', '#a78bfa', '#f472b6'];

export function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    path: '/socket.io',
  });

  io.on('connection', (socket) => {
    socket.on('join-room', ({ roomId, userName, canEdit }) => {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.userName = userName;
      socket.canEdit = !!canEdit;


      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
      }

      const room = rooms.get(roomId);
      room.set(socket.id, {
        id: socket.id,
        name: userName,
        color: COLORS[userName.length % COLORS.length],
      });

      io.to(roomId).emit('room-users', Array.from(room.values()));
    });

    socket.on('code-change', ({ roomId, fileId, content }) => {
      if (!socket.canEdit) return;
      socket.to(roomId).emit('code-change', { fileId, content });
    });


    socket.on('files-sync', ({ roomId, files }) => {
      if (!socket.canEdit) return;
      socket.to(roomId).emit('files-sync', files);
    });


    socket.on('chat-message', ({ roomId, message }) => {
      socket.to(roomId).emit('chat-message', message);
    });

    socket.on('cursor-update', ({ roomId, userId, fileId, line, column }) => {
      // Broadcast cursor position to other collaborators (view-only also publishes cursor)
      socket.to(roomId).emit('cursor-update', {
        userId: userId ?? socket.id,
        userName: socket.userName,
        fileId,
        line,
        column,
      });
    });


    socket.on('disconnect', () => {
      const { roomId } = socket;
      if (!roomId || !rooms.has(roomId)) return;

      const room = rooms.get(roomId);
      room.delete(socket.id);

      if (room.size === 0) {
        rooms.delete(roomId);
      } else {
        io.to(roomId).emit('room-users', Array.from(room.values()));
      }
    });
  });

  return io;
}
