import { useState, useEffect } from 'react';
import { BookOpen, Edit2, Check, X, RotateCcw, ExternalLink, Download, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function DocViewer({ selectedFile, fileContent, onSave, isSaving }) {
  const [activeTab, setActiveTab] = useState('preview');
  const [tempContent, setTempContent] = useState('');

  useEffect(() => {
    setTempContent(fileContent);
    setActiveTab('preview');
  }, [fileContent, selectedFile?.path]);

  const handleSave = async () => {
    await onSave(tempContent);
    setActiveTab('preview');
  };

  const handleCancel = () => {
    setTempContent(fileContent);
    setActiveTab('preview');
  };

  const handleKeydown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (activeTab === 'edit') handleSave();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [activeTab, tempContent]);

  if (!selectedFile) return null;

  const isPdf = selectedFile.extension === '.pdf';
  const pdfUrl = `/docs/${selectedFile.path}`;

  return (
    <motion.article
      key={selectedFile.path}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="document-viewer"
      aria-label={`Document : ${selectedFile.name}`}
    >
      {/* ── En-tête ── */}
      <header className="doc-header">
        <nav className="breadcrumb" aria-label="Chemin du document">
          <BookOpen size={14} aria-hidden="true" />
          <button
            className="breadcrumb-home"
            onClick={() => window.location.reload()}
            aria-label="Accueil"
            title="Retour à l'accueil"
          >
            Docs
          </button>
          {selectedFile.path.split('/').map((part, i, arr) => (
            <span key={i}>
              <span className="breadcrumb-sep">›</span>
              <span className={i === arr.length - 1 ? 'breadcrumb-current' : ''}>
                {part}
              </span>
            </span>
          ))}
        </nav>

        <h1>{selectedFile.name}</h1>
      </header>

      {/* ── Onglets (Markdown only) ── */}
      {!isPdf && (
        <div className="tabs-bar" role="tablist" aria-label="Mode d'affichage">
          <button
            className={`tab ${activeTab === 'preview' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('preview')}
            role="tab"
            aria-selected={activeTab === 'preview'}
            aria-controls="panel-preview"
            id="tab-preview"
          >
            <Eye size={14} aria-hidden="true" />
            Aperçu
          </button>
          <button
            className={`tab ${activeTab === 'edit' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('edit')}
            role="tab"
            aria-selected={activeTab === 'edit'}
            aria-controls="panel-edit"
            id="tab-edit"
          >
            <Edit2 size={14} aria-hidden="true" />
            Éditer
          </button>

          {/* Actions en ligne avec les tabs */}
          {activeTab === 'edit' && (
            <div className="tab-actions">
              <button className="btn btn-green btn-sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <RotateCcw size={14} className="spin" /> : <Check size={14} />}
                {isSaving ? '…' : 'Sauvegarder'}
              </button>
              <button className="btn btn-red btn-sm" onClick={handleCancel}>
                <X size={14} />
                Annuler
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Actions PDF ── */}
      {isPdf && (
        <div className="pdf-actions-bar">
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
            <ExternalLink size={14} aria-hidden="true" />
            Ouvrir
          </a>
          <a href={pdfUrl} download className="btn btn-sm">
            <Download size={14} aria-hidden="true" />
            Télécharger
          </a>
        </div>
      )}

      {/* ── Contenu ── */}
      {isPdf ? (
        <div className="pdf-container">
          <iframe
            src={`${pdfUrl}#view=FitH`}
            className="pdf-viewer"
            title={selectedFile.name}
            aria-label={`Visualisation du PDF : ${selectedFile.name}`}
          />
        </div>
      ) : (
        <>
          <section
            id="panel-preview"
            role="tabpanel"
            aria-labelledby="tab-preview"
            hidden={activeTab !== 'preview'}
            className="markdown-body"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {fileContent}
            </ReactMarkdown>
          </section>

          <section
            id="panel-edit"
            role="tabpanel"
            aria-labelledby="tab-edit"
            hidden={activeTab !== 'edit'}
          >
            <textarea
              className="markdown-editor"
              value={tempContent}
              onChange={(e) => setTempContent(e.target.value)}
              placeholder="Écrivez votre Markdown ici…"
              spellCheck="false"
              aria-label="Éditeur Markdown"
            />
          </section>
        </>
      )}
    </motion.article>
  );
}
