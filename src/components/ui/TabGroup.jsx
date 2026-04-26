import { motion } from 'framer-motion';

export default function TabGroup({ tabs, activeTab, onTabChange }) {
  return (
    <div className="tab-group">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`tab-btn${activeTab === tab.key ? ' active' : ''}`}
        >
          {tab.icon && <tab.icon size={14} />}
          {tab.label}
          {activeTab === tab.key && (
            <motion.div
              className="tab-indicator"
              layoutId="tabIndicator"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
