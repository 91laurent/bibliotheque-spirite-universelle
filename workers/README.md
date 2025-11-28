# Cloudflare Worker - Proxy API Gemini

Ce worker Cloudflare fait office de proxy pour cacher la clé API Google Gemini.

## Déploiement via l'interface Cloudflare (FACILE)

### 1. Créer le Worker

1. Connectez-vous à [dash.cloudflare.com](https://dash.cloudflare.com)
2. Dans le menu de gauche, cliquez sur **"Workers & Pages"**
3. Cliquez sur **"Create application"**
4. Choisissez **"Create Worker"**
5. Donnez un nom : `bibliotheque-spirite-api`
6. Cliquez sur **"Deploy"**

### 2. Remplacer le code

1. Cliquez sur **"Edit code"** (bouton en haut à droite)
2. **Supprimez tout le code** dans l'éditeur
3. **Copiez-collez** le contenu du fichier `src/index.js`
4. Cliquez sur **"Save and Deploy"** (bouton en haut à droite)

### 3. Ajouter la clé API (Secret)

1. Retournez à la page du worker
2. Cliquez sur **"Settings"** (onglet en haut)
3. Cliquez sur **"Variables and Secrets"** (dans le menu de gauche)
4. Sous "Environment Variables", cliquez sur **"Add variable"**
5. Type : **"Secret"** (cochez "Encrypt")
6. Name : `GEMINI_API_KEY`
7. Value : Votre clé API Google Gemini
8. Cliquez sur **"Save"**

### 4. Récupérer l'URL du Worker

Votre worker sera disponible à une URL comme :
```
https://bibliotheque-spirite-api.VOTRE-SUBDOMAIN.workers.dev
```

Cette URL sera à utiliser dans les fichiers HTML !

---

## Déploiement via CLI (Avancé)

Si vous préférez utiliser la ligne de commande :

```bash
# Installer Wrangler
npm install -g wrangler

# Se connecter à Cloudflare
wrangler login

# Déployer
wrangler deploy

# Ajouter le secret
wrangler secret put GEMINI_API_KEY
# (Puis entrez votre clé API quand demandé)
```

---

## Test du Worker

Une fois déployé, vous pouvez tester avec :

```bash
curl -X POST https://VOTRE-WORKER-URL.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-1.5-flash",
    "contents": "Bonjour, qui es-tu ?"
  }'
```
