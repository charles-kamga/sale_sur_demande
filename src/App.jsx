import React, { useState, useEffect } from 'react';
import { Folder, FileText, Search, Menu, X, ChevronRight, Terminal, BookOpen, Shield, Edit2, Save, Check, RotateCcw, Plus } from 'lucide-react';
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
    const [isEditing, setIsEditing] = useState(false);
    const [tempContent, setTempContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newFileName, setNewFileName] = useState('');

    const fetchIndex = () => {
        setLoading(true);
        fetch('/data.json')
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur chargement index:", err);
                setLoading(false);
            });
    };

    // Charger l'index au démarrage
    useEffect(() => {
        fetchIndex();
    }, []);

    useEffect(() => {
        if (selectedFile) {
            fetch(`/docs/${selectedFile.path}`)
                .then(res => res.text())
                .then(text => {
                    setFileContent(text);
                    setTempContent(text);
                    setIsEditing(false); // Reset editing mode when switching files
                })
                .catch(err => setFileContent("## Erreur\nImpossible de charger le fichier."));
        }
    }, [selectedFile]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('http://localhost:5000/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: selectedFile.path,
                    content: tempContent
                })
            });

            if (response.ok) {
                setFileContent(tempContent);
                setIsEditing(false);
            } else {
                alert("Erreur lors de la sauvegarde");
            }
        } catch (error) {
            console.error("Erreur sauvegarde:", error);
            alert("Erreur réseau lors de la sauvegarde");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateFile = async (e) => {
        e.preventDefault();
        if (!newFileName.trim()) return;

        let fileName = newFileName.trim();
        if (!fileName.endsWith('.md')) fileName += '.md';

        try {
            const response = await fetch('http://localhost:5000/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: fileName,
                    content: `# ${fileName.replace('.md', '')}\n\nCommencez à écrire ici...`
                })
            });

            if (response.ok) {
                setNewFileName('');
                setIsCreatingNew(false);
                fetchIndex();
                // Sélectionner le nouveau fichier
                const newFile = { name: fileName, path: fileName, type: 'file' };
                setSelectedFile(newFile);
                setIsEditing(true);
            } else {
                alert("Erreur lors de la création du fichier");
            }
        } catch (error) {
            console.error("Erreur création:", error);
            alert("Erreur réseau");
        }
    };

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
                    <div className="explorer-title">
                        <span>EXPLORATEUR</span>
                        <button className="add-file-btn" onClick={() => setIsCreatingNew(true)}>
                            <Plus size={14} />
                        </button>
                    </div>

                    {isCreatingNew && (
                        <form className="new-file-form" onSubmit={handleCreateFile}>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Nom du fichier..."
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                                onBlur={() => !newFileName && setIsCreatingNew(false)}
                            />
                            <div className="form-actions">
                                <button type="submit" className="confirm"><Check size={14} /></button>
                                <button type="button" className="cancel" onClick={() => setIsCreatingNew(false)}><X size={14} /></button>
                            </div>
                        </form>
                    )}

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
                                <div className="doc-actions">
                                    {!isEditing ? (
                                        <button className="action-btn edit" onClick={() => setIsEditing(true)}>
                                            <Edit2 size={16} />
                                            <span>Éditer</span>
                                        </button>
                                    ) : (
                                        <div className="edit-actions">
                                            <button className="action-btn save" onClick={handleSave} disabled={isSaving}>
                                                {isSaving ? <RotateCcw size={16} className="spin" /> : <Check size={16} />}
                                                <span>Sauvegarder</span>
                                            </button>
                                            <button className="action-btn cancel" onClick={() => {
                                                setTempContent(fileContent);
                                                setIsEditing(false);
                                            }}>
                                                <X size={16} />
                                                <span>Annuler</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <h1>{selectedFile.name}</h1>
                            </header>

                            <article className="markdown-body">
                                {isEditing ? (
                                    <textarea
                                        className="markdown-editor"
                                        value={tempContent}
                                        onChange={(e) => setTempContent(e.target.value)}
                                        placeholder="Écrivez votre Markdown ici..."
                                        spellCheck="false"
                                    />
                                ) : (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{fileContent}</ReactMarkdown>
                                )}
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
                                    <span className="value">{loading ? '...' : data.length || '6'}</span>
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
