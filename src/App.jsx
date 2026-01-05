import React, { useState, useEffect } from 'react';
import { Folder, FileText, Search, Menu, X, ChevronRight, Terminal, BookOpen, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';

const App = () => {
    const [data, setData] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Charger l'index au démarrage
    useEffect(() => {
        fetch('/data.json')
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(err => console.error("Erreur chargement index:", err));
    }, []);

    // Charger le contenu d'un fichier Markdown
    useEffect(() => {
        if (selectedFile) {
            // Note: En mode static simple, on fetch le fichier par son chemin relatif
            // Le chemin dans data.json est relatif à 'Utilitaires'
            // Dans le build, il faudra s'assurer que les fichiers sont accessibles
            // Pour le dev local, on va tricher un peu ou demander à l'utilisateur d'exposer les fichiers
            fetch(`/docs/${selectedFile.path}`)
                .then(res => res.text())
                .then(text => setFileContent(text))
                .catch(err => setFileContent("## Erreur\nImpossible de charger le fichier."));
        }
    }, [selectedFile]);

    const renderTree = (items) => {
        return items.map((item, index) => {
            if (item.type === 'directory') {
                return (
                    <div key={item.path} className="tree-item directory">
                        <div className="tree-header">
                            <Folder size={16} className="icon" />
                            <span>{item.name}</span>
                        </div>
                        <div className="tree-children">
                            {renderTree(item.children)}
                        </div>
                    </div>
                );
            }
            return (
                <div
                    key={item.path}
                    className={`tree-item file ${selectedFile?.path === item.path ? 'active' : ''}`}
                    onClick={() => setSelectedFile(item)}
                >
                    <FileText size={16} className="icon" />
                    <span>{item.name}</span>
                </div>
            );
        });
    };

    return (
        <div className="app-container">
            {/* Overlay Mobile */}
            {!isSidebarOpen && <button className="menu-toggle floating" onClick={() => setSidebarOpen(true)}><Menu /></button>}

            <aside className={`sidebar glass ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <Shield className="logo-icon" />
                        <h2>Salle sur Demande</h2>
                    </div>
                    <button className="close-sidebar" onClick={() => setSidebarOpen(false)}><X /></button>
                </div>

                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Rechercher une note..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <nav className="file-explorer">
                    <div className="explorer-title">EXPLORATEUR</div>
                    {loading ? <div className="loading">Initialisation...</div> : renderTree(data)}
                </nav>

                <div className="sidebar-footer">
                    <div className="status-indicator">
                        <div className="dot green"></div>
                        <span>Secure Node Access</span>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <AnimatePresence mode="wait">
                    {selectedFile ? (
                        <motion.div
                            key={selectedFile.path}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="document-viewer glass cyber-border"
                        >
                            <header className="doc-header">
                                <div className="breadcrumb">
                                    <BookOpen size={16} />
                                    <span>{selectedFile.path.replace(/\//g, ' > ')}</span>
                                </div>
                                <h1>{selectedFile.name}</h1>
                            </header>
                            <article className="markdown-body">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{fileContent}</ReactMarkdown>
                            </article>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="welcome-screen"
                        >
                            <Terminal size={64} className="welcome-icon" />
                            <h1>Bienvenue dans votre Salle sur Demande</h1>
                            <p>Sélectionnez un document dans l'explorateur pour commencer vos recherches.</p>
                            <div className="quick-stats">
                                <div className="stat">
                                    <span className="label">Documents</span>
                                    <span className="value">{loading ? '...' : '6'}</span>
                                </div>
                                <div className="stat">
                                    <span className="label">Format</span>
                                    <span className="value">Markdown</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default App;
