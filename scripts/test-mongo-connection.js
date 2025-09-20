const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat_bd';

async function testMongoConnection() {
  console.log('🔍 Test de connexion MongoDB...');
  console.log(`📍 URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`); // Masquer les credentials
  
  try {
    // Configuration avec timeouts plus courts pour le test
    const options = {
      serverSelectionTimeoutMS: 5000, // 5 secondes
      socketTimeoutMS: 10000, // 10 secondes
      connectTimeoutMS: 5000, // 5 secondes
      maxPoolSize: 1,
      retryWrites: true,
      w: 'majority',
    };

    console.log('⏳ Tentative de connexion...');
    const startTime = Date.now();
    
    await mongoose.connect(MONGODB_URI, options);
    
    const endTime = Date.now();
    console.log(`✅ Connexion réussie en ${endTime - startTime}ms`);
    
    // Test d'une opération simple
    console.log('⏳ Test d\'opération simple...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✅ Collections trouvées: ${collections.length}`);
    
    // Test de ping
    console.log('⏳ Test de ping...');
    const pingResult = await mongoose.connection.db.admin().ping();
    console.log('✅ Ping réussi:', pingResult);
    
    await mongoose.disconnect();
    console.log('✅ Déconnexion réussie');
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('\n🔧 Solutions possibles:');
      console.log('1. Vérifiez votre connexion internet');
      console.log('2. Vérifiez que l\'URI MongoDB est correcte');
      console.log('3. Vérifiez que le cluster MongoDB Atlas est accessible');
      console.log('4. Vérifiez les paramètres de sécurité du cluster (IP whitelist)');
    }
    
    if (error.name === 'MongoNetworkError') {
      console.log('\n🔧 Solutions possibles:');
      console.log('1. Vérifiez votre connexion internet');
      console.log('2. Vérifiez les paramètres de pare-feu');
      console.log('3. Essayez de redémarrer votre routeur');
    }
    
    process.exit(1);
  }
}

// Exécuter le test
if (require.main === module) {
  testMongoConnection();
}

module.exports = { testMongoConnection };
