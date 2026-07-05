import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import FileTree from './components/FileTree';
import DocViewer from './components/DocViewer';
import WelcomeScreen from './components/WelcomeScreen';
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
  const [activeCategory, setActiveCategory] = useState(null);

  // ── Chargement de l'index ──
  const fetchIndex = () => {
    setLoading(true);
    fetch('/data.json')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
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
      .catch(() => setFileContent('## Erreur\nImpossible de charger le fichier.'));
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
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch {
      alert('Erreur réseau lors de la sauvegarde');
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
      } else {
        alert('Erreur lors de la création du fichier');
      }
    } catch {
      alert('Erreur réseau');
    }
  };

  // ── Navigation catégorie ──
  const handleCategorySelect = (dirName) => {
    setActiveCategory(dirName);
    // Scroll doucement vers l'explorateur — les fichiers du dossier seront visibles
  };

  const handleSelectFile = (file) => {
    setSelectedFile(file);
    setActiveCategory(null);
    // Fermer la sidebar sur mobile
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
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
          if (children.length > 0) {
            result.push({ ...item, children });
          }
        } else if (item.name.toLowerCase().includes(term)) {
          result.push(item);
        }
      }
      return result;
    };

    return filterItems(data);
  }, [data, searchTerm]);

  // ── Compteur docs ──
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
      {/* Bouton menu mobile */}
      {!isSidebarOpen && (
        <button
          className="menu-toggle"
          onClick={() => setSidebarOpen(true)}
          aria-label="Ouvrir la navigation"
        >
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
        onCancelCreate={() => {
          setIsCreatingNew(false);
          setNewFileName('');
        }}
      >
        {loading ? (
          <p className="loading">Chargement…</p>
        ) : (
          <FileTree
            items={filteredData}
            selectedFile={selectedFile}
            onSelect={handleSelectFile}
          />
        )}
      </Sidebar>

      <main className="main-content" id="main-content" role="main">
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
              onCategorySelect={handleCategorySelect}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
