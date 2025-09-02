import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Modèle User simplifié pour le script
const UserSchema = new mongoose.Schema({
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

async function cleanOnlineStatus() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connecté à MongoDB');

    // Marquer comme hors ligne les utilisateurs qui n'ont pas eu d'activité depuis plus de 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const result = await User.updateMany(
      { 
        isOnline: true, 
        lastSeen: { $lt: fiveMinutesAgo } 
      },
      { 
        isOnline: false 
      }
    );

    console.log(`${result.modifiedCount} utilisateurs marqués comme hors ligne`);
    
    // Afficher les utilisateurs encore en ligne
    const onlineUsers = await User.find({ isOnline: true }).select('name lastSeen');
    console.log('Utilisateurs encore en ligne:', onlineUsers);

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Déconnecté de MongoDB');
  }
}

// Exécuter le script
cleanOnlineStatus();
