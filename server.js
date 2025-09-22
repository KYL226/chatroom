/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Define User schema directly for CommonJS compatibility
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String, default: '' },
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }]
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

// Define Message schema directly for CommonJS compatibility
const messageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  attachments: [{ type: String }],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, {
  timestamps: true
});

const Message = mongoose.model('Message', messageSchema);

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO
const allowedOrigins = (process.env.SOCKET_ALLOWED_ORIGINS || process.env.NEXT_PUBLIC_APP_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  allowedOrigins.push('http://localhost:3000');
}

const io = new Server(server, {
  cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io'
  });

  // Connect to MongoDB
  mongoose.connect(process.env.MONGODB_URI, {
    bufferCommands: false,
  }).then(() => {
    console.log('✅ MongoDB connected successfully');
  }).catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });

  // Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
        console.log('❌ No token provided');
        return next(new Error('Authentication error'));
      }

      console.log('🔍 Verifying token:', token.substring(0, 20) + '...');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
      console.log('✅ Token decoded:', { userId: decoded.userId, email: decoded.email });
      
    const user = await User.findById(decoded.userId);
    
    if (!user) {
        console.log('❌ User not found:', decoded.userId);
        return next(new Error('User not found'));
    }

      console.log('✅ User found:', user.name, user.email);
      socket.data.user = user;
      socket.data.userId = decoded.userId;
    next();
  } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      next(new Error('Authentication failed'));
  }
});

  // Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`🔗 User connected: ${socket.data.userId}`);

    socket.on('join_rooms', (roomIds) => {
      if (Array.isArray(roomIds)) {
        roomIds.forEach(roomId => {
          socket.join(`room:${roomId}`);
          console.log(`User ${socket.data.userId} joined room ${roomId}`);
        });
      }
    });

    socket.on('join_conversations', (conversationIds) => {
      if (Array.isArray(conversationIds)) {
        conversationIds.forEach(conversationId => {
          socket.join(`conversation:${conversationId}`);
          console.log(`User ${socket.data.userId} joined conversation ${conversationId}`);
        });
      }
    });

  socket.on('send_message', async (data) => {
      const { roomId, conversationId, content, attachments } = data;

    try {
        const message = new Message({
        content,
          sender: socket.data.userId,
          attachments: attachments || [],
          room: roomId,
          conversation: conversationId,
        });

      await message.save();

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name email avatar role _id');
        
        console.log('📤 Message créé:', {
          id: populatedMessage._id,
          content: populatedMessage.content,
          sender: populatedMessage.sender ? {
            _id: populatedMessage.sender._id,
            name: populatedMessage.sender.name,
            email: populatedMessage.sender.email
          } : 'NO SENDER'
        });

        // Convertir le message en objet JavaScript simple pour Socket.IO
        const messageToSend = {
          _id: populatedMessage._id,
          content: populatedMessage.content,
          sender: populatedMessage.sender ? {
            _id: populatedMessage.sender._id,
            name: populatedMessage.sender.name,
            email: populatedMessage.sender.email,
            avatar: populatedMessage.sender.avatar || '',
            role: populatedMessage.sender.role
          } : null,
          createdAt: populatedMessage.createdAt,
          attachments: populatedMessage.attachments || []
        };

        console.log('📤 Message à envoyer:', messageToSend);

      if (roomId) {
          socket.to(`room:${roomId}`).emit('new_message', messageToSend);
        } else if (conversationId) {
          socket.to(`conversation:${conversationId}`).emit('new_message', messageToSend);
        }

        socket.emit('message_sent', messageToSend);

    } catch (error) {
        console.error('❌ Error sending message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    socket.on('typing_start', ({ roomId, conversationId }) => {
      const payload = {
        userId: socket.data.userId,
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
        userId: socket.data.userId,
      };

    if (roomId) {
        socket.to(`room:${roomId}`).emit('user_stopped_typing', { ...payload, roomId });
      } else if (conversationId) {
        socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', { ...payload, conversationId });
      }
    });

    socket.on('mark_as_read', async ({ roomId, conversationId, messageIds }) => {
      try {
        await Message.updateMany(
          {
            _id: { $in: messageIds },
            sender: { $ne: socket.data.userId },
          },
          {
            $addToSet: { readBy: socket.data.userId },
          }
        );

        const payload = {
          userId: socket.data.userId,
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
      console.log(`🔌 User disconnected: ${socket.data.userId}`);
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO server running on port ${port}`);
  });
});