  📶 Pourquoi mon Wi-Fi Linux galère au campus (et comment le fixer)

  Si ton Wi-Fi fonctionne sur Windows mais te rejette sur Linux ("Connection interrupted" ou "Activation failed"), ce n'est pas ton matériel qui est en cause, c'est la
  configuration par défaut de Linux qui est trop "prudente" pour les réseaux de campus.


  🧐 Les 4 Causes du Problème (Hypothèses)


   1. La Gestion de l'Énergie (Power Management) : Par défaut, Linux essaie d'économiser la batterie en mettant la carte Wi-Fi en veille par intermittence. Les bornes
      du campus (souvent du Cisco ou Aruba) détestent ça : elles voient une micro-coupure et bannissent l'appareil instantanément.
   2. Le Conflit DHCP (Le Cache corrompu) : C'est souvent le "tueur silencieux". Ton PC garde en mémoire une ancienne adresse IP (un "lease") qui ne correspond plus à
      ce que le routeur veut te donner. Résultat : le routeur refuse la connexion.
   3. L'instabilité du Pilote Intel (iwlwifi) : Les cartes Intel (très communes) utilisent des fonctions modernes (comme l'agrégation de paquets 802.11n) qui buggent
      parfois sur les vieux équipements réseau des universités.
   4. Le Timeout IPv6 : Linux attend souvent une réponse IPv6. Si le réseau du campus ne gère que l'IPv4, Linux peut rester bloqué 30 secondes avant de planter, alors
      que Windows passe directement à l'IPv4.

  ---

  🛠 La Solution en 4 Étapes


  Étape 1 : Muscler le Pilote Intel (iwlwifi)
  On va forcer la carte Wi-Fi à rester éveillée et à désactiver les fonctions instables.


   1 # Crée un fichier de configuration pour le pilote
   2 echo "options iwlwifi 11n_disable=8 power_save=0 d0i3_disable=1 uapsd_disable=1" | sudo tee /etc/modprobe.d/iwlwifi.conf
   3
   4 # Recharge le pilote pour appliquer les changements
   5 sudo modprobe -r iwlmvm iwlwifi
   6 sudo modprobe iwlwifi
   * 11n_disable=8 : Désactive l'agrégation de paquets (stabilité ++).
   * power_save=0 : Désactive l'économie d'énergie au niveau du pilote.

  Étape 2 : Désactiver l'économie d'énergie (NetworkManager)
  On s'assure que NetworkManager ne demande jamais à la carte de dormir.


   1 # Crée une règle globale pour interdire le Power Save
   2 echo -e "[connection]\nwifi.powersave = 2\n\n[device]\nwifi.scan-rand-mac-address=no" | sudo tee /etc/NetworkManager/conf.d/disable-powersave.conf
   3
   4 # Applique le changement manuellement pour l'interface active
   5 sudo iw dev wlan0 set power_save off


  Étape 3 : Nettoyer le cache DHCP (L'étape "Magique")
  C'est ce qui règle le problème quand on est "rejeté" dès la connexion. On efface la mémoire des anciennes sessions.


   1 # Supprime les anciens baux (leases) DHCP
   2 sudo rm -rf /var/lib/NetworkManager/*.lease
   3
   4 # Réinitialise l'interface
   5 sudo ip link set wlan0 down
   6 sudo ip link set wlan0 up

  Étape 4 : Forcer l'IPv4 (Optionnel mais recommandé)
  Si ça galère encore, force ta connexion à ignorer l'IPv6.


   1 # Remplace "NOM_DU_WIFI" par le nom du réseau du campus
   2 nmcli connection modify "NOM_DU_WIFI" ipv6.method "ignore"
   3 sudo systemctl restart NetworkManager

  ---


