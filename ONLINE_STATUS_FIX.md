# Corrections du Statut en Ligne et des Conversations Privées

## Problèmes résolus

### 1. Statut "Hors ligne" avec point rouge
- **Problème** : Tous les utilisateurs affichaient "Hors ligne" avec un point rouge
- **Cause** : Le champ `isOnline` était par défaut `false` et n'était jamais mis à jour
- **Solution** : Mise en place d'un système de heartbeat pour maintenir le statut en ligne

### 2. Conversations privées qui ne s'ouvrent pas
- **Problème** : Impossible de créer des conversations privées en cliquant sur les contacts
- **Cause** : Les contacts n'étaient pas cliquables et aucune logique de création de conversation
- **Solution** : Implémentation complète du système de conversations privées

## Nouvelles fonctionnalités

### API Heartbeat
- **Endpoint** : `/api/users/heartbeat`
- **Fonction** : Met à jour le statut en ligne de l'utilisateur connecté
- **Fréquence** : Toutes les 30 secondes + événements de focus/visibilité

### Vérification des conversations existantes
- **Endpoint** : `/api/conversations/check`
- **Fonction** : Vérifie si une conversation privée existe déjà entre deux utilisateurs
- **Avantage** : Évite la création de doublons

### Gestion automatique du statut en ligne
- **Connexion** : L'utilisateur est marqué comme "en ligne"
- **Déconnexion** : L'utilisateur est marqué comme "hors ligne"
- **Inactivité** : Script de nettoyage automatique des statuts

## Fichiers modifiés

### Composants
- `components/chatroom/LeftSidebar.tsx` - Contacts cliquables et création de conversations
- `components/chatroom/ChatLayout.tsx` - Intégration du hook de statut en ligne

### API
- `app/api/auth/login/route.ts` - Mise à jour du statut en ligne lors de la connexion
- `app/api/auth/logout.ts` - Mise à jour du statut en ligne lors de la déconnexion
- `app/api/users/heartbeat/route.ts` - Nouvelle API de heartbeat
- `app/api/conversations/check/route.ts` - Vérification des conversations existantes

### Hooks
- `lib/hooks/useOnlineStatus.ts` - Hook personnalisé pour maintenir le statut en ligne

### Scripts
- `scripts/clean-online-status.ts` - Nettoyage automatique des statuts inactifs

## Utilisation

### Démarrage automatique
Le statut en ligne est automatiquement géré lors de la connexion/déconnexion et maintenu par le hook `useOnlineStatus`.

### Nettoyage manuel
```bash
npm run clean-online-status
```

### Création de conversations privées
1. Cliquer sur un contact dans la liste des contacts
2. Une conversation privée est automatiquement créée ou ouverte si elle existe déjà
3. La conversation apparaît dans la liste des conversations privées

## Configuration

### Variables d'environnement
Assurez-vous que `MONGODB_URI` est configuré dans votre fichier `.env`.

### Base de données
Le modèle `User` doit avoir les champs suivants :
- `isOnline: Boolean` (défaut: false)
- `lastSeen: Date` (défaut: Date.now)

## Maintenance

### Nettoyage automatique
Le script `clean-online-status.ts` peut être exécuté via cron pour nettoyer automatiquement les statuts inactifs :

```bash
# Toutes les 5 minutes
*/5 * * * * cd /path/to/chatroom && npm run clean-online-status
```

### Monitoring
- Vérifiez les logs pour détecter les erreurs de heartbeat
- Surveillez la performance de la base de données avec les requêtes fréquentes
- Ajustez l'intervalle de heartbeat selon vos besoins (actuellement 30 secondes)

## Dépannage

### Statut toujours "hors ligne"
1. Vérifiez que l'API `/api/users/heartbeat` fonctionne
2. Vérifiez les logs de la console pour les erreurs
3. Vérifiez que le token d'authentification est valide

### Conversations privées ne se créent pas
1. Vérifiez que l'API `/api/conversations` fonctionne
2. Vérifiez les permissions d'écriture en base de données
3. Vérifiez que les modèles `User` et `Conversation` sont correctement configurés
