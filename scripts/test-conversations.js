const mongoose = require('mongoose');
require('dotenv').config();

// Modèles simplifiés pour le test
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  isOnline: Boolean,
  lastSeen: Date
});

const ConversationSchema = new mongoose.Schema({
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isGroup: { type: Boolean, default: false },
  name: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastMessage: {
    content: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Conversation = mongoose.model('Conversation', ConversationSchema);

async function testConversations() {
  try {
    // Connexion à MongoDB avec l'URI par défaut
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat_bd';
    await mongoose.connect(MONGODB_URI);
    console.log('Connecté à MongoDB:', MONGODB_URI);

    // Vérifier la structure de la base de données
    console.log('\n=== Vérification de la structure ===');
    
    // Compter les utilisateurs
    const userCount = await User.countDocuments();
    console.log(`Nombre d'utilisateurs: ${userCount}`);
    
    // Compter les conversations
    const conversationCount = await Conversation.countDocuments();
    console.log(`Nombre de conversations: ${conversationCount}`);
    
    // Afficher quelques utilisateurs
    const users = await User.find().limit(3).select('name email role isOnline');
    console.log('\nUtilisateurs (3 premiers):', users);
    
    // Afficher quelques conversations
    const conversations = await Conversation.find().limit(3).populate('members', 'name');
    console.log('\nConversations (3 premières):', conversations);
    
    // Tester la création d'une conversation
    console.log('\n=== Test de création de conversation ===');
    
    if (users.length >= 2) {
      const testConversation = new Conversation({
        members: [users[0]._id, users[1]._id],
        isGroup: false,
        createdBy: users[0]._id
      });
      
      await testConversation.save();
      console.log('Conversation de test créée avec succès:', testConversation._id);
      
      // Nettoyer la conversation de test
      await Conversation.findByIdAndDelete(testConversation._id);
      console.log('Conversation de test supprimée');
    } else {
      console.log('Pas assez d\'utilisateurs pour tester la création de conversation');
    }

  } catch (error) {
    console.error('Erreur lors du test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDéconnecté de MongoDB');
  }
}

// Exécuter le test
testConversations();
