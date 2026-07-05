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

  if (!selectedFile) return null;

  const isPdf = selectedFile.extension === '.pdf';
  const pdfUrl = `/docs/${selectedFile.path}`;

  return (
    <motion.div
      key={selectedFile.path}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="document-viewer"
    >
      <header className="doc-header">
        <div className="breadcrumb">
          <BookOpen size={16} />
          <span>{selectedFile.path.replace(/\//g, ' > ')}</span>
        </div>

        {isPdf && (
          <div className="pdf-actions">
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="action-btn">
              <ExternalLink size={16} />
              Ouvrir dans un onglet
            </a>
            <a href={pdfUrl} download className="action-btn">
              <Download size={16} />
              Télécharger
            </a>
          </div>
        )}

        {!isPdf && (
          <div className="doc-actions">
            {!isEditing ? (
              <button className="action-btn" onClick={() => setIsEditing(true)}>
                <Edit2 size={16} />
                Éditer
              </button>
            ) : (
              <div className="edit-actions">
                <button className="action-btn save" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <RotateCcw size={16} className="spin" /> : <Check size={16} />}
                  Sauvegarder
                </button>
                <button className="action-btn cancel" onClick={handleCancel}>
                  <X size={16} />
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
          />
        </div>
      ) : (
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
      )}
    </motion.div>
  );
}
