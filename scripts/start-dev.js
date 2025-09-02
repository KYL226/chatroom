const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

console.log('🚀 Démarrage des serveurs de développement...\n');

// Fonction pour démarrer un processus avec gestion d'erreurs
function startProcess(command, args, name) {
  console.log(`📡 Démarrage de ${name}...`);
  
  const process = spawn(command, args, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    shell: true // Utiliser le shell pour une meilleure compatibilité Windows
  });

  process.on('error', (error) => {
    console.error(`❌ Erreur lors du démarrage de ${name}:`, error.message);
  });

  process.on('exit', (code) => {
    if (code !== 0) {
      console.error(`⚠️ ${name} s'est arrêté avec le code: ${code}`);
    }
  });

  return process;
}

// Démarrer le serveur Socket.io
const socketServer = startProcess('node', ['server.js'], 'Serveur Socket.io');

// Attendre un peu avant de démarrer Next.js
setTimeout(() => {
  // Démarrer Next.js
  const nextServer = startProcess('npm', ['run', 'dev'], 'Serveur Next.js');

  // Gérer l'arrêt propre
  function shutdown() {
    console.log('\n🛑 Arrêt des serveurs...');
    socketServer.kill('SIGINT');
    nextServer.kill('SIGINT');
    
    // Attendre un peu avant de quitter
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}, 1000);
