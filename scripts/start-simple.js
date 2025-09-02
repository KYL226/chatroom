const { exec } = require('child_process');

console.log('🚀 Démarrage des serveurs avec concurrently...\n');

// Utiliser concurrently pour démarrer les deux serveurs
const command = 'npx concurrently "npm run dev:socket" "npm run dev"';

const child = exec(command, {
  cwd: process.cwd(),
  stdio: 'inherit'
});

child.stdout?.pipe(process.stdout);
child.stderr?.pipe(process.stderr);

child.on('error', (error) => {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`\n🛑 Serveurs arrêtés avec le code: ${code}`);
  process.exit(code);
});

// Gérer l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt des serveurs...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt des serveurs...');
  child.kill('SIGTERM');
});
