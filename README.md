# 🚀 Chatroom - Application de Chat en Temps Réel

Une application moderne de chat en temps réel construite avec Next.js 14, MongoDB et Socket.io.

## ✨ Fonctionnalités

- 🔐 **Authentification sécurisée** avec JWT
- 💬 **Messagerie en temps réel** avec Socket.io
- 🏠 **Salles de chat** publiques et privées
- 👥 **Gestion des utilisateurs** avec rôles (user, moderator, admin)
- 🔍 **Recherche avancée** d'utilisateurs et de salles
- 🚨 **Système de signalements** et modération
- 📊 **Analytics et statistiques** pour l'administration
- 📱 **Interface responsive** et moderne
- 🎨 **Design moderne** avec Tailwind CSS

## 🚀 Démarrage Rapide

### Configuration automatique (recommandé)

```bash
# Cloner le projet
git clone <votre-repo>
cd chatroom

# Configuration automatique
npm run setup
```

### Configuration manuelle

```bash
# 1. Installer les dépendances
npm install

# 2. Créer le fichier .env.local
npm run setup-env

# 3. Vérifier MongoDB
npm run check-db

# 4. Initialiser la base de données
npm run init-db

# 5. Démarrer l'application
npm run dev
```

## 📋 Prérequis

- Node.js 18+
- MongoDB (local ou Atlas)
- npm ou yarn

## 🔧 Scripts disponibles

```bash
# Configuration complète
npm run setup

# Gestion de la base de données
npm run init-db          # Initialiser la DB
npm run check-db         # Vérifier la connexion
npm run setup-env        # Créer .env.local

# Développement
npm run dev              # Démarrer en développement
npm run build            # Construire pour production
npm run start            # Démarrer en production
npm run lint             # Vérifier le code
```

## 👤 Comptes de test

### Administrateur
- **Email:** admin@chatroom.com
- **Mot de passe:** admin123
- **Accès:** Panel d'administration complet

### Utilisateurs de test
- **Alice:** alice@test.com / password123
- **Bob:** bob@test.com / password123
- **Charlie:** charlie@test.com / password123 (Modérateur)

## 🏗️ Architecture

```
chatroom/
├── app/                 # Pages Next.js 14 (App Router)
│   ├── (auth)/         # Pages d'authentification
│   ├── admin/          # Panel d'administration
│   ├── api/            # Routes API
│   └── salles/         # Pages des salles
├── components/          # Composants React
│   ├── admin/          # Composants d'administration
│   ├── chatroom/       # Composants de chat
│   └── ui/             # Composants UI réutilisables
├── lib/                # Utilitaires et configuration
├── models/             # Modèles MongoDB
└── scripts/            # Scripts de configuration
```

## 🛠️ Technologies

- **Frontend:** Next.js 14, React 19, TypeScript
- **Styling:** Tailwind CSS, Radix UI
- **Backend:** Next.js API Routes, Socket.io
- **Base de données:** MongoDB avec Mongoose
- **Authentification:** JWT, bcryptjs
- **Graphiques:** Chart.js, Recharts
- **Validation:** Zod, React Hook Form

## 📚 Documentation

- [Guide de démarrage rapide](QUICK_START.md)
- [Configuration de la base de données](DATABASE_SETUP.md)
- [Cahier des charges](cahierdecharge.md)

## 🔐 Sécurité

- Authentification JWT sécurisée
- Hachage des mots de passe avec bcryptjs
- Validation des données avec Zod
- Protection CSRF
- Gestion des rôles et permissions

## 🚀 Déploiement

### Variables d'environnement requises

```env
MONGODB_URI= db mongo
JWT_SECRET=your-very-long-and-secure-secret-key
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret-key
```

### Plateformes recommandées

- **Vercel** - Déploiement facile avec Next.js
- **Netlify** - Alternative populaire
- **Railway** - Déploiement full-stack
- **DigitalOcean** - Serveur dédié

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :

1. Consultez la documentation
2. Vérifiez les issues existantes
3. Créez une nouvelle issue avec les détails

---

**Développé avec ❤️ pour la communauté des développeurs**
