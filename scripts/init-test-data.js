const mongoose = require('mongoose');
require('dotenv').config();

// Modèles
const Room = require('../models/Room');
const User = require('../models/User');
const Conversation = require('../models/Conversation');

async function initTestData() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à MongoDB');

    // Créer quelques utilisateurs de test
    const users = await User.create([
      {
        name: 'Alice Martin',
        email: 'alice@example.com',
        password: 'password123',
        role: 'user',
        avatar: null
      },
      {
        name: 'Bob Dupont',
        email: 'bob@example.com',
        password: 'password123',
        role: 'user',
        avatar: null
      },
      {
        name: 'Charlie Dubois',
        email: 'charlie@example.com',
        password: 'password123',
        role: 'user',
        avatar: null
      }
    ]);

    console.log('Utilisateurs créés:', users.length);

    // Créer quelques salles de test
    const rooms = await Room.create([
      {
        name: 'Général',
        description: 'Salle de discussion générale',
        members: users.map(u => u._id),
        admins: [users[0]._id],
        moderators: [],
        banned: []
      },
      {
        name: 'Développement',
        description: 'Discussion sur le développement',
        members: users.map(u => u._id),
        admins: [users[1]._id],
        moderators: [],
        banned: []
      },
      {
        name: 'Design',
        description: 'Discussion sur le design',
        members: [users[0]._id, users[2]._id],
        admins: [users[2]._id],
        moderators: [],
        banned: []
      }
    ]);

    console.log('Salles créées:', rooms.length);

    // Créer quelques conversations privées
    const conversations = await Conversation.create([
      {
        members: [users[0]._id, users[1]._id],
        isGroup: false,
        name: null
      },
      {
        members: [users[1]._id, users[2]._id],
        isGroup: false,
        name: null
      }
    ]);

    console.log('Conversations créées:', conversations.length);

    console.log('Données de test initialisées avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

initTestData();
