# Guide : Passer de RST à AHCI pour Dual-Boot Linux (sans réinstaller Windows)

Ce guide explique comment corriger l'erreur **"RST (Intel Rapid Storage Technology)"** lors de l'installation d'Ubuntu, tout en évitant que Windows ne plante (écran bleu) après le changement de réglage dans le BIOS.

## ⚠️ AVERTISSEMENT PRÉALABLE : BitLocker
Si le disque est chiffré avec **BitLocker** (très courant sur les PC récents) :
1. Cherchez la clé de récupération (48 chiffres) sur le [compte Microsoft de l'utilisateur](https://account.microsoft.com/devices/recoverykey).
2. **OU** désactivez BitLocker dans Windows (*Paramètres > Confidentialité et sécurité > Chiffrement de l'appareil*) avant de commencer. 
3. **Si vous ne le faites pas, Windows pourrait se bloquer définitivement.**

---

## ÉTAPE 1 : Préparer Windows au changement
*Cette étape doit être faite pendant que le BIOS est encore réglé sur **RST/RAID**.*

1. Démarrez normalement sous **Windows**.
2. Cliquez sur le menu **Démarrer**, tapez `cmd`.
3. Sur "Invite de commandes", faites un **clic droit** et choisissez **"Exécuter en tant qu'administrateur"**.
4. Dans la fenêtre noire, tapez exactement la commande suivante et appuyez sur Entrée :
   ```cmd
   bcdedit /set {current} safeboot minimal
   ```
   *Note : Si vous recevez une erreur, vérifiez que vous avez bien lancé l'invite en mode administrateur.*

5. Redémarrez l'ordinateur.

---

## ÉTAPE 2 : Basculer de RST vers AHCI dans le BIOS

1. Dès le redémarrage, tapotez la touche pour entrer dans le **BIOS** (souvent `F2`, `F12`, `Suppr` ou `Echap` selon la marque).
2. Cherchez l'onglet **Storage**, **SATA Configuration** ou **Advanced**.
3. Localisez l'option **SATA Mode** ou **Configure SATA as**.
4. Changez la valeur de `Intel RST Premium / RAID` vers **`AHCI`**.
5. **Sauvegardez et quittez** (généralement la touche `F10`).

---

## ÉTAPE 3 : Laisser Windows installer le pilote AHCI

1. L'ordinateur redémarre. Puisque nous avons tapé la commande à l'étape 1, Windows va démarrer en **Mode sans échec**.
2. Connectez-vous à la session. 
3. Windows va détecter automatiquement le changement de matériel et charger le pilote AHCI nécessaire.
4. Ouvrez à nouveau l'**Invite de commandes (Administrateur)**.
5. Tapez la commande suivante pour annuler le démarrage forcé en mode sans échec :
   ```cmd
   bcdedit /deletevalue {current} safeboot
   ```
6. Redémarrez l'ordinateur normalement.

---

## ÉTAPE 4 : Créer l'espace pour Ubuntu (Partitionnement)

Avant de lancer Linux, créez l'espace vide depuis Windows (c'est plus sûr) :

1. Faites un clic droit sur le bouton **Démarrer** et choisissez **Gestion des disques**.
2. Localisez votre partition principale (généralement le disque `C:`).
3. Faites un clic droit dessus et choisissez **Réduire le volume**.
4. Saisissez la quantité d'espace à libérer pour Linux (ex: `50000` pour environ 50 Go).
5. Cliquez sur **Réduire**. Vous verrez une zone noire marquée **"Non allouée"**. Ne créez pas de nouveau volume dessus, laissez-le tel quel.

---

## ÉTAPE 5 : Installation d'Ubuntu avec Ventoy

1. Branchez votre clé **Ventoy** avec l'ISO d'Ubuntu.
2. Démarrez sur la clé (via le menu de boot, souvent `F12` ou `F11`).
3. Lancez l'installation d'Ubuntu.
4. **L'erreur RST ne devrait plus apparaître.**
5. Au moment du partitionnement :
   * **Option facile :** Choisissez "Installer Ubuntu à côté de Windows Boot Manager". L'installeur utilisera l'espace vide créé à l'étape 4.
   * **Option avancée :** Choisissez "Autre chose" pour sélectionner manuellement l'espace non alloué.

---

## Résumé des commandes utiles
| Action                     | Commande (CMD Admin)                      |
| :------------------------- | :---------------------------------------- |
| **Forcer Mode sans échec** | `bcdedit /set {current} safeboot minimal` |
| **Retour au mode normal**  | `bcdedit /deletevalue {current} safeboot` |

**Pourquoi cette méthode fonctionne ?**
En forçant le mode sans échec, on oblige Windows à charger un set de pilotes de base au démarrage suivant. Lorsque vous changez le BIOS entre les deux, Windows ne "panique" pas : il voit le nouveau contrôleur AHCI, installe le bon pilote générique, et met à jour sa propre configuration de démarrage.