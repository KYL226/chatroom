import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat_bd';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export async function disconnectDB() {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}

// Fonction pour vérifier la connexion
export async function checkConnection() {
  try {
    const conn = await connectDB();
    if (conn.connection.readyState === 1) {
      console.log('✅ MongoDB connected successfully');
      return true;
    } else {
      console.log('❌ MongoDB connection failed');
      return false;
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    return false;
  }
}

// Fonction pour créer les index nécessaires
export async function createIndexes() {
  try {
    await connectDB();
    
    // Index pour User
    const User = mongoose.model('User');
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ isOnline: 1 });
    await User.collection.createIndex({ isBanned: 1 });
    
    // Index pour Room
    const Room = mongoose.model('Room');
    await Room.collection.createIndex({ name: 1 }, { unique: true });
    await Room.collection.createIndex({ members: 1 });
    
    // Index pour Message
    const Message = mongoose.model('Message');
    await Message.collection.createIndex({ conversation: 1 });
    await Message.collection.createIndex({ sender: 1 });
    await Message.collection.createIndex({ createdAt: -1 });
    
    // Index pour Conversation
    const Conversation = mongoose.model('Conversation');
    await Conversation.collection.createIndex({ participants: 1 });
    await Conversation.collection.createIndex({ room: 1 });
    
    // Index pour Report
    const Report = mongoose.model('Report');
    await Report.collection.createIndex({ status: 1 });
    await Report.collection.createIndex({ reporter: 1 });
    await Report.collection.createIndex({ createdAt: -1 });
    
    // Index pour Statistics
    const Statistics = mongoose.model('Statistics');
    await Statistics.collection.createIndex({ date: 1 }, { unique: true });
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  }
}

// Fonction pour initialiser la base de données avec des données de test
export async function initializeDatabase() {
  try {
    await connectDB();
    
    const User = mongoose.model('User');
    const Room = mongoose.model('Room');
    
    // Vérifier si un admin existe déjà
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      // Créer un utilisateur admin par défaut
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const adminUser = new User({
        name: 'Administrateur',
        email: 'admin@chatroom.com',
        password: hashedPassword,
        role: 'admin',
        isOnline: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully');
    }
    
    // Créer quelques salles par défaut
    const defaultRooms = [
      {
        name: 'Général',
        description: 'Salle de discussion générale',
        members: [],
        admins: [],
        moderators: [],
        banned: [],
        createdAt: new Date()
      },
      {
        name: 'Aide',
        description: 'Salle d\'aide et support',
        members: [],
        admins: [],
        moderators: [],
        banned: [],
        createdAt: new Date()
      },
      {
        name: 'Développement',
        description: 'Discussion sur le développement',
        members: [],
        admins: [],
        moderators: [],
        banned: [],
        createdAt: new Date()
      }
    ];
    
    for (const roomData of defaultRooms) {
      const roomExists = await Room.findOne({ name: roomData.name });
      if (!roomExists) {
        const room = new Room(roomData);
        await room.save();
        console.log(`✅ Room "${roomData.name}" created successfully`);
      }
    }
    
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
}

export default connectDB;
