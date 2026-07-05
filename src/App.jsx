import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';
import Sidebar from './components/Sidebar';
import FileTree from './components/FileTree';
import DocViewer from './components/DocViewer';
import WelcomeScreen from './components/WelcomeScreen';
import Toast, { useToast } from './components/Toast';
import './App.css';

export default function App() {
  const [data, setData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [expandedDirs, setExpandedDirs] = useState({});

  const { notifications, addToast, removeToast } = useToast();

  // ── Chargement de l'index ──
  const fetchIndex = () => {
    setLoading(true);
    fetch('/data.json')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        // Déplier toutes les catégories par défaut
        const dirs = {};
        const initDirs = (items) => {
          items.forEach((item) => {
            if (item.type === 'directory') {
              dirs[item.path] = true;
              initDirs(item.children);
            }
          });
        };
        initDirs(json);
        setExpandedDirs(dirs);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erreur chargement index:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchIndex();
  }, []);

  // ── Chargement du fichier sélectionné ──
  useEffect(() => {
    if (!selectedFile) return;
    fetch(`/docs/${selectedFile.path}`)
      .then((res) => res.text())
      .then((text) => setFileContent(text))
      .catch(() => {
        setFileContent('## Erreur\nImpossible de charger le fichier.');
        addToast('Impossible de charger le fichier', 'error');
      });
  }, [selectedFile]);

  // ── Sauvegarde ──
  const handleSave = async (content) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: selectedFile.path, content }),
      });
      if (res.ok) {
        setFileContent(content);
        addToast('Document sauvegardé ✓', 'success');
      } else {
        addToast('Erreur lors de la sauvegarde', 'error');
      }
    } catch {
      addToast('Erreur réseau', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Création fichier ──
  const handleCreateFile = async (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    let fileName = newFileName.trim();
    if (!fileName.endsWith('.md')) fileName += '.md';

    // Validation caractères interdits
    if (/[<>:"/\\|?*]/.test(fileName)) {
      addToast('Caractères interdits dans le nom', 'error');
      return;
    }

    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: fileName,
          content: `# ${fileName.replace('.md', '')}\n\nCommencez à écrire ici…`,
        }),
      });
      if (res.ok) {
        setNewFileName('');
        setIsCreatingNew(false);
        fetchIndex();
        setSelectedFile({ name: fileName, path: fileName, type: 'file', extension: '.md' });
        addToast(`Fichier "${fileName}" créé ✓`, 'success');
      } else {
        addToast('Erreur lors de la création', 'error');
      }
    } catch {
      addToast('Erreur réseau', 'error');
    }
  };

  // ── Accordéon : toggle dossier ──
  const handleToggleDir = (path) => {
    setExpandedDirs((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  // ── Navigation ──
  const handleSelectFile = (file) => {
    setSelectedFile(file);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const handleGoHome = () => {
    setSelectedFile(null);
    setFileContent('');
  };

  // ── Recherche filtrée ──
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    const term = searchTerm.toLowerCase();
    const filterItems = (items) => {
      const result = [];
      for (const item of items) {
        if (item.type === 'directory') {
          const children = filterItems(item.children);
          if (children.length > 0) result.push({ ...item, children });
        } else if (item.name.toLowerCase().includes(term)) {
          result.push(item);
        }
      }
      return result;
    };
    return filterItems(data);
  }, [data, searchTerm]);

  // ── Stats ──
  const docCount = useMemo(() => {
    const countFiles = (items) =>
      items.reduce((acc, item) => {
        if (item.type === 'directory') return acc + countFiles(item.children);
        return acc + 1;
      }, 0);
    return countFiles(data);
  }, [data]);

  return (
    <div className="app-container">
      {/* Mobile menu button */}
      {!isSidebarOpen && (
        <button className="menu-toggle" onClick={() => setSidebarOpen(true)} aria-label="Ouvrir la navigation">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setSidebarOpen(!isSidebarOpen)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isCreatingNew={isCreatingNew}
        onStartCreate={() => setIsCreatingNew(true)}
        onCreateFile={handleCreateFile}
        newFileName={newFileName}
        onNewFileNameChange={setNewFileName}
        onCancelCreate={() => { setIsCreatingNew(false); setNewFileName(''); }}
      >
        {loading ? (
          <p className="loading">Chargement…</p>
        ) : (
          <FileTree
            items={filteredData}
            selectedFile={selectedFile}
            onSelect={handleSelectFile}
            expandedDirs={expandedDirs}
            onToggleDir={handleToggleDir}
          />
        )}
      </Sidebar>

      <main className="main-content" id="main-content" role="main">
        {/* Navbar contextuelle */}
        <div className="context-bar" role="navigation" aria-label="Barre de navigation">
          <button className="context-home" onClick={handleGoHome} aria-label="Accueil">
            <Shield size={18} className="context-icon" />
            <span>Salle sur Demande</span>
          </button>
          {selectedFile && (
            <span className="context-path">{selectedFile.path}</span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {selectedFile ? (
            <DocViewer
              key={selectedFile.path}
              selectedFile={selectedFile}
              fileContent={fileContent}
              onSave={handleSave}
              isSaving={isSaving}
            />
          ) : (
            <WelcomeScreen
              key="welcome"
              data={data}
              onSelect={handleSelectFile}
              onCategorySelect={handleToggleDir}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Toast notifications */}
      <Toast notifications={notifications} removeToast={removeToast} />
    </div>
  );
}
