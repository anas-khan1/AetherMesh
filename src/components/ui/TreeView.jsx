import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Folder, FolderOpen, FileText, Database, FileCode, FileArchive, Settings } from 'lucide-react';

const fileIcons = {
  parquet: Database,
  csv: FileText,
  bin: Database,
  json: FileCode,
  yaml: Settings,
  log: FileText,
  onnx: Database,
  enc: FileArchive,
  'tar.zst': FileArchive,
};

function getFileIcon(name) {
  for (const [ext, Icon] of Object.entries(fileIcons)) {
    if (name.endsWith(`.${ext}`)) return Icon;
  }
  return FileText;
}

function TreeNode({ node, depth = 0, onSelectFile, selectedFile }) {
  const [isOpen, setIsOpen] = useState(depth < 1);
  const isFolder = node.type === 'folder';
  const isSelected = !isFolder && selectedFile?.name === node.name;

  const FolderIcon = isOpen ? FolderOpen : Folder;
  const FileIcon = isFolder ? FolderIcon : getFileIcon(node.name);

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onSelectFile?.(node);
    }
  };

  const statusColor = node.status === 'synced' ? 'var(--color-teal-neon)' : node.status === 'syncing' ? 'var(--color-warning)' : 'var(--color-text-muted)';

  return (
    <div>
      <motion.button
        onClick={handleClick}
        className="tree-node"
        style={{
          paddingLeft: `${depth * 1.25 + 0.5}rem`,
          backgroundColor: isSelected ? 'rgba(17, 232, 246, 0.1)' : 'transparent',
          borderColor: isSelected ? 'rgba(17, 232, 246, 0.25)' : 'transparent',
        }}
        whileHover={{ backgroundColor: 'rgba(17, 232, 246, 0.06)' }}
      >
        {isFolder && (
          <motion.span
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronRight size={12} style={{ color: 'var(--color-text-subtle)' }} />
          </motion.span>
        )}
        {!isFolder && <span style={{ width: 12 }} />}
        <FileIcon size={15} style={{ color: isFolder ? 'var(--color-warning)' : 'var(--color-cyan-neon)', flexShrink: 0 }} />
        <span className="text-sm truncate" style={{ color: isSelected ? 'var(--color-cyan-neon)' : 'var(--color-text-primary)' }}>
          {node.name}
        </span>
        {node.status && (
          <span className="ml-auto text-[9px] font-mono uppercase tracking-wider" style={{ color: statusColor }}>
            {node.status}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isFolder && isOpen && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            {node.children.map((child) => (
              <TreeNode
                key={child.name}
                node={child}
                depth={depth + 1}
                onSelectFile={onSelectFile}
                selectedFile={selectedFile}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TreeView({ tree, onSelectFile, selectedFile }) {
  return (
    <div className="tree-view">
      {tree.map((node) => (
        <TreeNode
          key={node.name}
          node={node}
          onSelectFile={onSelectFile}
          selectedFile={selectedFile}
        />
      ))}
    </div>
  );
}
