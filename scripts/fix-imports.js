const fs = require('fs');
const path = require('path');

// Liste des fichiers à corriger
const filesToFix = [
  'app/api/users/infos.ts',
  'app/api/users/[id].ts',
  'app/api/rooms/search.ts',
  'app/api/rooms/route.ts',
  'app/api/rooms/leave.ts',
  'app/api/rooms/moderate.ts',
  'app/api/rooms/join.ts',
  'app/api/rooms/ban.ts',
  'app/api/auth/reset-password.ts',
  'app/api/messages/report.ts',
  'app/api/auth/forgot-password.ts'
];

function fixFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Fichier non trouvé: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Remplacer l'import
    if (content.includes('import { connectToDatabase }')) {
      content = content.replace(
        'import { connectToDatabase } from \'@/lib/mongodb\';',
        'import { connectDB } from \'@/lib/mongodb\';'
      );
      modified = true;
    }

    // Remplacer les appels
    if (content.includes('connectToDatabase()')) {
      content = content.replace(/connectToDatabase\(\)/g, 'connectDB()');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Corrigé: ${filePath}`);
    } else {
      console.log(`ℹ️  Aucune modification nécessaire: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la correction de ${filePath}:`, error.message);
  }
}

console.log('🔧 Correction des imports connectToDatabase vers connectDB...\n');

filesToFix.forEach(fixFile);

console.log('\n✅ Correction terminée !'); 