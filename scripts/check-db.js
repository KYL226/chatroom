const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat_bd';

async function checkDatabaseConnection() {
  try {
    console.log('🔌 Testing MongoDB connection...');
    console.log(`📍 URI: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI);
    
    const connection = mongoose.connection;
    
    console.log('✅ MongoDB connected successfully!');
    console.log(`📊 Database: ${connection.db.databaseName}`);
    console.log(`🔗 Host: ${connection.host}`);
    console.log(`🚪 Port: ${connection.port}`);
    
    // Vérifier les collections
    const collections = await connection.db.listCollections().toArray();
    console.log('\n📚 Collections found:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    // Vérifier les index
    console.log('\n📊 Checking indexes...');
    
    const collectionsToCheck = ['users', 'rooms', 'messages', 'conversations', 'reports', 'statistics'];
    
    for (const collectionName of collectionsToCheck) {
      try {
        const indexes = await connection.db.collection(collectionName).indexes();
        console.log(`\n📋 Indexes for ${collectionName}:`);
        indexes.forEach(index => {
          const keys = Object.keys(index.key).join(', ');
          const unique = index.unique ? ' (unique)' : '';
          console.log(`  - ${keys}${unique}`);
        });
      } catch (error) {
        console.log(`  ⚠️ Collection ${collectionName} not found`);
      }
    }
    
    // Statistiques de base
    console.log('\n📈 Basic statistics:');
    
    try {
      const userCount = await connection.db.collection('users').countDocuments();
      console.log(`  👥 Users: ${userCount}`);
    } catch (error) {
      console.log('  👥 Users: Collection not found');
    }
    
    try {
      const roomCount = await connection.db.collection('rooms').countDocuments();
      console.log(`  🏠 Rooms: ${roomCount}`);
    } catch (error) {
      console.log('  🏠 Rooms: Collection not found');
    }
    
    try {
      const messageCount = await connection.db.collection('messages').countDocuments();
      console.log(`  💬 Messages: ${messageCount}`);
    } catch (error) {
      console.log('  💬 Messages: Collection not found');
    }
    
    try {
      const reportCount = await connection.db.collection('reports').countDocuments();
      console.log(`  🚨 Reports: ${reportCount}`);
    } catch (error) {
      console.log('  🚨 Reports: Collection not found');
    }
    
    console.log('\n🎉 Database check completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    
    if (error.name === 'MongoNetworkError') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Make sure MongoDB is running');
      console.log('2. Check if the MongoDB service is started');
      console.log('3. Verify the connection URI in .env.local');
      console.log('4. Check if the port 27017 is available');
    }
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Exécuter le script
if (require.main === module) {
  checkDatabaseConnection();
}

module.exports = { checkDatabaseConnection };
