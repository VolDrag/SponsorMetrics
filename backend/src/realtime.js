const { Server } = require('socket.io');

let io;

exports.initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || true,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('join', (userId) => {
      if (userId) socket.join(String(userId));
    });
  });

  return io;
};

exports.emitToUser = (userId, event, payload) => {
  if (!io || !userId) return;
  io.to(String(userId)).emit(event, payload);
};
