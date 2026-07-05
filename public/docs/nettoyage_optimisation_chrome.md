# Guide d'Optimisation et Nettoyage de Google Chrome (Linux)

Ce document détaille la procédure pour limiter l'empreinte disque de Google Chrome, en particulier concernant les modèles d'IA volumineux téléchargés automatiquement.

## 1. Le Problème : Dossier `OptGuideOnDeviceModel`

Google Chrome télécharge automatiquement des modèles d'IA locale (pour des fonctions comme "Help me write" ou la recherche intelligente dans l'historique). Ces modèles sont stockés dans :
`~/.config/google-chrome/OptGuideOnDeviceModel`

**Impact :** Ce dossier peut rapidement occuper entre **4 Go et 6 Go** d'espace disque, même si vous n'utilisez pas ces fonctionnalités.

## 2. La Solution : Blocage Définitif

Pour empêcher Chrome de retélécharger ces modèles après une suppression, la méthode la plus efficace consiste à remplacer le dossier par un **fichier vide** du même nom. Chrome ne pourra pas écraser ce fichier par un répertoire.

### Procédure de mise en œuvre :
```bash
# 1. Supprimer le dossier existant (s'il existe)
rm -rf ~/.config/google-chrome/OptGuideOnDeviceModel

# 2. Créer un fichier vide avec le même nom pour verrouiller l'emplacement
touch ~/.config/google-chrome/OptGuideOnDeviceModel
```

## 3. Maintenance du Cache

Le cache de navigation peut également devenir très volumineux (plusieurs Go).

### Nettoyage manuel du cache :
```bash
# Supprime tous les fichiers temporaires de Chrome sans toucher à vos profils/mots de passe
rm -rf ~/.cache/google-chrome/*
```

## 4. Recommandations Supplémentaires (Interface)

Pour une approche complète, désactivez les options d'IA expérimentale directement dans le navigateur :
1. Accédez à `chrome://settings/ai`
2. Désactivez les options telles que :
   - **Recherche dans l'historique par IA**
   - **Organisateur d'onglets**
   - **Aide à l'écriture**

---
*Document généré le 21 avril 2026 suite au nettoyage du système.*
