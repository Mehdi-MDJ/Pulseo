/**
 * ==============================================================================
 * NurseLink AI - Service de Stockage (Legacy)
 * ==============================================================================
 * 
 * DÉPRÉCIÉ : Ce fichier sera supprimé dans une version future
 * Utilisez server/services/storageService.ts à la place
 * 
 * Conservé temporairement pour compatibilité avec l'ancien code
 * ==============================================================================
 */

import { storage } from "./services/storageService";
import type { IStorage } from "./services/storageService";

// Re-export du nouveau service pour compatibilité
export { storage };
