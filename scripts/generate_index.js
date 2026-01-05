import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The script is in /scripts, so public is ../public
const PUBLIC_DOCS_DIR = path.resolve(__dirname, '../public/docs');
const OUTPUT_FILE = path.resolve(__dirname, '../public/data.json');

// Dossiers à exclure
const EXCLUDED_DIRS = ['node_modules', '.git'];

if (!fs.existsSync(PUBLIC_DOCS_DIR)) {
    fs.mkdirSync(PUBLIC_DOCS_DIR, { recursive: true });
}

function scanDirectory(dir, relativePath = '') {
    let results = [];
    if (!fs.existsSync(dir)) return results;

    const files = fs.readdirSync(dir);

    for (const file of files) {
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
                    path: relPath, // Keep path relative to docs root
                    children: children
                });
            }
        } else {
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

    return results.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'directory' ? -1 : 1;
    });
}

console.log('--- 🛡️ DÉBUT INDEXATION ---');
console.log(`Scan de : ${PUBLIC_DOCS_DIR}`);

try {
    const data = scanDirectory(PUBLIC_DOCS_DIR);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
    console.log(`✅ Index généré avec succès dans : ${OUTPUT_FILE}`);
    console.log(`Fichiers trouvés : ${JSON.stringify(data).split('.md').length - 1} documents.`);
} catch (error) {
    console.error('❌ Erreur lors de l\'indexation :', error);
    process.exit(1);
}
