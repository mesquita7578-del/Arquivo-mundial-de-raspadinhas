
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (!container) {
  console.error("Erro Crítico: Não foi possível encontrar o elemento root no HTML.");
} else {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Erro ao iniciar a aplicação:", error);
    container.innerHTML = `<div style="color: white; padding: 20px; text-align: center; font-family: sans-serif;">
      <h2>Vovô Jorge, houve um erro no arranque! hihi!</h2>
      <p>Por favor, tente recarregar a página.</p>
    </div>`;
  }
}
