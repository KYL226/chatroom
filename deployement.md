## Déploiement de l’application Next.js + Socket.IO (Vercel et Render)

Ce guide explique, étape par étape, comment déployer votre application de chat Next.js utilisant Socket.IO et MongoDB sur Vercel et sur Render. Il couvre les particularités des connexions temps réel, la configuration des variables d’environnement, MongoDB Atlas, CORS et JWT, ainsi que des fichiers de configuration comme `vercel.json` et `render.yaml`.

---

### Aperçu rapide
- **Vercel**: Parfait pour Next.js côté Web, mais ses fonctions serverless ne sont pas idéales pour des connexions WebSocket/Socket.IO persistantes. Deux options:
  - Option A (best-effort): Héberger une route API Socket.IO (éphémère) sur Vercel; suffisant pour tests/démos, moins fiable pour forte charge.
  - Option B (recommandé en prod): Déployer le front Next.js sur Vercel et le serveur Socket.IO persistant sur un autre service (p.ex. Render).
- **Render**: Exécute un serveur Node.js persistant. Idéal pour Socket.IO avec `server.js` (votre intégration Next + Socket.IO + MongoDB).

---

### Prérequis
- Compte GitHub/GitLab/Bitbucket avec le dépôt de l’appli.
- Compte Vercel et/ou Render.
- Compte MongoDB Atlas (ou une autre base accessible publiquement).
- Variables d’environnement prêtes (voir ci-dessous).

---

### Variables d’environnement à définir
- `MONGODB_URI`: URI MongoDB Atlas (ex.: `mongodb+srv://user:pass@cluster/db?retryWrites=true&w=majority`).
- `JWT_SECRET`: Secret pour signer/valider les JWT.
- `NEXT_PUBLIC_APP_URL`: URL publique de l’app Web (ex.: `https://votre-domaine.com`). Sert aussi au CORS Socket.IO.
- (optionnel) `PORT`: Port d’écoute (Render le fournit automatiquement en prod).

Assurez-vous que `server.js` et la config Socket.IO utilisent bien `NEXT_PUBLIC_APP_URL` dans `cors.origin`.

Extrait typique côté Socket.IO:
```javascript
const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
```

---

## Déploiement sur Vercel

Vercel est optimisé pour Next.js, mais ses fonctions serverless redémarrent souvent, ce qui n’est pas idéal pour les connexions WebSocket persistantes. Vous avez deux stratégies:

### Option A — Tout sur Vercel (best-effort)
1) Connectez votre dépôt à Vercel.
2) Dans le tableau de bord Vercel, configurez les variables d’environnement:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL` (ex.: l’URL Vercel une fois connue)
3) Ajoutez un fichier `vercel.json` minimal pour router Socket.IO vers une route API (les fonctions sont éphémères):
```json
{
  "version": 2,
  "builds": [
    { "src": "package.json", "use": "@vercel/next" }
  ],
  "routes": [
    { "src": "/socket.io/(.*)", "dest": "/api/socket.io" }
  ]
}
```
4) Créez une route API Socket.IO (best-effort) `pages/api/socket.io.ts` ou `app/api/socket.io/route.ts` selon votre structure. Exemple Next API (Pages Router):
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import type { Server as NetServer } from 'http';
import type { Socket as NetSocket } from 'net';

interface SocketServer extends NetServer { io?: ServerIO }
interface SocketWithIO extends NetSocket { server: SocketServer }
interface NextApiResponseWithSocket extends NextApiResponse { socket: SocketWithIO }

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    const io = new ServerIO(res.socket.server, {
      path: '/api/socket.io',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });
    res.socket.server.io = io;
  }
  res.end();
}
```
5) Déployez. Testez le temps réel. Note: des déconnexions peuvent survenir en charge.

### Option B — Vercel (UI) + Socket.IO ailleurs (recommandé)
- Déployez l’UI Next.js sur Vercel (sans Socket.IO côté API).
- Déployez le serveur `server.js` (Next + Socket.IO) sur Render (voir section Render), puis pointez le client Socket.IO vers l’URL Render.
  - Définissez `NEXT_PUBLIC_SOCKET_URL` côté client si vous la supportez, sinon utilisez `NEXT_PUBLIC_APP_URL` dédié au serveur Socket (Render).

### Commandes et build sur Vercel
- Build: Vercel détecte Next.js et exécute `next build`.
- Start: géré par la plateforme.
- Assurez-vous que votre `package.json` contient:
  - `build`: `next build`
  - `start` (optionnel côté Vercel)

### Dépannage Vercel
- Connexions Socket.IO instables: envisagez l’Option B (Render pour Socket.IO).
- CORS: vérifiez `NEXT_PUBLIC_APP_URL` et l’origine configurée côté serveur Socket.
- Variables d’env: re-déployez après modifications.

---

## Déploiement sur Render (recommandé pour Socket.IO)

Render permet d’exécuter `server.js`, ce qui maintient des connexions WebSocket persistantes.

