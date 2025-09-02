# Configuration de la Base de Données MongoDB

Ce guide vous explique comment configurer MongoDB pour votre application Chatroom.

## 📋 Prérequis

1. **MongoDB installé** sur votre machine
2. **Node.js** et **npm** installés
3. **Git** pour cloner le projet

## 🚀 Installation de MongoDB

### Option 1: Installation locale

#### Windows
1. Téléchargez MongoDB Community Server depuis [mongodb.com](https://www.mongodb.com/try/download/community)
2. Installez MongoDB en suivant l'assistant
3. MongoDB sera accessible sur `mongodb://localhost:27017`

#### macOS
```bash
# Avec Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
# Installer MongoDB
sudo apt update
sudo apt install mongodb

# Démarrer le service
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Option 2: MongoDB Atlas (Cloud)

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Créez un cluster gratuit
3. Obtenez votre URI de connexion
4. Remplacez `MONGODB_URI` dans `.env.local`

## ⚙️ Configuration

### 1. Créer le fichier .env.local

Créez un fichier `.env.local` à la racine du projet :

```env
# Configuration MongoDB
MONGODB_URI=mongodb://localhost:27017/chatroom

# Configuration JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Configuration de l'application
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Initialiser la base de données

```bash
npm run init-db
```

Cette commande va :
- Se connecter à MongoDB
- Créer les index nécessaires
- Créer un utilisateur admin par défaut
- Créer des salles par défaut
- Créer des utilisateurs de test

## 🔍 Vérification

### Tester la connexion

```bash
npm run db:check
```

### Vérifier les index

```bash
npm run db:indexes
```

## 👤 Comptes par défaut

Après l'initialisation, vous aurez accès à ces comptes :

### Administrateur
- **Email:** admin@chatroom.com
- **Mot de passe:** admin123
- **Rôle:** Admin

### Utilisateurs de test
- **Alice:** alice@test.com / password123
- **Bob:** bob@test.com / password123
- **Charlie:** charlie@test.com / password123 (Modérateur)

## 🏠 Salles par défaut

- **Général** - Salle de discussion générale
- **Aide** - Salle d'aide et support
- **Développement** - Discussion sur le développement
- **Gaming** - Discussion sur les jeux vidéo
- **Musique** - Partage de musique et playlists

## 🛠️ Commandes utiles

### Redémarrer la base de données
```bash
# Windows
net stop MongoDB
net start MongoDB

# macOS
brew services restart mongodb/brew/mongodb-community

# Linux
sudo systemctl restart mongodb
```

### Voir les logs MongoDB
```bash
# Windows
tail -f "C:\Program Files\MongoDB\Server\{version}\log\mongod.log"

# macOS/Linux
tail -f /var/log/mongodb/mongod.log
```

### Se connecter à MongoDB
```bash
mongosh
# ou
mongo
```

## 🔧 Dépannage

### Erreur de connexion
1. Vérifiez que MongoDB est démarré
2. Vérifiez l'URI dans `.env.local`
3. Vérifiez les permissions du dossier de données

### Erreur d'authentification
1. Vérifiez que le fichier `.env.local` existe
2. Vérifiez que `JWT_SECRET` est défini
3. Redémarrez l'application

### Erreur d'index
```bash
npm run db:indexes
```

## 📊 Structure de la base de données

### Collections principales
- **users** - Utilisateurs de l'application
- **rooms** - Salles de chat
- **conversations** - Conversations privées
- **messages** - Messages envoyés
- **reports** - Signalements
- **statistics** - Statistiques d'utilisation

### Index créés
- Email unique pour les utilisateurs
- Nom unique pour les salles
- Index sur les dates pour les performances
- Index sur les statuts pour les requêtes

## 🚀 Démarrage de l'application

Une fois la base de données configurée :

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🔐 Sécurité

### En production
1. Changez `JWT_SECRET` pour une clé sécurisée
2. Utilisez MongoDB Atlas ou un serveur sécurisé
3. Activez l'authentification MongoDB
4. Configurez un pare-feu
5. Utilisez HTTPS

### Variables d'environnement recommandées
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatroom?retryWrites=true&w=majority
JWT_SECRET=your-very-long-and-secure-secret-key
NODE_ENV=production
```

## 📝 Notes importantes

- La base de données `chatroom` sera créée automatiquement
- Les index sont créés pour optimiser les performances
- Les données de test peuvent être supprimées en production
- Sauvegardez régulièrement vos données importantes 