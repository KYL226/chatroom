import type { NextApiRequest, NextApiResponse } from 'next';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import { Server as IOServer } from 'socket.io';
import { verifyToken } from './auth';

export const config = {
  api: {
    bodyParser: false,
  },
};

// 👇 Typage correct de la socket avec accès à .server
interface SocketWithServer extends NetSocket {
  server: HTTPServer & {
    io?: IOServer;
  };
}

export default function SocketHandler(req: NextApiRequest, res: NextApiResponse) {
  const socket = res.socket as SocketWithServer;

  if (socket.server.io) {
    console.log('✅ Socket.io already running');
    res.end();
    return;
  }

  console.log('🟢 Setting up new Socket.io server');

  const io = new IOServer(socket.server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  socket.server.io = io;

  // Middleware d'authentification
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));

      const decoded = verifyToken(token);
      if (!decoded) return next(new Error('Invalid token'));

      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔗 User connected: ${socket.data.user.userId}`);

    socket.on('join_rooms', (roomIds: string[]) => {
      roomIds.forEach(roomId => {
        socket.join(`room:${roomId}`);
        console.log(`User ${socket.data.user.userId} joined room ${roomId}`);
      });
    });

    socket.on('join_conversations', (conversationIds: string[]) => {
      conversationIds.forEach(conversationId => {
        socket.join(`conversation:${conversationId}`);
        console.log(`User ${socket.data.user.userId} joined conversation ${conversationId}`);
      });
    });

    socket.on('send_message', async (data) => {
      const { roomId, conversationId, content, attachments } = data;

      try {
        const Message = (await import('@/models/Message')).default;
        const message = new Message({
          content,
          sender: socket.data.user.userId,
          attachments: attachments || [],
          room: roomId,
          conversation: conversationId,
        });

        await message.save();

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name email avatar role');

        if (roomId) {
          socket.to(`room:${roomId}`).emit('new_message', {
            message: populatedMessage,
            roomId,
          });
        } else if (conversationId) {
          socket.to(`conversation:${conversationId}`).emit('new_message', {
            message: populatedMessage,
            conversationId,
          });
        }

        socket.emit('message_sent', {
          message: populatedMessage,
          roomId,
          conversationId,
        });

      } catch (error) {
        console.error('❌ Error sending message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    socket.on('typing_start', ({ roomId, conversationId }) => {
      const payload = {
        userId: socket.data.user.userId,
        userName: socket.data.user.name,
      };

      if (roomId) {
        socket.to(`room:${roomId}`).emit('user_typing', { ...payload, roomId });
      } else if (conversationId) {
        socket.to(`conversation:${conversationId}`).emit('user_typing', { ...payload, conversationId });
      }
    });

    socket.on('typing_stop', ({ roomId, conversationId }) => {
      const payload = {
        userId: socket.data.user.userId,
      };

      if (roomId) {
        socket.to(`room:${roomId}`).emit('user_stopped_typing', { ...payload, roomId });
      } else if (conversationId) {
        socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', { ...payload, conversationId });
      }
    });

    socket.on('mark_as_read', async ({ roomId, conversationId, messageIds }) => {
      try {
        const Message = (await import('@/models/Message')).default;

        await Message.updateMany(
          {
            _id: { $in: messageIds },
            sender: { $ne: socket.data.user.userId },
          },
          {
            $addToSet: { readBy: socket.data.user.userId },
          }
        );

        const payload = {
          userId: socket.data.user.userId,
          messageIds,
        };

        if (roomId) {
          socket.to(`room:${roomId}`).emit('messages_read', { ...payload, roomId });
        } else if (conversationId) {
          socket.to(`conversation:${conversationId}`).emit('messages_read', { ...payload, conversationId });
        }

      } catch (error) {
        console.error('❌ Error marking messages as read:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.data.user.userId}`);
    });
  });

  res.end();
}
