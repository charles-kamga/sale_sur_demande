import { useState, useEffect } from 'react';
import { BookOpen, Edit2, Check, X, RotateCcw, ExternalLink, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function DocViewer({ selectedFile, fileContent, onSave, isSaving }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempContent, setTempContent] = useState('');

  useEffect(() => {
    setTempContent(fileContent);
    setIsEditing(false);
  }, [fileContent, selectedFile?.path]);

  const handleSave = async () => {
    await onSave(tempContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempContent(fileContent);
    setIsEditing(false);
  };

  const handleKeydown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (isEditing) handleSave();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [isEditing, tempContent]);

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
      <header className="doc-header">
        <nav className="breadcrumb" aria-label="Chemin du document">
          <BookOpen size={14} aria-hidden="true" />
          <span>{selectedFile.path.replace(/\//g, ' › ')}</span>
        </nav>

        {isPdf ? (
          <div className="pdf-actions">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              aria-label="Ouvrir le PDF dans un nouvel onglet"
            >
              <ExternalLink size={16} aria-hidden="true" />
              Ouvrir
            </a>
            <a
              href={pdfUrl}
              download
              className="btn btn-primary"
              aria-label="Télécharger le PDF"
            >
              <Download size={16} aria-hidden="true" />
              Télécharger
            </a>
          </div>
        ) : (
          <div className="doc-actions" role="toolbar" aria-label="Actions du document">
            {!isEditing ? (
              <button
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
                aria-label="Éditer le document"
              >
                <Edit2 size={16} aria-hidden="true" />
                Éditer
              </button>
            ) : (
              <div className="edit-actions">
                <button
                  className="btn btn-green"
                  onClick={handleSave}
                  disabled={isSaving}
                  aria-label="Sauvegarder les modifications"
                >
                  {isSaving ? (
                    <RotateCcw size={16} className="spin" aria-hidden="true" />
                  ) : (
                    <Check size={16} aria-hidden="true" />
                  )}
                  {isSaving ? 'Sauvegarde…' : 'Sauvegarder'}
                </button>
                <button
                  className="btn btn-red"
                  onClick={handleCancel}
                  aria-label="Annuler les modifications"
                >
                  <X size={16} aria-hidden="true" />
                  Annuler
                </button>
              </div>
            )}
          </div>
        )}

        <h1>{selectedFile.name}</h1>
      </header>

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
        <section className="markdown-body">
          {isEditing ? (
            <textarea
              className="markdown-editor"
              value={tempContent}
              onChange={(e) => setTempContent(e.target.value)}
              placeholder="Écrivez votre Markdown ici…"
              spellCheck="false"
              aria-label="Éditeur Markdown"
            />
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {fileContent}
            </ReactMarkdown>
          )}
        </section>
      )}
    </motion.article>
  );
}
