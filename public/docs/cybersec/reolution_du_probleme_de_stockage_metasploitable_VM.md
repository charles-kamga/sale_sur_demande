# RETEX : Dépannage de Boot d'une VM "Legacy" (Metasploitable 2)

### 1. Le Symptôme (Ce qu'on a vu)
Lors du démarrage de la VM, le système s'arrêtait brutalement sur un écran noir (Shell BusyBox/Initramfs) avec l'erreur critique :
`ALERT! /dev/mapper/metasploitable-root does not exist.`

**Traduction :** Le noyau Linux a bien démarré, mais au moment de monter le système de fichiers principal (le disque dur), il ne l'a pas trouvé. Pour lui, aucun disque n'était branché.

### 2. La Cause Technique (Le "Pourquoi")
Le problème réside dans la différence d'époque entre l'hyperviseur (KVM 2024) et le système invité (Metasploitable/Ubuntu 2008).

* **KVM et la Paravirtualisation (VirtIO) :** Par défaut, KVM crée des disques virtuels utilisant l'interface **VirtIO**. C'est une technologie moderne qui permet à la VM de "savoir" qu'elle est virtualisée pour accéder au disque très rapidement, sans émuler un vieux matériel physique.

* **Le Noyau Legacy :** Metasploitable tourne sur un très vieux noyau Linux (2.6.x). À cette époque, les pilotes (drivers) pour **VirtIO** n'étaient pas inclus par défaut dans le système.

* **Le Résultat :** KVM présentait un disque en langage "VirtIO", mais Metasploitable était sourd à ce langage. Il cherchait un disque physique classique et ne trouvait rien -> **Kernel Panic**.

### 3. La Solution (Le "Comment")
Nous avons reconfiguré le contrôleur de disque virtuel dans les paramètres de l'hyperviseur (virt-manager).

* **Action :** Changement du "Bus Type" de **VirtIO** vers **SATA**.

* **Explication :** Le standard SATA (AHCI) existait déjà en 2008 et est parfaitement géré par le vieux noyau Linux.

* **Résultat :** KVM a cessé d'essayer de "parler moderne" et a émulé un contrôleur disque SATA standard. Le noyau a immédiatement reconnu le périphérique (probablement en /dev/sda), a monté la partition racine, et le système a démarré.

---

### Analogie pour les non-techniciens (Le "Bonus")
"C'est comme essayer de brancher une clé USB-C sur un ordinateur de 1998. L'ordinateur fonctionne, la clé fonctionne, mais ils ne peuvent pas communiquer car l'interface est trop moderne pour le vieux système. Nous avons simplement utilisé un adaptateur (SATA) que le vieux système est capable de comprendre."
