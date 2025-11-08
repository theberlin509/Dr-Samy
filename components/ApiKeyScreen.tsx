import React from 'react';
import { Bot, KeyRound } from 'lucide-react';

interface ApiKeyScreenProps {
  onSelectApiKey: () => void;
}

export const ApiKeyScreen: React.FC<ApiKeyScreenProps> = ({ onSelectApiKey }) => {
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <Bot size={48} className="login-icon" />
          <h1 className="login-title">
            Bienvenue sur Dr Samy
          </h1>
          <p className="login-subtitle">
            Pour commencer, veuillez sélectionner une clé API Gemini.
          </p>
          <div className="api-key-info">
            <KeyRound size={20} />
            <p>
              Votre clé API est nécessaire pour communiquer avec les modèles de Google. L'utilisation de l'API peut entraîner des frais.
              Pour en savoir plus, consultez la{' '}
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="api-key-link"
              >
                documentation sur la facturation.
              </a>.
            </p>
          </div>
        </div>
        
        <button
          onClick={onSelectApiKey}
          className="login-button"
        >
          Sélectionner une Clé API
        </button>
      </div>
    </div>
  );
};
