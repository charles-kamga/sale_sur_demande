import { Folder, FileText } from 'lucide-react';

export default function FileTree({ items, selectedFile, onSelect }) {
  if (!items || items.length === 0) {
    return <div className="loading">Aucun document trouvé.</div>;
  }

  return (
    <>
      {items.map((item) => {
        if (item.type === 'directory') {
          return (
            <div key={item.path} className="tree-item directory">
              <div className="tree-header">
                <Folder size={16} className="icon" />
                <span>{item.name}</span>
              </div>
              <div className="tree-children">
                <FileTree items={item.children} selectedFile={selectedFile} onSelect={onSelect} />
              </div>
            </div>
          );
        }
        return (
          <div
            key={item.path}
            className={`tree-item file ${selectedFile?.path === item.path ? 'active' : ''}`}
            onClick={() => onSelect(item)}
          >
            <FileText size={16} className="icon" />
            <span>{item.name}</span>
          </div>
        );
      })}
    </>
  );
}
