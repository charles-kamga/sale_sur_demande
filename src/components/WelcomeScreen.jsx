import { Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WelcomeScreen({ count }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="welcome-screen"
    >
      <Terminal size={64} className="welcome-icon" />
      <h1>Bienvenue dans votre Salle sur Demande</h1>
      <p>Sélectionnez un document dans l'explorateur pour commencer vos recherches.</p>
      <div className="quick-stats">
        <div className="stat">
          <span className="label">Documents</span>
          <span className="value">{count}</span>
        </div>
        <div className="stat">
          <span className="label">Format</span>
          <span className="value">Markdown</span>
        </div>
      </div>
    </motion.div>
  );
}
