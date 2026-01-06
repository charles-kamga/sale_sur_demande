# 📚 Salle sur Demande

Une interface web moderne et sécurisée pour consulter vos notes de recherche en Markdown, accessible de n'importe où.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![Vite](https://img.shields.io/badge/Vite-5.4-646cff)

## ✨ Fonctionnalités

- 🎨 **Interface Premium** : Design moderne avec effets glassmorphism et animations fluides
- 📝 **Support Markdown Complet** : Rendu des tableaux, listes de tâches, et syntaxe GitHub Flavored Markdown
- 🔍 **Recherche Rapide** : Trouvez vos notes instantanément
- 📱 **Responsive** : Interface adaptée mobile et desktop
- 🌐 **Déploiement Facile** : Prêt pour Render, Vercel, Netlify

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+ 
- npm ou yarn

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/charles-kamga/sale_sur_demande.git
cd sale_sur_demande

# Installer les dépendances
npm install

# Générer l'index des documents
npm run index

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 📁 Structure du Projet

```
/
├── public/
│   ├── docs/              # 📝 Vos fichiers Markdown ici
│   └── data.json          # Index généré automatiquement
├── src/
│   ├── components/        # Composants React réutilisables
│   ├── styles/           # Styles CSS
│   ├── App.jsx           # Composant principal
│   └── main.jsx          # Point d'entrée
├── scripts/
│   └── generate_index.js  # Script d'indexation
└── package.json
```

## 📝 Ajouter de Nouveaux Documents

1. **Déposez vos fichiers `.md`** dans le dossier `public/docs/`
2. **Générez l'index** :
   ```bash
   npm run index
   ```
3. **Commit et push** :
   ```bash
   git add .
   git commit -m "Add new documentation"
   git push
   ```

Le déploiement se fera automatiquement sur Render.

## 🛠️ Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Crée le build de production |
| `npm run preview` | Prévisualise le build de production |
| `npm run index` | Génère l'index des documents Markdown |
| `npm run lint` | Vérifie la qualité du code |

## 🌐 Déploiement sur Render

1. Connectez votre dépôt GitHub à Render
2. Configurez le service :
   - **Build Command** : `npm install && npm run build`
   - **Publish Directory** : `dist`
   - **Root Directory** : Laisser vide (ou `./`)
3. Déployez !

## 🎨 Technologies Utilisées

- **React 18** - Framework UI
- **Vite** - Build tool ultra-rapide
- **Framer Motion** - Animations fluides
- **React Markdown** - Rendu Markdown
- **remark-gfm** - Support GitHub Flavored Markdown
- **Lucide React** - Icônes modernes

## 📄 License

Ce projet est à usage personnel.

## 👤 Auteur

**Charles Kamga**

---

*Développé avec ❤️ pour un accès sécurisé et élégant à vos notes de recherche*
