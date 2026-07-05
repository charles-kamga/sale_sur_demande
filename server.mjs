import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5000;
const DOCS_DIR = path.resolve(process.env.DOCS_DIR || path.join(__dirname, 'public/docs'));

app.use(cors());
app.use(express.json());

// Charger le contenu d'un fichier spécifié par son chemin relatif
app.use('/api/files', async (req, res) => {
    if (req.method !== 'GET') return res.status(405).send('Méthode non autorisée');

    try {
        const relativePath = decodeURIComponent(req.path.startsWith('/') ? req.path.slice(1) : req.path);
        if (!relativePath) return res.status(400).send('Chemin manquant');

        const filePath = path.join(DOCS_DIR, relativePath);

        // Sécurité : s'assurer que le chemin reste dans DOCS_DIR
        if (!filePath.startsWith(DOCS_DIR)) {
            return res.status(403).send('Accès refusé');
        }

        const content = await fs.readFile(filePath, 'utf-8');
        res.json({ content });
    } catch (error) {
        console.error('Erreur lecture fichier:', error);
        res.status(500).json({ error: 'Impossible de lire le fichier' });
    }
});

// Sauvegarder le contenu d'un fichier
app.post('/api/save', async (req, res) => {
    const { path: relativePath, content } = req.body;

    if (!relativePath || content === undefined) {
        return res.status(400).json({ error: 'Données manquantes' });
    }

    try {
        const filePath = path.join(DOCS_DIR, relativePath);

        // Sécurité : s'assurer que le chemin reste dans DOCS_DIR
        if (!filePath.startsWith(DOCS_DIR)) {
            return res.status(403).send('Accès refusé');
        }

        // Créer les dossiers parents si nécessaire
        await fs.mkdir(path.dirname(filePath), { recursive: true });

        // Écrire le fichier
        await fs.writeFile(filePath, content, 'utf-8');

        console.log(`Fichier sauvegardé : ${relativePath}`);

        // Déclencher la régénération de l'index
        try {
            await execPromise('node scripts/generate_index.js');
            console.log('Index régénéré avec succès');
        } catch (indexError) {
            console.error('Erreur lors de la régénération de l\'index:', indexError);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Erreur sauvegarde fichier:', error);
        res.status(500).json({ error: 'Échec de la sauvegarde' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur API de Salle sur Demande lancé sur http://localhost:${PORT}`);
    console.log(`📁 Répertoire des documents : ${DOCS_DIR}`);
});
