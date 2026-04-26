import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CodeBlock({ code, filename = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden ghost-border" style={{ backgroundColor: 'var(--color-deep)' }}>
      {filename && (
        <div
          className="px-4 py-2 flex items-center justify-between border-b"
          style={{ borderColor: 'rgba(0, 242, 255, 0.1)', backgroundColor: 'var(--color-dim-deck)' }}
        >
          <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
            {filename}
          </span>
          <button
            onClick={handleCopy}
            className="p-1 rounded-sm cursor-pointer border-0 transition-colors"
            style={{ background: 'transparent', color: 'var(--color-text-muted)' }}
            title="Copy code"
          >
            {copied ? <Check size={14} className="text-teal-neon" /> : <Copy size={14} />}
          </button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="font-mono" style={{ color: 'var(--color-cyan-primary)' }}>
          {code}
        </code>
      </pre>
    </div>
  );
}
