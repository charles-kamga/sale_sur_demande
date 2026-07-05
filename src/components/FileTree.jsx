import { useState } from 'react';
import { Folder, FolderOpen, FileText, File, ChevronDown, ChevronRight } from 'lucide-react';

export default function FileTree({ items, selectedFile, onSelect, expandedDirs, onToggleDir }) {
  if (!items || items.length === 0) {
    return <p className="loading">Aucun document trouvé.</p>;
  }

  return (
    <div role="tree" aria-label="Arborescence des fichiers">
      {items.map((item) => {
        if (item.type === 'directory') {
          const isExpanded = expandedDirs?.[item.path] !== false;

          return (
            <div key={item.path} role="treeitem" aria-expanded={isExpanded}>
              <button
                className="tree-header"
                onClick={() => onToggleDir?.(item.path)}
                aria-label={`${isExpanded ? 'Réduire' : 'Développer'} ${item.name}`}
              >
                {isExpanded ? (
                  <ChevronDown size={14} className="chevron" />
                ) : (
                  <ChevronRight size={14} className="chevron" />
                )}
                {isExpanded ? (
                  <FolderOpen size={16} className="icon folder-open" />
                ) : (
                  <Folder size={16} className="icon" />
                )}
                <span>{item.name}</span>
                <span className="tree-count">{item.children?.length || 0}</span>
              </button>

              {isExpanded && (
                <div className="tree-children" role="group">
                  <FileTree
                    items={item.children}
                    selectedFile={selectedFile}
                    onSelect={onSelect}
                    expandedDirs={expandedDirs}
                    onToggleDir={onToggleDir}
                  />
                </div>
              )}
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
            <span className="tree-item-name">{item.name}</span>
          </button>
        );
      })}
    </div>
  );
}
