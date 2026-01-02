import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_DIR = path.resolve(__dirname, '../../Utilitaires');
const PUBLIC_DOCS_DIR = path.resolve(__dirname, '../public/docs');
const OUTPUT_FILE = path.join(__dirname, '../public/data.json');

// Dossiers à exclure strictement (sécurité)
const EXCLUDED_DIRS = ['Codes_De_Recuperation', 'Mongo_User_informations', '.git', 'node_modules'];

// Nettoyage PREVENTIF : On ne supprime que les liens symboliques existants
// On ne touche PAS aux fichiers réels que l'utilisateur aurait pu déposer par erreur
function cleanSymlinks(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir);

    for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        try {
            const stat = fs.lstatSync(fullPath);
            if (stat.isSymbolicLink()) {
                fs.unlinkSync(fullPath); // Supprime le lien
            } else if (stat.isDirectory()) {
                cleanSymlinks(fullPath); // Récursion
            }
        } catch (e) {
            // Ignorer erreurs d'accès
        }
    }
}
cleanSymlinks(PUBLIC_DOCS_DIR);
if (!fs.existsSync(PUBLIC_DOCS_DIR)) fs.mkdirSync(PUBLIC_DOCS_DIR, { recursive: true });

function scanDirectory(dir, relativePath = '') {
    let results = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        // Ignorer les fichiers cachés et les exclus
        if (file.startsWith('.') || EXCLUDED_DIRS.includes(file)) continue;

        const fullPath = path.join(dir, file);
        const relPath = path.join(relativePath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            const children = scanDirectory(fullPath, relPath);
            if (children.length > 0) {
                // Créer le sous-dossier dans public/docs
                const publicSubDir = path.join(PUBLIC_DOCS_DIR, relPath);
                if (!fs.existsSync(publicSubDir)) fs.mkdirSync(publicSubDir, { recursive: true });

                results.push({
                    name: file,
                    type: 'directory',
                    path: relPath,
                    children: children
                });
            }
        } else {
            // Uniquement les fichiers Markdown .md
            if (path.extname(file).toLowerCase() === '.md') {
                // Créer un lien symbolique individuel dans public/docs
                const publicFilePath = path.join(PUBLIC_DOCS_DIR, relPath);
                if (fs.existsSync(publicFilePath)) fs.unlinkSync(publicFilePath);
                fs.symlinkSync(fullPath, publicFilePath);

                results.push({
                    name: file,
                    type: 'file',
                    extension: '.md',
                    path: relPath,
                    size: stat.size,
                    mtime: stat.mtime
                });
            }
        }
    }

    // Trier : dossiers d'abord, puis fichiers par nom
    return results.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'directory' ? -1 : 1;
    });
}

console.log('--- 🛡️ DÉBUT INDEXATION SÉCURISÉE ---');
console.log(`Scan de : ${TARGET_DIR}`);

try {
    const data = scanDirectory(TARGET_DIR);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
    console.log(`✅ Index généré avec succès dans : ${OUTPUT_FILE}`);
    console.log(`Fichiers trouvés : ${JSON.stringify(data, null, 2).split('.md').length - 1} documents.`);
} catch (error) {
    console.error('❌ Erreur lors de l\'indexation :', error);
}
