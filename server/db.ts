import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '../shared/schema.js';
import 'dotenv/config';

// Récupère l'URL de la base de données depuis les variables d'environnement
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("La variable d'environnement DATABASE_URL est manquante.");
}

// Crée le client de base de données avec la nouvelle librairie
const client = createClient({
  url: databaseUrl,
});

// Exporte la connexion Drizzle avec le schéma, prête à l'emploi dans toute l'application
export const db = drizzle(client, { schema });

// Fonction pour obtenir la connexion (compatibilité avec le code existant)
export const getDb = async () => {
  return db;
};
