import { X, Menu, Shield, Search, Plus, Check } from 'lucide-react';

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
      {!isOpen && (
        <button className="menu-toggle floating" onClick={onToggle}>
          <Menu />
        </button>
      )}

      <aside className={`sidebar glass ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <Shield className="logo-icon" />
            <h2>Salle sur Demande</h2>
          </div>
          <button className="close-sidebar" onClick={onToggle}>
            <X />
          </button>
        </div>

        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher une note..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <nav className="file-explorer">
          <div className="explorer-title">
            <span>EXPLORATEUR</span>
            <button className="add-file-btn" onClick={onStartCreate}>
              <Plus size={14} />
            </button>
          </div>

          {isCreatingNew && (
            <form className="new-file-form" onSubmit={onCreateFile}>
              <input
                autoFocus
                type="text"
                placeholder="Nom du fichier..."
                value={newFileName}
                onChange={(e) => onNewFileNameChange(e.target.value)}
                onBlur={() => !newFileName && onCancelCreate()}
              />
              <div className="form-actions">
                <button type="submit" className="confirm"><Check size={14} /></button>
                <button type="button" className="cancel" onClick={onCancelCreate}><X size={14} /></button>
              </div>
            </form>
          )}

          {children}
        </nav>

        <div className="sidebar-footer">
          <div className="status-indicator">
            <div className="dot green"></div>
            <span>Secure Node Access</span>
          </div>
        </div>
      </aside>
    </>
  );
}
