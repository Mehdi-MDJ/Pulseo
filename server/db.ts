import * as schema from "@shared/schema";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Pour le développement, on utilise uniquement SQLite
// En production, on peut ajouter PostgreSQL si nécessaire
let db: any = undefined;

async function initDb() {
  // On sait que dbUrl est défini grâce à la vérification ci-dessus
  const databaseUrl = dbUrl!;

  if (databaseUrl.startsWith("file:")) {
    const Database = (await import("better-sqlite3")).default;
    const { drizzle } = await import("drizzle-orm/better-sqlite3");
    const sqlite = new Database(databaseUrl.replace("file:", ""));
    db = drizzle(sqlite, { schema });
    return db;
  } else {
    throw new Error("En développement, DATABASE_URL doit commencer par 'file:' pour utiliser SQLite");
  }
}

export const dbReady = initDb();
export async function getDb() {
  if (db) return db;
  return dbReady;
}
