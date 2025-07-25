import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../../shared/schema';

// Initialiser la base de données SQLite
const sqlite = new Database('dev.db');

// Créer le client Drizzle avec le schéma
export const db = drizzle(sqlite, { schema });

// Export des types pour la compatibilité
export type { User, NurseProfile, EstablishmentProfile, Mission, MissionApplication } from '../../shared/schema';
