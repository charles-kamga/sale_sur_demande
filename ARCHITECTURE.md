# Architecture — Salle sur Demande

## 1. Vue d'ensemble

Salle sur Demande est une application web de consultation et d'édition de documents (Markdown + PDF), conçue comme un **site de documentation technique personnelle**.

**Stack :** React 18 + Vite 5 (frontend) + Express 5 (API) = architecture JAMstack avec un service de persistance léger.

```
┌─────────────────────────────────────────────────────────────┐
│                   NAVIGATEUR (Client)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │   Sidebar   │  │ Main Content │  │    Toast (toast)   │  │
│  │  - Search   │  │ - Dashboard  │  │ notifications      │  │
│  │  - FileTree │  │ - DocViewer  │  └────────────────────┘  │
│  │  - NewFile  │  │ - Welcome    │                         │
│  └─────────────┘  └──────────────┘                         │
│                        │                                    │
│                 Vite Proxy (/api/*)                         │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP
┌───────────────────────▼─────────────────────────────────────┐
│                SERVEUR API (Express)                         │
│  GET  /api/files/:path   → lit un fichier                   │
│  POST /api/save          → écrit + regénère l'index         │
│                                                              │
│  ╔══════════════════════════════════════════════════════╗    │
│  ║   FILESYSTEM (public/docs/)                          ║    │
│  ║   ├── cybersec/    (5 .md)  ← pentesting, réseaux   ║    │
│  ║   ├── utilitaires/ (5 .md + 6 .pdf) ← scripts, PDFs ║    │
│  ║   └── notes/       (2 .md)   ← mémos divers         ║    │
│  ║   public/data.json ← index auto-généré               ║    │
│  ╚══════════════════════════════════════════════════════╝    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Arborescence du projet

```
salle_sur_demande/
├── index.html                    # Point d'entrée HTML (Vite)
├── vite.config.js                # Configuration Vite + proxy API
├── package.json                  # Dépendances & scripts
├── server.mjs                    # API Express (Node.js)
│
├── public/                       # Servi statiquement par Vite
│   ├── data.json                 # Index JSON de tous les documents
│   └── docs/                     # Contenu Markdown + PDF
│       ├── cybersec/             # Catégorie cybersécurité
│       ├── utilitaires/          # Catégorie utilitaires
│       └── notes/                # Catégorie notes
│
├── scripts/
│   └── generate_index.js         # Scanner de l'arborescence docs/
│
├── src/                          # Code source React
│   ├── main.jsx                  # Bootstrap React (<App />)
│   ├── index.css                 # Design System (tokens CSS)
│   ├── App.jsx                   # Composant racine (orchestrateur)
│   ├── App.css                   # Layout & composants styles
│   │
│   └── components/
│       ├── Sidebar.jsx           # Barre latérale (search + menu)
│       ├── FileTree.jsx          # Arborescence avec accordéon
│       ├── DocViewer.jsx         # Visualiseur/éditeur Markdown + PDF
│       ├── WelcomeScreen.jsx     # Page d'accueil (dashboard)
│       └── Toast.jsx             # Système de notifications
│
├── dist/                         # Build de production (généré)
├── .gitignore
└── README.md
```

---

## 3. Data Flow & Logique

### 3.1. Flux principal

```
[Démarrage]
     │
     ▼
App.fetchIndex() ──────────────► GET /data.json
     │                              │
     ▼                              ▼
setState(data) ◄────────────── JSON (arborescence)
     │
     ├──► WelcomeScreen reçoit data ──► rend les cartes/stats/récents
     │
     └──► Sidebar.recherche filtre (useMemo)
               │
               ▼
          FileTree rend l'arborescence filtrée
               │
               ▼ (clic fichier)
          handleSelectFile(file)
               │
               ▼
          GET /docs/${file.path} ──► lecture fichier
               │
               ▼
          DocViewer affiche le contenu (Markdown→ReactMarkdown ou PDF→iframe)
```

### 3.2. Flux d'édition

```
[Dashboard → clic "Nouveau fichier"]
     │
     ▼
Formulaire dans Sidebar
     │
     ▼  handleCreateFile()
POST /api/save ──────────► server.mjs
     │                        │
     ▼                        ▼
fetchIndex() (rafraîchit)  fs.writeFile() + generate_index.js

[Même flux pour la sauvegarde depuis DocViewer]
     │
     ▼
POST /api/save ──► écriture + regénération index
     │
     ▼
