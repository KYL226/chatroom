/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { connectDB } = require('./lib/mongodb.js');
const Message = require('./models/Message.js');
const User = require('./models/User.js');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Healthcheck simple
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Connexion à MongoDB
connectDB();

// Middleware d'authentification Socket.io
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Token manquant'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return next(new Error('Utilisateur non trouvé'));
    }

    socket.userId = decoded.userId;
    socket.user = user;
    next();
  } catch (error) {
    console.error('Authentification échouée:', error);
    next(new Error('Authentification échouée'));
  }
});

// Gestion des connexions Socket.io
io.on('connection', (socket) => {
  console.log(`Utilisateur connecté: ${socket.userId} (${socket.user.name})`);

  // Rejoindre les salles de l'utilisateur
  socket.on('join_rooms', async () => {
    try {
      // Rejoindre les salles publiques et privées de l'utilisateur
      const user = await User.findById(socket.userId).populate('rooms');
      if (user && user.rooms) {
        user.rooms.forEach(room => {
          socket.join(`room_${room._id}`);
        });
      }
    } catch (error) {
      console.error('Erreur lors de la jointure des salles:', error);
    }
  });

  // Rejoindre une salle spécifique
  socket.on('join_room', (roomId) => {
    socket.join(`room_${roomId}`);
    console.log(`Utilisateur ${socket.userId} a rejoint la salle ${roomId}`);
  });

  // Quitter une salle
  socket.on('leave_room', (roomId) => {
    socket.leave(`room_${roomId}`);
    console.log(`Utilisateur ${socket.userId} a quitté la salle ${roomId}`);
  });

  // Nouveau message
  socket.on('send_message', async (data) => {
    try {
      const { content, roomId, conversationId, attachments } = data;
      
      // Créer le message en base
      const messageData = {
        content,
        sender: socket.userId,
        attachments: attachments || []
      };

      if (roomId) {
        messageData.room = roomId;
      } else if (conversationId) {
        messageData.conversation = conversationId;
      }

      const message = new Message(messageData);
      await message.save();

      // Populer les données du sender
      await message.populate('sender', 'name avatar');

      // Émettre le message aux autres utilisateurs
      if (roomId) {
        socket.to(`room_${roomId}`).emit('new_message', message);
      } else if (conversationId) {
        // Pour les conversations privées, émettre aux participants
        // TODO: Implémenter la logique pour les conversations privées
      }

      // Confirmer l'envoi à l'expéditeur
      socket.emit('message_sent', message);

    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      socket.emit('message_error', { error: 'Erreur lors de l\'envoi du message' });
    }
  });

  // Typing indicator
  socket.on('typing_start', (data) => {
    const { roomId } = data;
    if (roomId) {
      socket.to(`room_${roomId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.name,
        roomId
      });
    }
  });

  socket.on('typing_stop', (data) => {
    const { roomId } = data;
    if (roomId) {
      socket.to(`room_${roomId}`).emit('user_stop_typing', {
        userId: socket.userId,
        roomId
      });
    }
  });

  // Déconnexion
  socket.on('disconnect', () => {
    console.log(`Utilisateur déconnecté: ${socket.userId}`);
  });
});

// API Routes pour les messages (fallback)
app.post('/api/messages', async (req, res) => {
  try {
    const { content, roomId, conversationId, sender } = req.body;
    
    const message = new Message({
      content,
      sender,
      room: roomId,
      conversation: conversationId
    });

    await message.save();
    await message.populate('sender', 'name avatar');

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || process.env.SOCKET_PORT || 3001;
server.listen(PORT, () => {
  console.log(`Serveur Socket.io démarré sur le port ${PORT}`);
});
