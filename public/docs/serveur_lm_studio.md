Étape 1 : Préparation de LM Studio
Ouvrez LM Studio sur votre machine Kali.
Chargez votre modèle de code, idéalement Qwen2.5-Coder-7B-Instruct (ou une version plus légère comme le 1.5B-Instruct si vous souhaitez une autocomplétion instantanée sans latence)[4].
Allez dans l'onglet Local Server (l'icône avec les fiches ou prises réseau à gauche)[5].
Assurez-vous que le port est défini sur 1234 (valeur par défaut)[6].
Cliquez sur Start Server[5][7].
Laissez LM Studio tourner en arrière-plan.
Étape 2 : Installation de l'extension Continue dans Windsurf
Ouvrez Windsurf.
Ouvrez le gestionnaire d'extensions en utilisant le raccourci clavier Ctrl + Shift + X (ou cliquez sur l'icône des extensions dans la barre latérale gauche).
Dans la barre de recherche, tapez Continue (développé par Continue Dev, Inc.)[8].
Cliquez sur Install[4].
(Une nouvelle icône représentant le logo de Continue apparaîtra dans votre barre latérale gauche).
Étape 3 : Configuration de Continue sous Kali Linux
Continue utilise un fichier de configuration pour lier ses fonctionnalités (le Chat et l'Autocomplétion) à vos modèles locaux[4][7].
Sur Kali Linux (et les autres systèmes Linux), ce fichier se trouve dans votre répertoire personnel sous le dossier caché ~/.continue/[7][9].
Ouvrez un terminal sur Kali Linux.
Selon la version de l'extension installée, Continue utilise soit un format YAML (config.yaml), soit un format JSON (config.json)[6][10].
Cas A : Si vous avez un fichier config.yaml
Ouvrez-le avec votre éditeur favori (par exemple, nano) :
code
Bash
nano ~/.continue/config.yaml
Remplacez ou adaptez son contenu pour y intégrer LM Studio :
code
Yaml
name: Local LM Studio
version: 1.0.0
schema: v1
models:
  - name: Qwen2.5-Coder 7B (Chat)
    provider: lmstudio
    model: qwen2.5-coder-7b-instruct
    roles:
      - chat
      - edit
      - apply
  - name: Qwen2.5-Coder 7B (Autocomplete)
    provider: lmstudio
    model: qwen2.5-coder-7b-instruct
    roles:
      - autocomplete
Cas B : Si vous avez un fichier config.json
Ouvrez-le :
code
Bash
nano ~/.continue/config.json
Remplacez son contenu par cette structure :
code
JSON
{
  "models": [
    {
      "title": "Qwen2.5-Coder 7B (Chat)",
      "provider": "lmstudio",
      "model": "qwen2.5-coder-7b-instruct"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Qwen2.5-Coder 7B (Autocomplete)",
    "provider": "lmstudio",
    "model": "qwen2.5-coder-7b-instruct"
  }
}
Note : Si le serveur de LM Studio tourne sur la même machine, l'adresse de l'API par défaut (http://localhost:1234/v1) est automatiquement détectée par le fournisseur "lmstudio" de l'extension[6].
Étape 4 : Désactiver l'autocomplétion native de Windsurf (Optionnel mais recommandé)
Pour éviter que l'autocomplétion native de Windsurf (qui requiert internet et vos crédits gratuits) n'entre en conflit visuel avec l'autocomplétion locale de Continue :
Allez dans les paramètres de Windsurf (Ctrl + ,).
Recherchez Codeium ou Windsurf Autocomplete.
Désactivez temporairement l'autocomplétion native pour ne laisser que celle de Continue gérer les suggestions grises à l'écran.
Étape 5 : Test de l'autocomplétion
Ouvrez un fichier de code (par exemple, un script en Python ou en Bash).
Commencez à taper une structure de fonction ou un commentaire explicatif :
code
Python
# Fonction pour scanner les ports ouverts d'une IP cible
def scan_ports(ip):
Marquez une pause d'une fraction de seconde. Vous devriez voir du texte gris clair s'afficher à l'écran (généré par votre Qwen2.5 en local)[11].
Appuyez sur Tab pour accepter la suggestion.
Quelques ajustements pour Kali Linux (Performance)
Modèle d'autocomplétion dédié (FIM) : L'autocomplétion nécessite d'être extrêmement rapide (moins de 200 ms) pour ne pas casser votre rythme d'écriture. Si vous trouvez que le modèle 7B met trop de temps à afficher les suggestions grises, il est fortement conseillé de télécharger un modèle plus petit dédié uniquement à cette tâche dans LM Studio, comme Qwen2.5-Coder-1.5B-Instruct ou DeepSeek-Coder-1.3B[4][10]. Vous pouvez tout à fait garder le modèle 7B pour l'onglet de Chat (pour lui poser des questions complexes) et dédier le 1.5B à l'autocomplétion en arrière-plan[4].
