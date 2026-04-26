import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Documentation from './pages/Documentation';
import NodeHealth from './pages/NodeHealth';
import NetworkMap from './pages/NetworkMap';
import FileExplorer from './pages/FileExplorer';
import FaultLogs from './pages/FaultLogs';
import Security from './pages/Security';
import IOTraffic from './pages/IOTraffic';
import Settings from './pages/Settings';

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/documentation" element={<PageTransition><Documentation /></PageTransition>} />
        <Route path="/health" element={<PageTransition><NodeHealth /></PageTransition>} />
        <Route path="/network-map" element={<PageTransition><NetworkMap /></PageTransition>} />
        <Route path="/files" element={<PageTransition><FileExplorer /></PageTransition>} />
        <Route path="/fault-logs" element={<PageTransition><FaultLogs /></PageTransition>} />
        <Route path="/security" element={<PageTransition><Security /></PageTransition>} />
        <Route path="/io-traffic" element={<PageTransition><IOTraffic /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <div className="app-shell">
        <Navbar />
        <div className="app-main">
          <AnimatedRoutes />
        </div>
        <Footer />
      </div>
    </Router>
  );
}
