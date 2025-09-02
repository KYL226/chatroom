# 🚀 Guide de Démarrage Rapide - Chatroom

Ce guide vous aide à configurer et démarrer rapidement votre application Chatroom.

## 📋 Prérequis

- ✅ Node.js (v18+) installé
- ✅ npm installé
- ✅ MongoDB installé et démarré

## ⚡ Configuration Express

### 1. Installer les dépendances

```bash
npm install
```

### 2. Créer le fichier .env.local

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

### 3. Vérifier MongoDB

Assurez-vous que MongoDB est démarré :

```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb/brew/mongodb-community

# Linux
sudo systemctl start mongodb
```

### 4. Tester la connexion

```bash
npm run check-db
```

Si tout fonctionne, vous devriez voir :
```
✅ MongoDB connected successfully!
📊 Database: chatroom
```

### 5. Initialiser la base de données

```bash
npm run init-db
```

Cette commande va créer :
- 👤 Un utilisateur admin
- 🏠 Des salles par défaut
- 👥 Des utilisateurs de test

### 6. Démarrer l'application

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 👤 Comptes de test

### Administrateur
- **Email:** admin@chatroom.com
- **Mot de passe:** admin123
- **Accès:** Panel d'administration complet

### Utilisateurs de test
- **Alice:** alice@test.com / password123
- **Bob:** bob@test.com / password123
- **Charlie:** charlie@test.com / password123 (Modérateur)

## 🏠 Salles disponibles

- **Général** - Discussion générale
- **Aide** - Support et assistance
- **Développement** - Programmation et tech
- **Gaming** - Jeux vidéo
- **Musique** - Partage musical

## 🔧 Commandes utiles

```bash
# Vérifier la base de données
npm run check-db

# Réinitialiser la base de données
npm run init-db

# Vérifier les index
npm run db:indexes

# Démarrer en mode développement
npm run dev

# Construire pour la production
npm run build

# Démarrer en mode production
npm run start
```

## 🚨 Dépannage rapide

### Erreur de connexion MongoDB
```bash
# Vérifier que MongoDB est démarré
npm run check-db

# Si MongoDB n'est pas installé
# Windows: Télécharger depuis mongodb.com
# macOS: brew install mongodb-community
# Linux: sudo apt install mongodb
```

### Erreur de dépendances
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Erreur de port
```bash
# Vérifier qu'aucune autre application n'utilise le port 3000
# Ou changer le port dans package.json
"dev": "next dev --turbopack -p 3001"
```

## 🎯 Fonctionnalités principales

### ✅ Implémentées
- 🔐 Authentification JWT
- 👥 Gestion des utilisateurs
- 🏠 Salles de chat
- 💬 Messagerie en temps réel
- 🔍 Recherche d'utilisateurs et salles
- 🚨 Système de signalements
- 📊 Analytics et statistiques
- 👨‍💼 Panel d'administration

### 🚧 En développement
- 📱 Interface mobile responsive
- 📁 Partage de fichiers
- 🔔 Notifications push
- 🎨 Thèmes personnalisables

## 🔐 Sécurité

### Variables d'environnement importantes
- `JWT_SECRET` : Clé secrète pour les tokens (changez en production)
- `MONGODB_URI` : URI de connexion MongoDB
- `NEXTAUTH_SECRET` : Clé secrète NextAuth

### Recommandations de sécurité
1. Changez `JWT_SECRET` pour une clé sécurisée
2. Utilisez MongoDB Atlas en production
3. Activez HTTPS en production
4. Configurez un pare-feu
5. Sauvegardez régulièrement vos données

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez que MongoDB est démarré
2. Vérifiez le fichier `.env.local`
3. Consultez les logs dans la console
4. Vérifiez la documentation complète dans `DATABASE_SETUP.md`

## 🎉 Félicitations !

Votre application Chatroom est maintenant configurée et prête à être utilisée !

- 🌐 Accédez à `http://localhost:3000`
- 👤 Connectez-vous avec admin@chatroom.com / admin123
- 🏠 Explorez les salles de chat
- 📊 Testez le panel d'administration
- 🔍 Essayez la recherche d'utilisateurs

Bon développement ! 🚀 