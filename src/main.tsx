import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./hooks/useAuth";
import App from "./App";
import "./index.css";

console.log('[main.tsx] Démarrage de l\'application');

try {
  const rootElement = document.getElementById("root");
  console.log('[main.tsx] Root element:', rootElement);

  if (rootElement) {
    const root = createRoot(rootElement);
    console.log('[main.tsx] Root créé, rendu de App avec AuthProvider');
    root.render(
      <HelmetProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </HelmetProvider>
    );
  } else {
    console.error('[main.tsx] Root element non trouvé');
  }
} catch (error) {
  console.error('[main.tsx] Erreur lors du rendu:', error);
}
