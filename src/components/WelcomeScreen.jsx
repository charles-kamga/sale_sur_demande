import { Shield, FileText, Folder, File, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORY_META = {
  cybersec: {
    label: 'Cybersécurité',
    icon: Shield,
    color: 'cybersec',
    desc: 'Notes sur le pentesting, hashcat, evil twin, DNS et audits',
  },
  utilitaires: {
    label: 'Utilitaires',
    icon: Folder,
    color: 'utilitaires',
    desc: 'Scripts, configurations, PDFs et mémos pratiques',
  },
  notes: {
    label: 'Notes',
    icon: FileText,
    color: 'notes',
    desc: 'Mémos divers et références rapides',
  },
};

export default function WelcomeScreen({ data, onSelect, onCategorySelect }) {
  // Compter les fichiers par catégorie
  const countFiles = (items) =>
    items.reduce((acc, item) => {
      if (item.type === 'directory') return acc + countFiles(item.children);
      return acc + 1;
    }, 0);

  const totalDocs = countFiles(data);

  // Extraire les fichiers récents (triés par mtime, top 5)
  const flattenFiles = (items) => {
    const files = [];
    for (const item of items) {
      if (item.type === 'directory') files.push(...flattenFiles(item.children));
      else files.push(item);
    }
    return files;
  };

  const recentFiles = flattenFiles(data)
    .sort((a, b) => new Date(b.mtime) - new Date(a.mtime))
    .slice(0, 5);

  // Trouver les dossiers racine pour les cartes
  const rootDirs = data.filter((d) => d.type === 'directory');

  const handleCardClick = (dirName) => {
    if (onCategorySelect) onCategorySelect(dirName);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="welcome-screen">
      <section className="welcome-hero">
        <Shield size={48} className="welcome-icon" />
        <h1>Salle sur Demande</h1>
        <p>Votre base de connaissances technique — exploration, notes et références</p>
      </section>

      <div className="stats-bar" aria-label="Statistiques">
        <div className="stat-item">
          <span className="stat-value">{totalDocs}</span>
          <span className="stat-label">Documents</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{rootDirs.length}</span>
          <span className="stat-label">Catégories</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{data.filter((d) => d.extension === '.pdf').length}</span>
          <span className="stat-label">PDFs</span>
        </div>
      </div>

      <motion.div
        className="categories-grid"
        variants={container}
        initial="hidden"
        animate="show"
        role="list"
        aria-label="Catégories de documents"
      >
        {rootDirs.map((dir) => {
          const meta = CATEGORY_META[dir.name] || {
            label: dir.name,
            icon: Folder,
            color: 'notes',
            desc: 'Documents divers',
          };
          const Icon = meta.icon;
          const count = countFiles(dir.children);

          return (
            <motion.div
              key={dir.name}
              variants={itemAnim}
              role="listitem"
            >
              <button
                className="category-card"
                onClick={() => handleCardClick(dir.name)}
                aria-label={`Catégorie ${meta.label} — ${count} document${count > 1 ? 's' : ''}`}
              >
                <div className="category-card-header">
                  <div className={`card-icon ${meta.color}`}>
                    <Icon size={20} />
                  </div>
                  <h3>{meta.label}</h3>
                </div>
                <p>{meta.desc}</p>
                <span className="file-count">
                  <File size={12} />
                  {count} fichier{count > 1 ? 's' : ''}
                </span>
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      {recentFiles.length > 0 && (
        <section className="recent-section" aria-label="Documents récents">
          <h2 className="section-title">Récents</h2>
          <div className="recent-list" role="list">
            {recentFiles.map((file) => {
              const parentDir = data.find(
                (d) => d.type === 'directory' && file.path.startsWith(d.path + '/')
              );
              const badge = parentDir
                ? CATEGORY_META[parentDir.name]?.label || parentDir.name
                : '';

              return (
                <button
                  key={file.path}
                  className="recent-item"
                  onClick={() => onSelect(file)}
                  role="listitem"
                  aria-label={`Ouvrir ${file.name}`}
                >
                  <FileText size={14} className="recent-icon" />
                  <span>{file.name}</span>
                  {badge && <span className="recent-badge">{badge}</span>}
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
