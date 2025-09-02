const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatroom';

async function cleanDatabase() {
  try {
    console.log('🧹 Nettoyage de la base de données...');
    console.log(`📍 URI: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI);
    const connection = mongoose.connection;
    
    console.log('✅ Connecté à MongoDB');
    
    // Supprimer tous les index existants sur la collection users
    console.log('🗑️  Suppression des anciens index...');
    try {
      const usersCollection = connection.db.collection('users');
      const indexes = await usersCollection.indexes();
      
      for (const index of indexes) {
        if (index.name !== '_id_') {
          console.log(`🗑️  Suppression de l'index: ${index.name}`);
          await usersCollection.dropIndex(index.name);
        }
      }
      console.log('✅ Anciens index supprimés');
    } catch (error) {
      console.log('ℹ️  Aucun index à supprimer ou collection inexistante');
    }
    
    // Supprimer les collections existantes pour repartir proprement
    console.log('🗑️  Suppression des collections existantes...');
    const collections = ['users', 'rooms', 'messages', 'conversations', 'reports', 'statistics'];
    
    for (const collectionName of collections) {
      try {
        await connection.db.collection(collectionName).drop();
        console.log(`✅ Collection ${collectionName} supprimée`);
      } catch (error) {
        console.log(`ℹ️  Collection ${collectionName} n'existait pas`);
      }
    }
    
    console.log('\n🎉 Nettoyage terminé avec succès !');
    console.log('💡 Vous pouvez maintenant relancer: npm run init-db');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
if (require.main === module) {
  cleanDatabase();
}

module.exports = { cleanDatabase }; 