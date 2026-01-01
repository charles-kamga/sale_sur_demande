import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_DIR = path.join(__dirname, '../../Utilitaires');
const OUTPUT_FILE = path.join(__dirname, '../public/data.json');

// Dossiers à exclure strictement (sécurité)
const EXCLUDED_DIRS = ['Codes_De_Recuperation', 'Mongo_User_informations', '.git', 'node_modules'];

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
