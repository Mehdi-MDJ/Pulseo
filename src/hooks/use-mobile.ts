import { useState, useEffect } from 'react';

/**
 * Hook pour détecter si l'utilisateur est sur un appareil mobile
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Détecter les appareils mobiles basés sur la largeur d'écran
      const mobileBreakpoint = 768; // 768px est un breakpoint commun pour mobile
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    // Vérifier au chargement
    checkIsMobile();

    // Écouter les changements de taille d'écran
    window.addEventListener('resize', checkIsMobile);

    // Nettoyer l'écouteur
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}
