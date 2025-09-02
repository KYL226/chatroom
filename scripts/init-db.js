const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat_bd';

// Modèles (simplifiés pour le script)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
  avatar: { type: String },
  bio: { type: String },
  age: { type: Number },
  gender: { type: String },
  interests: [{ type: String }],
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },
  banExpiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  banned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  createdAt: { type: Date, default: Date.now },
});

const MessageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

const ReportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportedMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  reportedRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  reason: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'], 
    default: 'pending' 
  },
  moderator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  moderatorNotes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const StatisticsSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  totalUsers: { type: Number, default: 0 },
  activeUsers: { type: Number, default: 0 },
  totalMessages: { type: Number, default: 0 },
  totalRooms: { type: Number, default: 0 },
  totalReports: { type: Number, default: 0 },
  pendingReports: { type: Number, default: 0 },
  newUsers: { type: Number, default: 0 },
  newMessages: { type: Number, default: 0 },
  newRooms: { type: Number, default: 0 },
  userActivity: {
    type: Map,
    of: Number,
    default: {}
  },
  roomActivity: {
    type: Map,
    of: {
      messages: { type: Number, default: 0 },
      users: { type: Number, default: 0 }
    },
    default: {}
  }
});

// Modèles
const User = mongoose.model('User', UserSchema);
const Room = mongoose.model('Room', RoomSchema);
const Conversation = mongoose.model('Conversation', ConversationSchema);
const Message = mongoose.model('Message', MessageSchema);
const Report = mongoose.model('Report', ReportSchema);
const Statistics = mongoose.model('Statistics', StatisticsSchema);

async function initializeDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Créer les index
    console.log('📊 Creating database indexes...');
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ isOnline: 1 });
    await User.collection.createIndex({ isBanned: 1 });
    
    await Room.collection.createIndex({ name: 1 }, { unique: true });
    await Room.collection.createIndex({ members: 1 });
    
    await Message.collection.createIndex({ conversation: 1 });
    await Message.collection.createIndex({ sender: 1 });
    await Message.collection.createIndex({ createdAt: -1 });
    
    await Conversation.collection.createIndex({ participants: 1 });
    await Conversation.collection.createIndex({ room: 1 });
    
    await Report.collection.createIndex({ status: 1 });
    await Report.collection.createIndex({ reporter: 1 });
    await Report.collection.createIndex({ createdAt: -1 });
    
    await Statistics.collection.createIndex({ date: 1 }, { unique: true });
    console.log('✅ Database indexes created successfully');

    // Vérifier si un admin existe déjà
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      console.log('👤 Creating admin user...');
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
      console.log('📧 Email: admin@chatroom.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
    
    // Créer quelques salles par défaut
    console.log('🏠 Creating default rooms...');
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
      },
      {
        name: 'Gaming',
        description: 'Discussion sur les jeux vidéo',
        members: [],
        admins: [],
        moderators: [],
        banned: [],
        createdAt: new Date()
      },
      {
        name: 'Musique',
        description: 'Partage de musique et playlists',
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
      } else {
        console.log(`ℹ️ Room "${roomData.name}" already exists`);
      }
    }
    
    // Créer quelques utilisateurs de test
    console.log('👥 Creating test users...');
    const testUsers = [
      {
        name: 'Alice Martin',
        email: 'alice@test.com',
        password: 'password123',
        role: 'user',
        bio: 'Développeuse passionnée',
        interests: ['programming', 'music', 'gaming']
      },
      {
        name: 'Bob Dupont',
        email: 'bob@test.com',
        password: 'password123',
        role: 'user',
        bio: 'Gamer professionnel',
        interests: ['gaming', 'esports', 'technology']
      },
      {
        name: 'Charlie Wilson',
        email: 'charlie@test.com',
        password: 'password123',
        role: 'moderator',
        bio: 'Modérateur communautaire',
        interests: ['community', 'help', 'support']
      }
    ];
    
    for (const userData of testUsers) {
      const userExists = await User.findOne({ email: userData.email });
      if (!userExists) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const user = new User({
          ...userData,
          password: hashedPassword,
          isOnline: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        await user.save();
        console.log(`✅ User "${userData.name}" created successfully`);
      } else {
        console.log(`ℹ️ User "${userData.name}" already exists`);
      }
    }
    
    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Admin user: admin@chatroom.com / admin123');
    console.log('- Test users: alice@test.com, bob@test.com, charlie@test.com / password123');
    console.log('- Default rooms: Général, Aide, Développement, Gaming, Musique');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Exécuter le script
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase }; 