addToast('Document sauvegardé ✓')
```

### 3.3. État global (App.jsx)

| State | Type | Rôle |
|---|---|---|
| `data` | `Array` | Arborescence complète des documents (index JSON) |
| `selectedFile` | `Object│null` | Fichier actuellement ouvert |
| `fileContent` | `String` | Contenu brut du fichier sélectionné |
| `isSidebarOpen` | `Boolean` | Visibilité de la sidebar (mobile) |
| `searchTerm` | `String` | Texte de recherche |
| `loading` | `Boolean` | État de chargement de l'index |
| `isSaving` | `Boolean` | État de sauvegarde en cours |
| `isCreatingNew` | `Boolean` | Formulaire de création visible |
| `newFileName` | `String` | Nom du fichier en cours de création |
| `expandedDirs` | `Object` | État d'ouverture des dossiers (path → true/false) |
| `notifications` | `Array` | File d'attente des toasts |

**Aucun state management externe** — React `useState` + `useCallback` + `useMemo` suffisent pour cette volumétrie.

---

## 4. Composants React

### 4.1. App.jsx — Orchestrateur racine

**Rôle :** Gère tout le state applicatif, les effets de bord (fetch), et la navigation entre les vues.

**Structure du render :**
```
<div class="app-container">
  {/* Menu hamburger (mobile) */}

  <Sidebar>                                   ← Composant shell
    <FileTree items={filteredData} />         ← Arborescence
  </Sidebar>

  <main>
    {/* Barre de navigation contextuelle */}

    <AnimatePresence>
      {selectedFile ? <DocViewer />           ← Document ouvert
                     : <WelcomeScreen />}      ← Dashboard
    </AnimatePresence>
  </main>

  <Toast />                                    ← Notifications
</div>
```

**Points clés :**
- `useMemo(filteredData)` filtre récursivement l'arborescence sans recalcul inutile
- `useEffect(fetchIndex)` appel unique au montage
- `useEffect(loadFile)` déclenché à chaque changement de `selectedFile`
- Validation des caractères interdits `<>:"/\|?*` avant création

### 4.2. Sidebar.jsx — Barre latérale

**Props :** `isOpen`, `onToggle`, `searchTerm`, `onSearchChange`, `isCreatingNew`, `onStartCreate`, `onCreateFile`, `newFileName`, `onNewFileNameChange`, `onCancelCreate`, `children`

**Structure :**
```
<aside>
  <header> Logo + titre + bouton fermer </header>
  <div role="search"> Barre de recherche </div>
  <nav> Explorateur + formulaire création + {children} </nav>
  <footer> Status connecté </footer>
</aside>
```

**Comportement :**
- Affiche le formulaire de création conditionnellement (`isCreatingNew`)
- Le formulaire se ferme au blur si vide
- Un overlay mobile est prévu (affiché via CSS)

### 4.3. FileTree.jsx — Arborescence avec accordéon

**Props :** `items`, `selectedFile`, `onSelect`, `expandedDirs`, `onToggleDir`

**Logique :**
- Rendu récursif : chaque dossier appelle `<FileTree>` sur ses `children`
- **Accordéon** : `expandedDirs[item.path]` contrôle l'affichage des enfants
- Icônes différenciées : `Folder` / `FolderOpen` pour dossiers, `FileText` / `File` pour fichiers/PDFs
- État actif : `aria-current="page"` sur le fichier sélectionné
- Badge compteur affiché à droite du nom du dossier

### 4.4. DocViewer.jsx — Visualiseur / Éditeur

**Props :** `selectedFile`, `fileContent`, `onSave`, `isSaving`

**Logique :**
- **Détection PDF** : si `extension === '.pdf'` → affichage iframe + boutons Ouvrir/Télécharger
- **Markdown** : deux onglets (Tabs) :
  - `Aperçu` : rendu via `ReactMarkdown` avec `remark-gfm` (GFM complet : tableaux, listes tâches, etc.)
  - `Éditer` : textarea monospace avec auto-resize vertical
- `Ctrl+S` : écouteur global qui sauvegarde en mode édition
- Breadcrumb avec chemin complet + bouton "Docs" retour accueil

**Transitions :** `framer-motion` avec fade + slide (entrée/sortie)

### 4.5. WelcomeScreen.jsx — Dashboard

**Props :** `data`, `onSelect`, `onCategorySelect`

**Sections :**
1. **Hero** : icône Shield + titre + sous-titre
2. **Stats bar** : nombre de documents, catégories, PDFs
3. **Cartes catégories** : grille responsive avec icônes, description, compteur
4. **Récents** : les 5 derniers fichiers modifiés, avec badge de catégorie

**Logique des cartes :**
- Chaque dossier racine (`cybersec`, `utilitaires`, `notes`) est mappé à une métadonnée (`CATEGORY_META`) qui définit label, icône, couleur, description
- Les dossiers inconnus reçoivent un fallback générique
- `onCategorySelect` déclenche `handleToggleDir` dans App (déplie le dossier)

