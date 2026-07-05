import { X, Shield, Search, Plus, Check } from 'lucide-react';

export default function Sidebar({
  isOpen,
  onToggle,
  searchTerm,
  onSearchChange,
  children,
  isCreatingNew,
  onStartCreate,
  onCreateFile,
  newFileName,
  onNewFileNameChange,
  onCancelCreate,
}) {
  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onToggle}
          aria-hidden="true"
          style={{
            display: 'none',
          }}
        />
      )}

      <aside
        className={`sidebar${isOpen ? ' open' : ''}`}
        aria-label="Navigation des documents"
      >
        <header className="sidebar-header">
          <div className="logo">
            <Shield size={22} className="logo-icon" aria-hidden="true" />
            <h2>Salle sur Demande</h2>
          </div>
          <button
            className="sidebar-toggle"
            onClick={onToggle}
            aria-label="Fermer la navigation"
          >
            <X size={18} />
          </button>
        </header>

        <div className="search-box" role="search">
          <Search size={16} className="search-icon" aria-hidden="true" />
          <input
            type="search"
            placeholder="Rechercher une note..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Rechercher dans les documents"
          />
        </div>

        <nav className="sidebar-nav" aria-label="Explorateur de fichiers">
          <div className="explorer-section">
            <div className="explorer-heading">
              <span>Explorateur</span>
              <button
                className="add-file-btn"
                onClick={onStartCreate}
                aria-label="Créer un nouveau document"
                title="Nouveau document"
              >
                <Plus size={14} />
              </button>
            </div>

            {isCreatingNew && (
              <form
                className="new-file-form"
                onSubmit={onCreateFile}
                aria-label="Formulaire de création de fichier"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Nom du fichier..."
                  value={newFileName}
                  onChange={(e) => onNewFileNameChange(e.target.value)}
                  onBlur={() => !newFileName && onCancelCreate()}
                  aria-label="Nom du nouveau fichier"
                />
                <div className="form-actions">
                  <button type="submit" className="confirm" aria-label="Confirmer la création">
                    <Check size={14} />
                  </button>
                  <button
                    type="button"
                    className="cancel"
                    onClick={onCancelCreate}
                    aria-label="Annuler la création"
                  >
                    <X size={14} />
                  </button>
                </div>
              </form>
            )}

            {children}
          </div>
        </nav>

        <footer className="sidebar-footer">
          <div className="status-indicator">
            <span className="status-dot" aria-hidden="true" />
            <span>Connecté</span>
          </div>
        </footer>
      </aside>
    </>
  );
}
