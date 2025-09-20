const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat_bd';

async function cleanMongoConnections() {
  console.log('🧹 Nettoyage des connexions MongoDB...');
  
  try {
    // Fermer toutes les connexions existantes
    if (mongoose.connection.readyState !== 0) {
      console.log('⏳ Fermeture des connexions existantes...');
      await mongoose.disconnect();
      console.log('✅ Connexions fermées');
    }
    
    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reconnecter avec une configuration propre
    console.log('⏳ Reconnexion avec configuration propre...');
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority',
      bufferCommands: false,
    };
    
    await mongoose.connect(MONGODB_URI, options);
    console.log('✅ Reconnexion réussie');
    
    // Test de santé
    const pingResult = await mongoose.connection.db.admin().ping();
    console.log('✅ Test de santé réussi:', pingResult);
    
    await mongoose.disconnect();
    console.log('✅ Nettoyage terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
    process.exit(1);
  }
}

// Exécuter le nettoyage
if (require.main === module) {
  cleanMongoConnections();
}

module.exports = { cleanMongoConnections };
