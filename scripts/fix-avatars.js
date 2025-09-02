const mongoose = require('mongoose');
require('dotenv').config();

// Modèles
const User = require('../models/User');

async function fixAvatars() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à MongoDB');

    // Trouver tous les utilisateurs avec des avatars
    const users = await User.find({ avatar: { $exists: true, $ne: null } });
    console.log(`Trouvé ${users.length} utilisateurs avec des avatars`);

    let fixedCount = 0;
    let removedCount = 0;

    for (const user of users) {
      if (user.avatar) {
        // Vérifier si l'avatar est une URL externe problématique
        const isExternalUrl = user.avatar.startsWith('http');
        const isLinkedInUrl = user.avatar.includes('media.licdn.com');
        const isInvalidUrl = !user.avatar.match(/^https?:\/\/.+/);

        if (isLinkedInUrl || isInvalidUrl || (isExternalUrl && !user.avatar.includes('localhost'))) {
          console.log(`Avatar problématique trouvé pour ${user.name}: ${user.avatar}`);
          
          // Supprimer l'avatar problématique
          await User.findByIdAndUpdate(user._id, { $unset: { avatar: 1 } });
          removedCount++;
          console.log(`Avatar supprimé pour ${user.name}`);
        } else {
          fixedCount++;
        }
      }
    }

    console.log(`\nRésumé:`);
    console.log(`- Avatars conservés: ${fixedCount}`);
    console.log(`- Avatars supprimés: ${removedCount}`);
    console.log(`- Total traité: ${users.length}`);

    console.log('\nNettoyage des avatars terminé !');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors du nettoyage des avatars:', error);
    process.exit(1);
  }
}

fixAvatars();
