import React from 'react';
import { motion } from 'framer-motion';

function ForbiddenPage({ onBack }) {
  return (
    <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <motion.div 
        className="auth-box glass-panel"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', padding: '40px 20px', maxWidth: '400px', width: '100%' }}
      >
        <h1 style={{ color: '#ff4d4d', marginBottom: '20px', fontSize: '24px' }}>Access Denied</h1>
        <p style={{ color: 'var(--text-secondary, #ccc)', marginBottom: '30px' }}>
          You do not have permission to view this page.
        </p>
        <button className="primary-btn" onClick={onBack} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Return to Login
        </button>
      </motion.div>
    </div>
  );
}

export default ForbiddenPage;
