
const rooms = new Map(); // code -> room object
const userSocketMap = new Map(); 

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function getRoomBySocket(socketId) {
  for (const [code, room] of rooms.entries()) {
    if (room.participants.some((p) => p.socketId === socketId)) {
      return { code, room };
    }
  }
  return null;
}

function broadcastRoom(io, code) {
  const room = rooms.get(code);
  if (!room) return;
  io.to(code).emit('room-updated', {
    code,
    host: room.host,
    participants: room.participants.map((p) => ({ username: p.username })),
    settings: room.settings,
    status: room.status,
  });
}

export function setupRaceSocket(io) {
  io.on('connection', (socket) => {
    const username = socket.handshake.auth?.username;
    if (username) {
      userSocketMap.set(username, socket.id);
    }

    socket.on('create-room', ({ username: uname }) => {

      const existing = getRoomBySocket(socket.id);
      if (existing) {
        handleLeave(io, socket, existing.code, existing.room);
      }

      let code;
      do { code = generateCode(); } while (rooms.has(code));

      const room = {
        code,
        host: uname,
        participants: [{ socketId: socket.id, username: uname }],
        settings: { duration: 30, mode: 'normal' },
        status: 'waiting',
      };

      rooms.set(code, room);
      socket.join(code);
      socket.emit('room-created', {
        code,
        host: uname,
        participants: [{ username: uname }],
        settings: room.settings,
        status: 'waiting',
      });
    });


    socket.on('join-room', ({ code, username: uname }, callback) => {
      const room = rooms.get(code?.toUpperCase?.() || code);
      if (!room) {
        if (callback) callback({ error: 'Room not found' });
        return;
      }
      if (room.status !== 'waiting') {
        if (callback) callback({ error: 'Race already started' });
        return;
      }
      if (room.participants.some((p) => p.username === uname)) {
      
        socket.join(code);
        if (callback) callback({ success: true });
        broadcastRoom(io, code);
        return;
      }

      room.participants.push({ socketId: socket.id, username: uname });
      socket.join(code);
      broadcastRoom(io, code);
      if (callback) callback({ success: true });
    });

    socket.on('invite-friend', ({ fromUsername, toUsername, code }) => {
      const targetSocketId = userSocketMap.get(toUsername);
      if (!targetSocketId) {
        socket.emit('invite-error', { message: `${toUsername} is not online` });
        return;
      }
      io.to(targetSocketId).emit('race-invite', {
        fromUsername,
        code,
      });
    });

    socket.on('accept-invite', ({ username: uname, code }) => {
      const room = rooms.get(code);
      if (!room || room.status !== 'waiting') {
        socket.emit('invite-error', { message: 'Room no longer available' });
        return;
      }
      if (!room.participants.some((p) => p.username === uname)) {
        room.participants.push({ socketId: socket.id, username: uname });
      }
      socket.join(code);
      broadcastRoom(io, code);
      socket.emit('invite-accepted', { code });
    });

    socket.on('reject-invite', ({ fromUsername, toUsername }) => {
      const hostSocketId = userSocketMap.get(fromUsername);
      if (hostSocketId) {
        io.to(hostSocketId).emit('invite-rejected', { toUsername });
      }
    });

    socket.on('kick-user', ({ code, hostUsername, targetUsername }) => {
      const room = rooms.get(code);
      if (!room || room.host !== hostUsername) return;

      const target = room.participants.find((p) => p.username === targetUsername);
      if (!target) return;

      room.participants = room.participants.filter((p) => p.username !== targetUsername);

      const targetSocket = io.sockets.sockets.get(target.socketId);
      if (targetSocket) {
        targetSocket.leave(code);
        targetSocket.emit('kicked', { code });
      }

      broadcastRoom(io, code);
    });

    socket.on('update-settings', ({ code, hostUsername, settings }) => {
      const room = rooms.get(code);
      if (!room || room.host !== hostUsername) return;
      room.settings = { ...room.settings, ...settings };
      broadcastRoom(io, code);
    });

    socket.on('start-race', ({ code, hostUsername, text }) => {
      const room = rooms.get(code);
      if (!room || room.host !== hostUsername) return;
      if (room.participants.length < 1) return;

      room.status = 'racing';
      room.startedAt = Date.now();
      room.raceText = text;
      room.finishedParticipants = [];

      io.to(code).emit('race-started', {
        code,
        text,
        duration: room.settings.duration,
        startedAt: room.startedAt,
      });
    });

    socket.on('typing-progress', ({ code, username: uname, progress, wpm }) => {
      io.to(code).emit('progress-update', { username: uname, progress, wpm });
    });

    socket.on('race-finished', ({ code, username: uname, wpm, accuracy, time }) => {
      const room = rooms.get(code);
      if (!room) return;
      if (!room.finishedParticipants) room.finishedParticipants = [];

      if (!room.finishedParticipants.some((p) => p.username === uname)) {
        room.finishedParticipants.push({ username: uname, wpm, accuracy, time });
      }

      io.to(code).emit('user-finished', {
        username: uname,
        wpm,
        accuracy,
        time,
        rank: room.finishedParticipants.length,
      });

      if (room.finishedParticipants.length >= room.participants.length) {
        room.status = 'finished';
        io.to(code).emit('race-ended', {
          results: room.finishedParticipants,
        });
      }
    });

    socket.on('end-race', ({ code, results }) => {
      const room = rooms.get(code);
      if (!room) return;
      room.status = 'finished';
      io.to(code).emit('race-ended', { results });
    });

    socket.on('play-again', ({ code, hostUsername }) => {
      const room = rooms.get(code);
      if (!room || room.host !== hostUsername) return;
      room.status = 'waiting';
      room.startedAt = null;
      room.raceText = null;
      room.finishedParticipants = [];
      broadcastRoom(io, code);
      io.to(code).emit('reset-to-lobby');
    });

    socket.on('leave-room', ({ code, username: uname }) => {
      const room = rooms.get(code);
      if (room) handleLeave(io, socket, code, room, uname);
    });

    socket.on('disconnect', () => {
      if (username) {
        userSocketMap.delete(username);
      }
      const found = getRoomBySocket(socket.id);
      if (found) {
        handleLeave(io, socket, found.code, found.room);
      }
    });
  });
}

function handleLeave(io, socket, code, room, usernameOverride) {
  const uname = usernameOverride || room.participants.find((p) => p.socketId === socket.id)?.username;
  if (!uname) return;

  room.participants = room.participants.filter((p) => p.username !== uname);
  socket.leave(code);

  if (room.participants.length === 0) {
    rooms.delete(code);
    return;
  }

  if (room.host === uname) {
    room.host = room.participants[0].username;
    io.to(code).emit('host-changed', { newHost: room.host });
  }

  broadcastRoom(io, code);
}