### 4.6. Toast.jsx — Notifications

**Props :** `notifications`, `removeToast` | **Hook exporté :** `useToast()`

**Logique :**
- `useToast()` gère une file `[ {id, message, type} ]`
- `addToast(msg, type, duration)` ajoute et auto-supprime après `duration` ms (défaut 4000)
- `removeToast(id)` suppression immédiate (bouton X)
- Rendu : empilement en bas à droite, animation `toastIn`
- `aria-live="polite"` pour les lecteurs d'écran

---

## 5. Backend (API Express)

### 5.1. Serveur — server.mjs

| Endpoint | Méthode | Description | Sécurité |
|---|---|---|---|
| `/api/files/*` | GET | Lit un fichier par son chemin relatif | Vérifie `filePath.startsWith(DOCS_DIR)` |
| `/api/save` | POST | Écrit/écrase un fichier + regénère l'index | Même vérification + `mkdir` récursif |

**Middleware :** `cors()` + `express.json()`

**Gestion d'erreurs :**
- `400` : paramètres manquants
- `403` : path traversal détecté
- `405` : méthode non autorisée
- `500` : erreur fichiers/réseau

**Environnement :**
- `PORT` : variable d'environnement (fallback 5000)
- `DOCS_DIR` : variable d'environnement (fallback `public/docs/`)

### 5.2. Script d'indexation — generate_index.js

**Scanner récursif** qui produit `public/data.json` :
```
[
  { "name": "cybersec", "type": "directory", "path": "cybersec",
    "children": [
      { "name": "Dec_8_Hashcat.md", "type": "file", "extension": ".md",
        "path": "cybersec/Dec_8_Hashcat.md", "size": 5100, "mtime": "..." }
    ]
  }
]
```

**Extensions acceptées :** `.md` et `.pdf`
**Exclusions :** fichiers cachés (`.`), `node_modules`, `.git`

---

## 6. Design System (index.css)

### Tokens CSS

```css
:root {
  /* Couleurs */
  --clr-bg, --clr-bg-elevated, --clr-bg-card     /* Fonds (3 niveaux) */
  --clr-border, --clr-border-light                 /* Bordures */
  --clr-accent, --clr-accent-hover                 /* Violet principal */
  --clr-accent-soft, --clr-accent-glow             /* Variantes soft */
  --clr-green, --clr-red, --clr-amber, --clr-blue  /* Sémantiques */
  --clr-text, --clr-text-secondary, --clr-text-tertiary  /* Textes */

  /* Typographie */
  --font-sans: 'Inter', system-ui, sans-serif
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace

  /* Tailles */
  --fs-xs (0.7rem) → --fs-3xl (2.25rem)
  --space-1 (0.25rem) → --space-12 (3rem)
  --radius-sm (4px) → --radius-xl (16px)

  /* Ombres & transitions */
  --shadow-sm/md/lg/accent
  --transition-fast (120ms), --transition-base (200ms)
}
```

### Système de boutons
- `.btn` → base
- `.btn-primary` → violet (action principale)
- `.btn-green` → succès (sauvegarder)
- `.btn-red` → danger (annuler)
- `.btn-sm` → taille compacte

Tous partagent `display: inline-flex; align-items: center; gap`, transition hover/active.

---

## 7. Outillage & Configuration

| Outil | Rôle | Fichier |
|---|---|---|
| **Vite** | Bundler dev/build, HMR, proxy | `vite.config.js` |
| **@vitejs/plugin-react** | Support JSX + Fast Refresh | `vite.config.js` |
| **ESLint** | Linting (config via package.json) | `package.json` scripts |
| **concurrently** | Lance API + Vite en parallèle | `npm run start` |

### Scripts npm

```json
{
  "dev": "vite",                                    // Serveur frontend (HMR)
  "build": "vite build",                            // Build production → dist/
  "preview": "vite preview",                        // Prévisualisation du build
  "server": "node server.mjs",                      // API Express seule
  "start": "concurrently \"npm run server\"...",     // API + Vite simultanés
  "index": "node scripts/generate_index.js",        // Regénération manuelle
  "lint": "eslint ."                                // Qualité code
}
```

### Proxy Vite
```js
// vite.config.js
server: {
  proxy: {
    '/api': { target: 'http://localhost:5000', changeOrigin: true }
  }
}
```
Élimine le CORS en dev : le frontend appelle `/api/save` comme s'il était sur le même origin.

---

## 8. Dépendances

