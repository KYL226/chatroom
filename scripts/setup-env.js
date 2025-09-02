const fs = require('fs');
const path = require('path');

function generateEnvFile() {
  const envContent = `# Configuration MongoDB
MONGODB_URI=mongodb://localhost:27017/chatroom

# Configuration JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Configuration de l'application
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Configuration pour l'envoi d'emails (optionnel)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# Configuration pour le stockage de fichiers (optionnel)
# CLOUDINARY_CLOUD_NAME=your-cloud-name
# CLOUDINARY_API_KEY=your-api-key
# CLOUDINARY_API_SECRET=your-api-secret
`;

  const envPath = path.join(process.cwd(), '.env.local');

  try {
    // Vérifier si le fichier existe déjà
    if (fs.existsSync(envPath)) {
      console.log('⚠️  Le fichier .env.local existe déjà');
      console.log('📝 Vérifiez que les variables sont correctement configurées');
      return;
    }

    // Créer le fichier .env.local
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Fichier .env.local créé avec succès');
    console.log('📝 N\'oubliez pas de modifier JWT_SECRET en production');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du fichier .env.local:', error.message);
  }
}

// Exécuter le script
if (require.main === module) {
  generateEnvFile();
}

module.exports = { generateEnvFile }; 