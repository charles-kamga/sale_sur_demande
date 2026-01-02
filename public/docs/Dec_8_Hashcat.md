C'est noté. Voici la **documentation technique complète et chronologique**. Elle inclut toutes les commandes exactes que nous avons utilisées, les erreurs, et les ajustements.

Tu peux copier ceci intégralement dans ton fichier `Recap_Hashcat_Kenza.txt`.

---

# 📂 BILAN D'INTERVENTION : CRACKING WPA2 (HASHCAT)
**Cible :** SSID "KENZA HOME"
**Type d'attaque :** Attaque par Dictionnaire Hybride (Masque)
**Outil principal :** Hashcat v6.x+
**OS :** Kali Linux (Virtualisé)

---

## 1. PHASE DE PRÉPARATION (L'Intelligence)

Avant de lancer les attaques, nous avons préparé le terrain suite à l'échec de *Rockyou.txt*.

### A. Création du dictionnaire personnalisé
Nous avons créé une "Seed List" (liste de graines) basée sur l'OSINT (noms de famille, nom du wifi, ancien mot de passe connu `789Kenzahome`).

*   **Commande :**
    ```bash
    nano /home/charles/Documents/Work/Attk/kenza_base.txt
    ```
*   **Contenu du fichier :**
    ```text
    kenza
    Kenzahome
    KenzaHome
    KENZAHOME
    kenza_home
    home
    Meubles
    789Kenzahome
    ```

### B. Conversion du Handshake
Hashcat ne supporte pas le format `.cap` d'Aircrack. Nous l'avons converti en format **Hascat 22000** (PMKID/EAPOL).
*   *Méthode :* Via convertisseur en ligne (ou `hcxpcapngtool`).
*   *Fichier obtenu :* `kenza.hc22000`

---

## 2. PHASE D'ATTAQUE (Chronologie des essais)

Voici les commandes exactes lancées dans le terminal, avec les erreurs et corrections.

### 🧪 Tentative 1 : Attaque par Mutation (Règles)
*   **Objectif :** Laisser Hashcat inventer des variantes complexes (leet speak, inversions) à partir de notre petite liste.
*   **Commande utilisée :**
    ```bash
    hashcat -m 22000 /home/charles/Documents/Work/Attk/kenza.hc22000 /home/charles/Documents/Work/Attk/kenza_base.txt -r /usr/share/hashcat/rules/dive.rule
    ```
*   **Problème rencontré (Warning) :**
    `The wordlist or mask that you are using is too small...`
    *   *Analyse :* Hashcat nous avertit qu'il tourne en sous-régime car il y a peu de mots. **Solution :** On ignore, ce n'est pas bloquant.
*   **Résultat :** `Status: Exhausted` (Épuisé/Échec).
    *   *Analyse :* Le mot de passe n'était pas une variante "bizarre" (type `K3nz@`). Il était plus structuré.

### 🧪 Tentative 2 : Attaque Hybride (3 Chiffres au début)
*   **Objectif :** Tester la structure de l'ancien mot de passe (`789` + `Mot`). On utilise un **Masque** de 3 chiffres (`?d?d?d`) collé devant (`-a 7`).
*   **Commande utilisée :**
    ```bash
    hashcat -m 22000 -a 7 /home/charles/Documents/Work/Attk/kenza.hc22000 "?d?d?d" /home/charles/Documents/Work/Attk/kenza_base.txt
    ```
*   **Détails techniques :**
    *   `-a 7` : Mode Hybride (Masque à gauche, Mot du dico à droite).
    *   `?d?d?d` : Teste de `000` à `999`.
*   **Résultat :** `Status: Exhausted` (Échec).
    *   *Analyse :* L'oncle n'a pas gardé la logique "3 chiffres".

### ✅ Tentative 3 : Attaque Hybride (4 Chiffres au début) - SUCCÈS
*   **Objectif :** Tester l'hypothèse d'une **Année** (2024, 2025, etc.). Une année contient 4 chiffres, donc on ajoute un `?d` au masque.
*   **Commande utilisée :**
    ```bash
    hashcat -m 22000 -a 7 /home/charles/Documents/Work/Attk/kenza.hc22000 "?d?d?d?d" /home/charles/Documents/Work/Attk/kenza_base.txt
    ```
*   **Résultat :**
    `Status...........: Cracked`
    `Recovered........: 1/1 (100.00%)`

---

## 3. PHASE FINALE (Extraction)

Une fois cracké, Hashcat n'affiche pas toujours le mot de passe clair immédiatement à l'écran, il le sauvegarde. Pour le relire :

*   **Commande utilisée :**
    ```bash
    hashcat -m 22000 -a 7 /home/charles/Documents/Work/Attk/kenza.hc22000 "?d?d?d?d" /home/charles/Documents/Work/Attk/kenza_base.txt --show
    ```
*   **Output (Sortie) :**
    `[Hash_Bizarre]:2035Kenzahome`

**Mot de passe final :** `2035Kenzahome`

---

## 4. LEXIQUE DES FLAGS (Options de commande)

*Pour ne pas oublier à quoi sert chaque petit bout de texte.*

| Option | Signification | Contexte d'utilisation |
| :--- | :--- | :--- |
| **-m 22000** | **Module** : WPA-PBKDF2-PMKID+EAPOL | Indispensable pour cracker du Wi-Fi moderne. |
| **-a 0** | **Attaque** : Straight (Directe) | Dictionnaire simple (comme rockyou). |
| **-a 6** | **Attaque** : Hybride (Dico + Masque) | Pour tester `Mot123` (Chiffres à la fin). |
| **-a 7** | **Attaque** : Hybride (Masque + Dico) | Pour tester `123Mot` (Chiffres au début). |
| **-r [fichier]** | **Rules** (Règles) | Pour appliquer des mutations (best64.rule, dive.rule). |
| **?d** | **Digit** (Chiffre) | Représente `0123456789`. |
| **--show** | **Montrer** | Affiche les mots de passe déjà trouvés dans le "pot". |

---
