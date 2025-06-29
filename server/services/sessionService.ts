/**
 * ==============================================================================
 * NurseLink AI - Service de Sessions Sécurisé
 * ==============================================================================
 *
 * Service de gestion des sessions utilisateur avec Redis
 * Remplace les sessions en mémoire volatile par un stockage persistant
 * ==============================================================================
 */

import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './loggerService';

interface SessionData {
  userId: string;
  email: string;
  role: 'establishment' | 'nurse' | 'admin';
  establishmentId?: string;
  createdAt: Date;
  lastActivity: Date;
  userAgent?: string;
  ipAddress?: string;
}

interface SessionConfig {
  ttl: number; // Time to live en secondes
  maxSessionsPerUser: number;
  cleanupInterval: number; // Intervalle de nettoyage en ms
}

export class SessionService {
  private redis: Redis;
  private config: SessionConfig;

  constructor() {
    // Configuration Redis avec fallback
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      // Configuration de sécurité
      enableOfflineQueue: false,
      maxLoadingTimeout: 5000,
    });

    this.config = {
      ttl: parseInt(process.env.SESSION_TTL || '3600'), // 1 heure par défaut
      maxSessionsPerUser: parseInt(process.env.MAX_SESSIONS_PER_USER || '5'),
      cleanupInterval: parseInt(process.env.SESSION_CLEANUP_INTERVAL || '300000'), // 5 minutes
    };

    this.initializeRedis();
    this.startCleanupJob();
  }

  private async initializeRedis() {
    try {
      await this.redis.ping();
      logger.info('Redis connecté avec succès');
    } catch (error) {
      logger.error('Erreur connexion Redis:', error);
      // Fallback vers stockage en mémoire si Redis indisponible
      this.fallbackToMemory();
    }
  }

  private fallbackToMemory() {
    logger.warn('Fallback vers stockage en mémoire - Redis indisponible');
    // Utiliser une Map en mémoire comme fallback
    const memorySessions = new Map<string, SessionData>();

    this.redis = {
      get: async (key: string) => memorySessions.get(key) ? JSON.stringify(memorySessions.get(key)) : null,
      setex: async (key: string, ttl: number, value: string) => {
        memorySessions.set(key, JSON.parse(value));
        setTimeout(() => memorySessions.delete(key), ttl * 1000);
      },
      del: async (key: string) => memorySessions.delete(key),
      exists: async (key: string) => memorySessions.has(key) ? 1 : 0,
      ping: async () => 'PONG',
    } as any;
  }

  /**
   * Créer une nouvelle session
   */
  async createSession(userData: Omit<SessionData, 'createdAt' | 'lastActivity'>, userAgent?: string, ipAddress?: string): Promise<string> {
    const sessionId = uuidv4();
    const sessionData: SessionData = {
      ...userData,
      createdAt: new Date(),
      lastActivity: new Date(),
      userAgent,
      ipAddress,
    };

    const sessionKey = `session:${sessionId}`;
    const userSessionsKey = `user_sessions:${userData.userId}`;

    try {
      // Vérifier le nombre de sessions actives par utilisateur
      const userSessions = await this.redis.smembers(userSessionsKey);
      if (userSessions.length >= this.config.maxSessionsPerUser) {
        // Supprimer la session la plus ancienne
        const oldestSession = userSessions[0];
        await this.redis.del(`session:${oldestSession}`);
        await this.redis.srem(userSessionsKey, oldestSession);
      }

      // Créer la nouvelle session
      await this.redis.setex(sessionKey, this.config.ttl, JSON.stringify(sessionData));
      await this.redis.sadd(userSessionsKey, sessionId);
      await this.redis.expire(userSessionsKey, this.config.ttl);

      logger.info(`Session créée pour utilisateur ${userData.email}`, {
        sessionId,
        userId: userData.userId,
        role: userData.role,
        ipAddress,
      });

      return sessionId;
    } catch (error) {
      logger.error('Erreur création session:', error);
      throw new Error('Impossible de créer la session');
    }
  }

  /**
   * Récupérer une session
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const sessionKey = `session:${sessionId}`;
      const sessionData = await this.redis.get(sessionKey);

      if (!sessionData) {
        return null;
      }

      const session: SessionData = JSON.parse(sessionData);

      // Mettre à jour l'activité
      session.lastActivity = new Date();
      await this.redis.setex(sessionKey, this.config.ttl, JSON.stringify(session));

      return session;
    } catch (error) {
      logger.error('Erreur récupération session:', error);
      return null;
    }
  }

  /**
   * Supprimer une session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const sessionKey = `session:${sessionId}`;
      const sessionData = await this.redis.get(sessionKey);

      if (sessionData) {
        const session: SessionData = JSON.parse(sessionData);
        const userSessionsKey = `user_sessions:${session.userId}`;

        await this.redis.del(sessionKey);
        await this.redis.srem(userSessionsKey, sessionId);

        logger.info(`Session supprimée`, {
          sessionId,
          userId: session.userId,
        });

        return true;
      }

      return false;
    } catch (error) {
      logger.error('Erreur suppression session:', error);
      return false;
    }
  }

  /**
   * Supprimer toutes les sessions d'un utilisateur
   */
  async deleteAllUserSessions(userId: string): Promise<number> {
    try {
      const userSessionsKey = `user_sessions:${userId}`;
      const userSessions = await this.redis.smembers(userSessionsKey);

      if (userSessions.length === 0) {
        return 0;
      }

      // Supprimer toutes les sessions
      const pipeline = this.redis.pipeline();
      userSessions.forEach(sessionId => {
        pipeline.del(`session:${sessionId}`);
      });
      pipeline.del(userSessionsKey);

      await pipeline.exec();

      logger.info(`Toutes les sessions supprimées pour l'utilisateur ${userId}`, {
        userId,
        sessionCount: userSessions.length,
      });

      return userSessions.length;
    } catch (error) {
      logger.error('Erreur suppression sessions utilisateur:', error);
      return 0;
    }
  }

  /**
   * Vérifier si une session existe
   */
  async sessionExists(sessionId: string): Promise<boolean> {
    try {
      const sessionKey = `session:${sessionId}`;
      const exists = await this.redis.exists(sessionKey);
      return exists === 1;
    } catch (error) {
      logger.error('Erreur vérification session:', error);
      return false;
    }
  }

  /**
   * Prolonger une session
   */
  async extendSession(sessionId: string, newTtl?: number): Promise<boolean> {
    try {
      const sessionKey = `session:${sessionId}`;
      const sessionData = await this.redis.get(sessionKey);

      if (!sessionData) {
        return false;
      }

      const session: SessionData = JSON.parse(sessionData);
      session.lastActivity = new Date();

      const ttl = newTtl || this.config.ttl;
      await this.redis.setex(sessionKey, ttl, JSON.stringify(session));

      return true;
    } catch (error) {
      logger.error('Erreur prolongation session:', error);
      return false;
    }
  }

  /**
   * Nettoyer les sessions expirées
   */
  private async cleanupExpiredSessions() {
    try {
      // Cette fonction sera appelée périodiquement
      // Redis gère automatiquement l'expiration, mais on peut ajouter une logique de nettoyage
      logger.debug('Nettoyage des sessions expirées effectué');
    } catch (error) {
      logger.error('Erreur nettoyage sessions:', error);
    }
  }

  /**
   * Démarrer le job de nettoyage périodique
   */
  private startCleanupJob() {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.config.cleanupInterval);
  }

  /**
   * Obtenir les statistiques des sessions
   */
  async getSessionStats(): Promise<{
    totalSessions: number;
    activeUsers: number;
    memoryUsage: string;
  }> {
    try {
      const info = await this.redis.info('memory');
      const memoryUsage = info.split('\r\n')
        .find(line => line.startsWith('used_memory_human:'))
        ?.split(':')[1] || 'N/A';

      return {
        totalSessions: 0, // À implémenter avec SCAN
        activeUsers: 0,   // À implémenter avec SCAN
        memoryUsage,
      };
    } catch (error) {
      logger.error('Erreur récupération stats sessions:', error);
      return {
        totalSessions: 0,
        activeUsers: 0,
        memoryUsage: 'N/A',
      };
    }
  }

  /**
   * Fermer la connexion Redis
   */
  async close(): Promise<void> {
    try {
      await this.redis.quit();
      logger.info('Connexion Redis fermée');
    } catch (error) {
      logger.error('Erreur fermeture Redis:', error);
    }
  }
}

// Instance singleton
export const sessionService = new SessionService();
