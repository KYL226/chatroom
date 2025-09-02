const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function setupProject() {
  console.log('🚀 Configuration de Chatroom...\n');

  try {
    // 1. Vérifier Node.js
    console.log('📋 Vérification des prérequis...');
    const nodeVersion = process.version;
    console.log(`✅ Node.js ${nodeVersion} détecté`);

    // 2. Installer les dépendances
    console.log('\n📦 Installation des dépendances...');
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ Dépendances installées avec succès');
    } catch (error) {
      console.log('⚠️  Erreur lors de l\'installation des dépendances');
      console.log('💡 Essayez: npm install --force');
      return;
    }

    // 3. Créer le fichier .env.local
    console.log('\n⚙️  Configuration de l\'environnement...');
    try {
      const { generateEnvFile } = require('./setup-env.js');
      generateEnvFile();
    } catch (error) {
      console.log('⚠️  Erreur lors de la création du fichier .env.local');
      console.log('💡 Créez manuellement le fichier .env.local');
    }

    // 4. Vérifier MongoDB
    console.log('\n🔌 Vérification de MongoDB...');
    try {
      const { checkDatabaseConnection } = require('./check-db.js');
      await checkDatabaseConnection();
    } catch (error) {
      console.log('❌ MongoDB n\'est pas accessible');
      console.log('💡 Assurez-vous que MongoDB est installé et démarré');
      console.log('📖 Consultez DATABASE_SETUP.md pour l\'installation');
      return;
    }

    // 5. Initialiser la base de données
    console.log('\n🗄️  Initialisation de la base de données...');
    try {
      const { initializeDatabase } = require('./init-db.js');
      await initializeDatabase();
    } catch (error) {
      console.log('❌ Erreur lors de l\'initialisation de la base de données');
      console.log('💡 Vérifiez que MongoDB est accessible');
      return;
    }

    // 6. Vérification finale
    console.log('\n🔍 Vérification finale...');
    try {
      execSync('npm run check-db', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  Erreur lors de la vérification finale');
    }

    // 7. Résumé
    console.log('\n🎉 Configuration terminée avec succès !');
    console.log('\n📋 Résumé:');
    console.log('✅ Dépendances installées');
    console.log('✅ Fichier .env.local créé');
    console.log('✅ Base de données initialisée');
    console.log('✅ Comptes de test créés');
    
    console.log('\n👤 Comptes disponibles:');
    console.log('- Admin: admin@chatroom.com / admin123');
    console.log('- Test: alice@test.com / password123');
    console.log('- Test: bob@test.com / password123');
    console.log('- Modérateur: charlie@test.com / password123');

    console.log('\n🚀 Pour démarrer l\'application:');
    console.log('npm run dev');
    console.log('\n🌐 Accédez à: http://localhost:3000');

    console.log('\n📖 Documentation:');
    console.log('- Guide complet: DATABASE_SETUP.md');
    console.log('- Démarrage rapide: QUICK_START.md');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
    console.log('\n💡 Consultez la documentation pour le dépannage');
  }
}

// Exécuter le script
if (require.main === module) {
  setupProject();
}

module.exports = { setupProject }; 