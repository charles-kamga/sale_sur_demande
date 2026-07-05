import { Folder, FileText, File } from 'lucide-react';

export default function FileTree({ items, selectedFile, onSelect }) {
  if (!items || items.length === 0) {
    return <p className="loading">Aucun document trouvé.</p>;
  }

  return (
    <div role="tree" aria-label="Arborescence des fichiers">
      {items.map((item) => {
        if (item.type === 'directory') {
          return (
            <div key={item.path} role="treeitem" aria-expanded="true">
              <div className="tree-header" aria-hidden="true">
                <Folder size={16} className="icon" />
                <span>{item.name}</span>
              </div>
              <div className="tree-children" role="group">
                <FileTree
                  items={item.children}
                  selectedFile={selectedFile}
                  onSelect={onSelect}
                />
              </div>
            </div>
          );
        }

        const Icon = item.extension === '.pdf' ? File : FileText;
        const isActive = selectedFile?.path === item.path;

        return (
          <button
            key={item.path}
            className={`tree-item file${isActive ? ' active' : ''}`}
            onClick={() => onSelect(item)}
            role="treeitem"
            aria-current={isActive ? 'page' : undefined}
            aria-label={`Ouvrir ${item.name}`}
          >
            <Icon size={16} className="icon" aria-hidden="true" />
            <span>{item.name}</span>
          </button>
        );
      })}
    </div>
  );
}
