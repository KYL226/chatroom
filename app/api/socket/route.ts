import { Server as IOServer } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Typage correct pour résorber les erreurs TS
interface SocketWithServer extends NetSocket {
  server: HTTPServer & {
    io?: IOServer;
  };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const socket = res.socket as SocketWithServer;

  if (!socket.server.io) {
    const io = new IOServer(socket.server, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      cors: {
        origin: "*", // ⚠️ À restreindre en prod
        methods: ["GET", "POST"],
      },
    });

    socket.server.io = io;

    const onlineUsers = new Map<string, string>();

    io.on("connection", (socket) => {
      // Lorsqu'un utilisateur se connecte
      socket.on("user-online", (userId: string) => {
        onlineUsers.set(userId, socket.id);
        io.emit("online-users", Array.from(onlineUsers.keys()));
      });

      socket.on("send-message", (data) => {
        socket.broadcast.emit("receive-message", data);
      });

      socket.on("disconnect", () => {
        for (const [userId, id] of onlineUsers.entries()) {
          if (id === socket.id) {
            onlineUsers.delete(userId);
            break;
          }
        }
        io.emit("online-users", Array.from(onlineUsers.keys()));
      });
    });
  }

  res.end();
}
