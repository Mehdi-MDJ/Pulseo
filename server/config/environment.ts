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

  // NextAuth.js Configuration
  NEXTAUTH_URL: z.string().url().default("http://localhost:5000"),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET doit contenir au moins 32 caractères"),

  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),

  // Email Configuration (pour Magic Links)
  EMAIL_SERVER_HOST: z.string().optional(),
  EMAIL_SERVER_PORT: z.coerce.number().optional(),
  EMAIL_SERVER_USER: z.string().optional(),
  EMAIL_SERVER_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // OpenAI Configuration
  OPENAI_API_KEY: z.string().optional(),

  // Monitoring et Logs
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  SENTRY_DSN: z.string().url().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // Redis (optionnel)
  REDIS_URL: z.string().optional(),

  // Monitoring
  DATADOG_API_KEY: z.string().optional(),
  DATADOG_APP_KEY: z.string().optional(),

  // Backup Configuration
  BACKUP_RETENTION_DAYS: z.coerce.number().default(30),
  BACKUP_SCHEDULE: z.string().default("0 2 * * *"),

  // Security Headers
  CSP_NONCE: z.string().optional(),
  HSTS_MAX_AGE: z.coerce.number().default(31536000),
});

/**
 * Type pour les variables d'environnement validées
 */
export type Environment = z.infer<typeof environmentSchema>;

/**
 * Variables d'environnement validées
 */
export const env = environmentSchema.parse(process.env);

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
 * Configuration NextAuth.js
 */
export const authConfig = {
  url: env.NEXTAUTH_URL,
  secret: env.NEXTAUTH_SECRET,
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  },
  github: {
    clientId: env.GITHUB_ID,
    clientSecret: env.GITHUB_SECRET,
  },
  email: {
    host: env.EMAIL_SERVER_HOST,
    port: env.EMAIL_SERVER_PORT,
    user: env.EMAIL_SERVER_USER,
    password: env.EMAIL_SERVER_PASSWORD,
    from: env.EMAIL_FROM,
  },
} as const;

/**
 * Configuration du monitoring
 */
export const monitoringConfig = {
  logLevel: env.LOG_LEVEL,
  sentryDsn: env.SENTRY_DSN,
  datadog: {
    apiKey: env.DATADOG_API_KEY,
    appKey: env.DATADOG_APP_KEY,
  },
} as const;

/**
 * Configuration de la sécurité
 */
export const securityConfig = {
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  headers: {
    cspNonce: env.CSP_NONCE,
    hstsMaxAge: env.HSTS_MAX_AGE,
  },
} as const;

/**
 * Configuration des backups
 */
export const backupConfig = {
  retentionDays: env.BACKUP_RETENTION_DAYS,
  schedule: env.BACKUP_SCHEDULE,
} as const;

/**
 * Helpers pour l'environnement
 */
export const isDevelopment = env.NODE_ENV === "development";
export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";

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
      NEXTAUTH_CONFIGURED: !!env.NEXTAUTH_SECRET,
      OAUTH_PROVIDERS: {
        google: !!env.GOOGLE_CLIENT_ID,
        github: !!env.GITHUB_ID,
        email: !!env.EMAIL_SERVER_HOST,
      },
      MONITORING: {
        logLevel: env.LOG_LEVEL,
        sentry: !!env.SENTRY_DSN,
        datadog: !!env.DATADOG_API_KEY,
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

    console.error("\n💡 Vérifiez le fichier .env et consultez env.example");
    process.exit(1);
  }
}

// Validation automatique au démarrage
validateEnvironment();