### Étapes rapides via Render Dashboard
1) Créez un service Web (New > Web Service) à partir de votre repo.
2) Choisissez l’environnement Node.
3) Build Command: `npm install && npm run build`
4) Start Command: `npm start` (votre `server.js` est lancé par `node server.js`).
5) Variables d’environnement:
   - `NODE_ENV=production`
   - `MONGODB_URI` (depuis Atlas)
   - `JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL` (URL publique Render, par ex. `https://<service>.onrender.com`)
6) Activez WebSockets (Render l’active par défaut pour les services Web Node).
7) Déployez.

### Déploiement via fichier `render.yaml`
Ajoutez un fichier `render.yaml` à la racine du repo pour l’infra-as-code:
```yaml
services:
  - type: web
    name: chatroom-app
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false # définissez la valeur dans le dashboard ou via secrets
      - key: JWT_SECRET
        sync: false
      - key: NEXT_PUBLIC_APP_URL
        sync: false
```

Ensuite, dans le dashboard Render, assignez les valeurs réelles des env vars (ou utilisez Render Blueprint avec secrets).

### Particularités Render
- Render fournit un port via la variable d’environnement `PORT`. Ne forcez pas un autre port en production.
- Les connexions Socket.IO resteront stables (processus Node persistant).
- Si vous avez un domaine custom, ajoutez-le dans Render et mettez à jour `NEXT_PUBLIC_APP_URL`.

### Dépannage Render
- 404/timeout: vérifiez que `server.js` écoute bien `process.env.PORT`.
- CORS: l’origine doit correspondre à l’URL publique.
- MongoDB: autorisez l’IP de sortie de Render dans Atlas (ou utilisez `0.0.0.0/0` temporairement avec IP access list + SRV/TLS).

---

## MongoDB Atlas (configuration rapide)
1) Créez un cluster gratuit.
2) Créez un utilisateur base de données et notez `username/password`.
3) Ajoutez les IP autorisées (0.0.0.0/0 pour tester, restreindre ensuite).
4) Copiez l’URI de connexion SRV et assignez-la à `MONGODB_URI`.
5) (Optionnel) Créez les index via vos scripts (`npm run db:indexes`) si applicable.

---

## CORS et Socket.IO
- Côté serveur (`server.js`), configurez `cors.origin` sur l’URL publique exacte.
- Si front et socket sont sur des domaines différents (Vercel + Render), mettez l’URL du front dans l’origine du serveur Socket (Render).
- Côté client, pointez le client Socket.IO vers l’URL correcte (utilisez une variable comme `NEXT_PUBLIC_SOCKET_URL` si possible).

---

## JWT et Auth
- `JWT_SECRET` doit être fort et différent entre dev et prod.
- Vérifiez que votre middleware Socket.IO lit/valide le token depuis `socket.handshake.auth` ou les headers.
- Si le token est côté cookie, assurez les attributs `Secure`, `SameSite`, et domaine en prod.

---

## Fichiers utiles (récap)
- `package.json`
  - `build`: `next build`
  - `start`: `node server.js`
- `server.js`: serveur Node custom qui intègre Next.js + Socket.IO + MongoDB.
- `vercel.json`: routage minimal et build sur Vercel (Option A).
- `render.yaml`: déploiement infra-as-code sur Render.
- `next.config.ts`: `images.remotePatterns` déjà configurés pour des domaines externes.

---

## GitHub Actions (optionnel)
Pour des checks automatiques avant déploiement, ajoutez `.github/workflows/ci.yml`:
```yaml
name: CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
```
Intégrez ensuite Vercel/Render à votre repo pour les déploiements automatiques après push sur `main`.

---

## Checklists de fin
- Vercel (Option A):
  - [ ] `vercel.json` présent si vous utilisez la route API Socket.
  - [ ] Env vars: `MONGODB_URI`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`.
  - [ ] Tests temps réel OK (attention aux limites serverless).
- Vercel + Render (Option B):
  - [ ] UI Next sur Vercel, Socket.IO sur Render.
  - [ ] Côté client, URL du socket = Render.
  - [ ] CORS/JWT alignés.
- Render seul:
  - [ ] `npm run build` puis `npm start` lancent `server.js`.
  - [ ] Env vars définies.
  - [ ] WebSockets actifs et stables.

---

## FAQ
- Pourquoi Vercel n’est pas idéal pour Socket.IO ?
  - Les fonctions sont éphémères et peuvent être recyclées, ce qui perturbe les connexions persistantes. Pour de la prod robuste, utilisez un serveur persistant (Render, Fly.io, Railway, etc.).

- Puis-je tout héberger sur Render ?
  - Oui. C’est la voie la plus simple pour Socket.IO car `server.js` tourne en continu.

- Comment gérer plusieurs environnements (staging/prod) ?
  - Créez deux services Render et/ou deux projets Vercel, avec des env vars séparées et des URLs propres (mettez à jour CORS en conséquence).

---

Bon déploiement !


