
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Captura de erros fatais antes do render
window.onerror = function(message, source, lineno, colno, error) {
  console.error("Erro Fatal Detectado:", message, "em", source, ":", lineno);
  const root = document.getElementById('root');
  if (root && root.innerHTML === "") {
    root.innerHTML = `
      <div style="color: white; padding: 40px; text-align: center; font-family: sans-serif; background: #020617; height: 100vh; display: flex; flex-direction: column; justify-content: center;">
        <h1 style="color: #3b82f6; margin-bottom: 20px;">Vovô Jorge, o site tropeçou! hihi!</h1>
        <p style="color: #64748b; margin-bottom: 30px;">Houve um erro ao carregar os componentes. Tente recarregar a página (F5).</p>
        <div style="font-size: 10px; color: #334155; text-transform: uppercase;">Detalhe técnico: ${message}</div>
      </div>
    `;
  }
};

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Arquivo Mundial iniciado com sucesso! 🐉");
  } catch (renderError) {
    console.error("Erro durante o React Render:", renderError);
  }
} else {
  console.error("Erro Crítico: Elemento #root não encontrado no DOM.");
}
