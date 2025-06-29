/**
 * ==============================================================================
 * NurseLink AI - Configuration Environnement
 * ==============================================================================
 *
 * Centralisation et validation de toutes les variables d'environnement
 * Assure que l'application ne démarre qu'avec une configuration valide
 *
 * Sécurité :
 * - Validation stricte des variables critiques
 * - Masquage des secrets dans les logs
 * - Configuration par défaut sécurisée
 * ==============================================================================
 */

import { z } from "zod";

/**
 * Schéma de validation pour les variables d'environnement
 * Utilise Zod pour une validation stricte au démarrage
 */
const environmentSchema = z.object({
  // Configuration serveur
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().min(1000).max(65535).default(5000),
  HOST: z.string().default("0.0.0.0"),

  // Base de données (PostgreSQL en production, SQLite en développement)
  DATABASE_URL: z.string().refine((url) => {
    if (process.env.NODE_ENV === "development") {
      // En développement, accepter SQLite et PostgreSQL
      return url.startsWith("file:") || url.startsWith("postgresql://");
    }
    // En production, seulement PostgreSQL
    return url.startsWith("postgresql://");
  }, "DATABASE_URL doit être une URL PostgreSQL valide (ou SQLite en développement)"),
  PGHOST: z.string().optional(),
  PGPORT: z.coerce.number().optional(),
  PGUSER: z.string().optional(),
  PGPASSWORD: z.string().optional(),
  PGDATABASE: z.string().optional(),

  // Authentification Replit OAuth (optionnelle en mode local)
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET doit contenir au moins 32 caractères"),
  REPL_ID: z.string().optional(),
  ISSUER_URL: z.string().url().default("https://replit.com/oidc"),
  REPLIT_DOMAINS: z.string().optional(),

  // Mode développement local
  LOCAL_DEV_MODE: z.coerce.boolean().default(false),

  // Intelligence Artificielle OpenAI
  OPENAI_API_KEY: z.string().optional(),

  // Configuration optionnelle
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  ENABLE_DETAILED_LOGS: z.coerce.boolean().default(false),
  ENABLE_RATE_LIMITING: z.coerce.boolean().default(true),
  MAX_REQUESTS_PER_MINUTE: z.coerce.number().min(1).max(1000).default(100),

  // Fonctionnalités IA
  AI_MATCHING_ENABLED: z.coerce.boolean().default(true),
  AI_FORECASTING_ENABLED: z.coerce.boolean().default(true),
});

/**
 * Type TypeScript généré à partir du schéma de validation
 */
export type Environment = z.infer<typeof environmentSchema>;

/**
 * Fonction de validation et parsing des variables d'environnement
 */
function validateEnvironment(): Environment {
  try {
    const env = environmentSchema.parse(process.env);

    // Log de la configuration (sans les secrets)
    console.log("✅ Configuration environnement validée:", {
      NODE_ENV: env.NODE_ENV,
      PORT: env.PORT,
      HOST: env.HOST,
      DATABASE_CONNECTED: !!env.DATABASE_URL,
      OPENAI_CONFIGURED: !!env.OPENAI_API_KEY,
      REPLIT_AUTH_CONFIGURED: !!env.REPL_ID,
      AI_FEATURES: {
        matching: env.AI_MATCHING_ENABLED,
        forecasting: env.AI_FORECASTING_ENABLED,
      },
    });

    return env;
  } catch (error) {
    console.error("❌ Erreur de configuration environnement:");

    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    } else {
      console.error(error);
    }

    console.error("\n💡 Vérifiez le fichier .env et consultez .env.example");
    process.exit(1);
  }
}

/**
 * Configuration validée exportée
 * Disponible dans toute l'application
 */
export const env = validateEnvironment();

/**
 * Helper pour vérifier si on est en mode développement
 */
export const isDevelopment = env.NODE_ENV === "development";

/**
 * Helper pour vérifier si on est en mode production
 */
export const isProduction = env.NODE_ENV === "production";

/**
 * Helper pour vérifier si on est en mode test
 */
export const isTest = env.NODE_ENV === "test";

/**
 * Configuration de la base de données
 */
export const databaseConfig = {
  url: env.DATABASE_URL,
  host: env.PGHOST,
  port: env.PGPORT,
  user: env.PGUSER,
  password: env.PGPASSWORD,
  database: env.PGDATABASE,
} as const;

/**
 * Configuration OAuth Replit
 */
export const authConfig = {
  sessionSecret: env.SESSION_SECRET,
  replId: env.REPL_ID || "local-dev-mode",
  issuerUrl: env.ISSUER_URL,
  domains: env.REPLIT_DOMAINS?.split(",").map(d => d.trim()) || ["localhost:5000"],
  localDevMode: env.LOCAL_DEV_MODE,
} as const;

/**
 * Configuration OpenAI
 */
export const aiConfig = {
  apiKey: env.OPENAI_API_KEY || "sk-fake-key-for-development",
  matchingEnabled: env.AI_MATCHING_ENABLED,
  forecastingEnabled: env.AI_FORECASTING_ENABLED,
} as const;

/**
 * Configuration du serveur
 */
export const serverConfig = {
  port: env.PORT,
  host: env.HOST,
  logLevel: env.LOG_LEVEL,
  detailedLogs: env.ENABLE_DETAILED_LOGS,
  rateLimiting: {
    enabled: env.ENABLE_RATE_LIMITING,
    maxRequests: env.MAX_REQUESTS_PER_MINUTE,
  },
} as const;