### Production
| Package | Version | Rôle |
|---|---|---|
| react | ^18.3.1 | Framework UI |
| react-dom | ^18.3.1 | Rendu DOM |
| framer-motion | ^11.5.4 | Animations (AnimatePresence, motion) |
| react-markdown | ^9.0.1 | Rendu Markdown → JSX |
| remark-gfm | ^4.0.1 | Support GFM (tableaux, listes tâches) |
| lucide-react | ^0.446.0 | Icônes SVG modernes |
| express | ^5.2.1 | Serveur HTTP API |
| cors | ^2.8.6 | Middleware CORS |
| concurrently | ^9.2.1 | Lancement parallèle API + Vite |
| clsx | ^2.1.1 | Utilitaires classes CSS |
| tailwind-merge | ^2.5.2 | Fusion classes Tailwind (présent mais non exploité) |

### Développement
| Package | Version | Rôle |
|---|---|---|
| vite | ^5.4.2 | Bundler / dev server |
| @vitejs/plugin-react | ^4.3.1 | Support JSX |
| eslint | ^9.9.1 | Linter |
| eslint-plugin-react | ^7.35.0 | Règles React |
| eslint-plugin-react-hooks | ^5.1.0 | Règles hooks |
| eslint-plugin-react-refresh | ^0.4.11 | HMR React |

---

## 9. Accessibilité (a11y)

| Élément | Attributs/Labels |
|---|---|
| Sidebar | `aria-label="Navigation des documents"` |
| Recherche | `role="search"` + `aria-label` sur l'input |
| Arborescence | `role="tree"` + `role="treeitem"` + `aria-expanded` + `aria-current="page"` |
| Onglets | `role="tablist"` + `role="tab"` + `aria-selected` + `role="tabpanel"` + `aria-labelledby` |
| Notifications | `aria-live="polite"` + `role="alert"` |
| Focus visible | `:focus-visible` avec outline violet |
| Navigation clavier | `Ctrl+S` pour sauvegarder, Tab ordre logique |
| Contraste | Ratios respectés : `#fafafa` sur `#08080a` (> 15:1), `#a78bfa` sur `#08080a` (~ 7:1) |
| HTML sémantique | `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>` |

---

## 10. Cycle de vie d'une session

```
1.  Utilisateur ouvre l'URL
2.  Vite sert index.html → src/main.jsx → App.jsx
3.  App.fetchIndex() : GET /data.json → state.data
4.  WelcomeScreen s'affiche (cards, stats, récents)
5.  Barre de navigation contextuelle affiche "Salle sur Demande"
6 ─────────────────────────────────────────────────
│  Utilisateur :
│  - Tape dans la recherche → filtrage temps réel
│  - Clique sur une catégorie → déplie le dossier dans la sidebar
│  - Clique sur un fichier → DocViewer charge et affiche
│  - Édite → tabs → sauvegarde (POST /api/save) → toast succès
│  - Crée un fichier → formulaire inline → POST → index refresh
│  - Ouvre un PDF → iframe + boutons Ouvrir/Télécharger
└─────────────────────────────────────────────────
7.  Sur mobile : sidebar en overlay cachée, hamburger pour ouvrir
```

---

## 11. Architecture des dossiers de contenu

```
public/docs/
├── cybersec/
│   ├── Dec_8_Hashcat.md
│   ├── Intro_Evil_Twin_Charles.md
│   ├── Rapport de résolution DNS.md
│   ├── reolution_du_probleme_de_stockage_metasploitable_VM.md
│   └── reparation_des_permissions_compaudit.md
│
├── utilitaires/
│   ├── RST_Sur_Linux.md
│   ├── WIfiCampusFix.md
│   ├── nettoyage_optimisation_chrome.md
│   ├── serveur_lm_studio.md
│   ├── abasi_reza_thesis.pdf
│   ├── Art of Google Dorking - Meetup Resources.pdf
│   ├── Cours-IA-Inforjeunes-V3.pdf
│   ├── GoogleDorking.pdf
│   ├── Keylogger_Coursera.pdf
│   └── Recommendations_Portfolio.pdf
│
└── notes/
    ├── Test_Creation.md
    └── yt-dlp_Memo.md
```

**Total :** 13 documents (7 Markdown, 6 PDF)

---

## 12. Extensions possibles (non implémentées)

- **Authentification** : middleware Express + login JWT
- **Recherche full-text** : indexation du contenu MD côté serveur
- **Mode sombre/clair** : toggle via un state + `data-theme` attribute
- **Export PDF** : génération via Puppeteer ou `react-pdf`
- **Versioning** : stockage des backups ou intégration Git
- **Déploiement** : Render / Vercel / Netlify (build command : `npm install && npm run build`)
- **Tests** : Vitest pour les composants, Supertest pour l'API
- **CI/CD** : GitHub Actions → lint + build + deploy
- **Mode hors-ligne** : Service Worker + cache des documents récents
