let ioRef = null;

function attachSocket(server) {
  const { Server } = require('socket.io');
  const { verifyAccessToken } = require('../utils/jwt');

  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_ORIGIN || '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    // client should emit 'dashboard:subscribe' to join dashboard room
    // Accept auth either in handshake (socket.handshake.auth.token) or in the subscribe payload
    socket.on('dashboard:subscribe', (payload) => {
      try {
        // token from subscribe payload (preferred)
        let token = payload && payload.token;
        // fallback to handshake auth
        if (!token) {
          const hs = socket.handshake && socket.handshake.auth ? socket.handshake.auth : {};
          token = hs.token || hs.authToken || null;
        }

        // if the token is prefixed with 'Bearer ', remove it
        if (token && typeof token === 'string' && token.startsWith('Bearer ')) token = token.slice(7);

        if (!token) {
          socket.emit('error', { message: 'Authentication required' });
          return;
        }

        const claims = verifyAccessToken(token);
        if (!claims || !claims.userId) {
          socket.emit('error', { message: 'Invalid token' });
          return;
        }

        // attach claims to socket for future use
        socket.user = claims;

        // Join a per-user dashboard room to avoid broadcasting other users' updates
        const room = `dashboard:${claims.userId}`;
        socket.join(room);
      } catch (err) {
        socket.emit('error', { message: 'Invalid or expired token' });
      }
    });

    socket.on('disconnect', () => {
      // cleanup if needed
    });
  });

  ioRef = io;
}

function emitDashboardUpdate(payload) {
  if (!ioRef) return;
  // Prefer per-user dashboard rooms. If userId provided, emit only to that user's room.
  if (payload && payload.userId) {
    const room = `dashboard:${payload.userId}`;
    ioRef.to(room).emit('dashboard:update', payload);
    return;
  }
  // Fallback: emit to global dashboard room (rare)
  ioRef.to('dashboard').emit('dashboard:update', payload);
}

module.exports = {
  attachSocket,
  emitDashboardUpdate,
};
