# 📝 Mémo : Télécharger des vidéos avec yt-dlp sur Kali Linux

## 1. Théorie : Pourquoi pas wget ?
Sur les sites de streaming modernes (YouTube, Udemy, etc.), les vidéos ne sont pas stockées en un seul fichier.
*   **Wget/Curl** : Téléchargent uniquement le code HTML de la page.
*   **Streaming (DASH/HLS)** : La vidéo est découpée en milliers de petits morceaux, souvent avec l'audio et la vidéo séparés.
*   **yt-dlp** : C'est un outil en ligne de commande (CLI) qui gère ces flux, télécharge les morceaux, et utilise `ffmpeg` pour recoller l'audio et la vidéo dans un fichier final propre.

## 2. Prérequis
Il faut installer le logiciel principal et le convertisseur (pour fusionner audio/vidéo).

```bash
sudo apt update
sudo apt install yt-dlp ffmpeg
```

## 3. Les Commandes

### A. Télécharger une vidéo simple
Le plus basique. Télécharge la meilleure qualité disponible (souvent en .webm).
```bash
yt-dlp "LIEN_VIDEO"
```

### B. Télécharger une Playlist complète (Format MP4) ⭐️
C'est la commande "Couteau Suisse" pour récupérer des cours entiers.

**La commande :**
```bash
yt-dlp -f 'bestvideo+bestaudio' --merge-output-format mp4 -o "%(playlist_index)s - %(title)s.%(ext)s" "LIEN_PLAYLIST"
```

**Explication des options :**
*   `-f 'bestvideo+bestaudio'` : Force le téléchargement de la meilleure piste vidéo et de la meilleure piste audio séparément.
*   `--merge-output-format mp4` : Demande à `ffmpeg` de fusionner le tout en **.mp4** à la fin (évite le format .webm).
*   `-o "..."` : Modèle de nommage du fichier.
    *   `%(playlist_index)s` : Numérote les fichiers (01, 02, 03...). Indispensable pour garder l'ordre des cours.
    *   `%(title)s` : Le titre de la vidéo.
    *   `%(ext)s` : L'extension finale.

### C. Télécharger depuis une liste de liens (Batch)
Si on a plusieurs vidéos éparpillées (pas dans une playlist), on met les liens dans un fichier `liste.txt`.

```bash
yt-dlp -a liste.txt
```

## 4. Résultats attendus

Lors de l'exécution, `yt-dlp` va :
1.  Télécharger les informations (API JSON).
2.  Télécharger la vidéo (souvent sans son) -> extension temporaire.
3.  Télécharger l'audio (seul) -> extension temporaire.
4.  **[Merger]** : Fusionner les deux fichiers.
5.  Supprimer les fichiers temporaires.

**Résultat final dans le dossier :**
```text
01 - Introduction Django.mp4
02 - Installation Python.mp4
03 - Création du projet.mp4
...
```

## 5. Astuces utiles
*   **Arrêter le téléchargement** : `Ctrl + C`.
*   **Reprise** : Si on relance la même commande dans le même dossier, `yt-dlp` détecte les vidéos déjà téléchargées et ne télécharge que les manquantes.
*   **Mise à jour** : Si `yt-dlp` bug (YouTube change souvent son code), le mettre à jour : `sudo yt-dlp -U`.
