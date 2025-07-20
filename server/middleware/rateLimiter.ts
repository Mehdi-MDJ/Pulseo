/**
 * ==============================================================================
 * NurseLink AI - Middleware Rate Limiting
 * ==============================================================================
 *
 * Protection contre les attaques par déni de service
 * Limitation du nombre de requêtes par IP et par utilisateur
 * ==============================================================================
 */

import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { logger } from '../services/loggerService';

interface RateLimitConfig {
  windowMs: number;        // Fenêtre de temps en ms
  maxRequests: number;     // Nombre max de requêtes
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  handler?: (req: Request, res: Response) => void;
}

interface RateLimitRule {
  path: string;
  method?: string;
  config: RateLimitConfig;
}

class RateLimiter {
  private redis: Redis;
  private rules: RateLimitRule[];

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_RATE_LIMIT_DB || '1'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });

    // Mode développement : réduire ou désactiver le rate limiting
    const isDevelopment = process.env.NODE_ENV === 'development';
    const rateLimitMultiplier = isDevelopment ? 100 : 1; // 100x plus permissif en dev

    // Configuration des règles de rate limiting
    this.rules = [
      // Règles générales
      {
        path: '/api/auth',
        config: {
          windowMs: 15 * 60 * 1000, // 15 minutes
          maxRequests: 20 * rateLimitMultiplier, // ✅ Augmenté de 5 à 20
          skipSuccessfulRequests: false,
          skipFailedRequests: false,
        }
      },
      {
        path: '/api/auth/login',
        method: 'POST',
        config: {
          windowMs: 15 * 60 * 1000, // 15 minutes
          maxRequests: 15 * rateLimitMultiplier, // ✅ Augmenté de 3 à 15
          skipSuccessfulRequests: true,
          skipFailedRequests: false,
        }
      },
      {
        path: '/api/auth/register',
        method: 'POST',
        config: {
          windowMs: 60 * 60 * 1000, // 1 heure
          maxRequests: 5 * rateLimitMultiplier, // ✅ Augmenté de 2 à 5
          skipSuccessfulRequests: true,
          skipFailedRequests: false,
        }
      },
      // Règles pour les missions
      {
        path: '/api/missions',
        config: {
          windowMs: 60 * 1000, // 1 minute
          maxRequests: 50 * rateLimitMultiplier, // ✅ Augmenté de 30 à 50
          skipSuccessfulRequests: false,
          skipFailedRequests: true,
        }
      },
      {
        path: '/api/missions',
        method: 'POST',
        config: {
          windowMs: 60 * 1000, // 1 minute
          maxRequests: 20 * rateLimitMultiplier, // ✅ Augmenté de 10 à 20
          skipSuccessfulRequests: false,
          skipFailedRequests: true,
        }
      },
      // Règles pour les établissements
      {
        path: '/api/establishments',
        config: {
          windowMs: 60 * 1000, // 1 minute
          maxRequests: 30 * rateLimitMultiplier, // ✅ Augmenté de 20 à 30
          skipSuccessfulRequests: false,
          skipFailedRequests: true,
        }
      },
      // Règles pour l'IA
      {
        path: '/api/ai',
        config: {
          windowMs: 60 * 1000, // 1 minute
          maxRequests: 10 * rateLimitMultiplier, // ✅ Augmenté de 5 à 10
          skipSuccessfulRequests: false,
          skipFailedRequests: true,
        }
      },
      // Règles pour les analytics
      {
        path: '/api/analytics',
        config: {
          windowMs: 60 * 1000, // 1 minute
          maxRequests: 25 * rateLimitMultiplier, // ✅ Augmenté de 15 à 25
          skipSuccessfulRequests: false,
          skipFailedRequests: true,
        }
      }
    ];

    // Log de la configuration en développement
    if (isDevelopment) {
      console.log(`🚀 [RateLimiter] Mode développement activé - Multiplicateur: ${rateLimitMultiplier}x`);
    }
  }

  /**
   * Générer une clé unique pour le rate limiting
   */
  private generateKey(req: Request, rule: RateLimitRule): string {
    const identifier = this.getIdentifier(req);
    const path = rule.path;
    const method = rule.method || req.method;

    return `rate_limit:${identifier}:${path}:${method}`;
  }

  /**
   * Obtenir l'identifiant de l'utilisateur (IP ou userId)
   */
  private getIdentifier(req: Request): string {
    // Priorité à l'utilisateur authentifié
    if (req.user?.id) {
      return `user:${req.user.id}`;
    }

    // Fallback sur l'IP
    const ip = this.getClientIP(req);
    return `ip:${ip}`;
  }

  /**
   * Obtenir l'IP du client
   */
  private getClientIP(req: Request): string {
    return req.headers['x-forwarded-for'] as string ||
           req.headers['x-real-ip'] as string ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           'unknown';
  }

  /**
   * Vérifier si une requête correspond à une règle
   */
  private matchesRule(req: Request, rule: RateLimitRule): boolean {
    const pathMatches = req.path.startsWith(rule.path);
    const methodMatches = !rule.method || req.method === rule.method;

    return pathMatches && methodMatches;
  }

  /**
   * Trouver la règle applicable pour une requête
   */
  private findApplicableRule(req: Request): RateLimitRule | null {
    // Chercher la règle la plus spécifique
    const applicableRules = this.rules.filter(rule => this.matchesRule(req, rule));

    if (applicableRules.length === 0) {
      return null;
    }

    // Retourner la règle la plus spécifique (plus longue path)
    return applicableRules.reduce((prev, current) =>
      current.path.length > prev.path.length ? current : prev
    );
  }

  /**
   * Middleware principal de rate limiting
   */
  public middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const rule = this.findApplicableRule(req);

        if (!rule) {
          return next();
        }

        const key = this.generateKey(req, rule);
        const now = Date.now();
        const windowStart = now - rule.config.windowMs;

        // Récupérer les requêtes dans la fenêtre de temps
        const requests = await this.redis.zrangebyscore(key, windowStart, '+inf');

        // Vérifier si la limite est dépassée
        if (requests.length >= rule.config.maxRequests) {
          const retryAfter = Math.ceil(rule.config.windowMs / 1000);

          logger.warn('Rate limit dépassé', {
            ipAddress: this.getClientIP(req),
            userId: req.user?.id,
            path: req.path,
            method: req.method,
            limit: rule.config.maxRequests,
            windowMs: rule.config.windowMs,
          });

          return res.status(429).json({
            error: 'Trop de requêtes',
            message: 'Vous avez dépassé la limite de requêtes autorisées',
            retryAfter,
            limit: rule.config.maxRequests,
            windowMs: rule.config.windowMs,
          });
        }

        // Ajouter la requête actuelle
        await this.redis.zadd(key, now, now.toString());
        await this.redis.expire(key, Math.ceil(rule.config.windowMs / 1000));

        // Ajouter les headers de rate limiting
        res.set({
          'X-RateLimit-Limit': rule.config.maxRequests.toString(),
          'X-RateLimit-Remaining': Math.max(0, rule.config.maxRequests - requests.length - 1).toString(),
          'X-RateLimit-Reset': new Date(now + rule.config.windowMs).toISOString(),
        });

        // Logger la requête si nécessaire
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Requête autorisée', {
            ipAddress: this.getClientIP(req),
            userId: req.user?.id,
            path: req.path,
            method: req.method,
            remaining: Math.max(0, rule.config.maxRequests - requests.length - 1),
          });
        }

        next();
      } catch (error) {
        logger.error('Erreur rate limiting:', error);
        // En cas d'erreur, on laisse passer la requête
        next();
      }
    };
  }

  /**
   * Middleware spécifique pour les routes d'authentification
   */
  public authRateLimit() {
    return this.createSpecificRateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
      skipSuccessfulRequests: true,
      skipFailedRequests: false,
    });
  }

  /**
   * Middleware spécifique pour les routes d'IA
   */
  public aiRateLimit() {
    return this.createSpecificRateLimit({
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 3,
      skipSuccessfulRequests: false,
      skipFailedRequests: true,
    });
  }

  /**
   * Créer un middleware de rate limiting spécifique
   */
  private createSpecificRateLimit(config: RateLimitConfig) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const identifier = this.getIdentifier(req);
        const key = `rate_limit:${identifier}:${req.path}:${req.method}`;
        const now = Date.now();
        const windowStart = now - config.windowMs;

        const requests = await this.redis.zrangebyscore(key, windowStart, '+inf');

        if (requests.length >= config.maxRequests) {
          const retryAfter = Math.ceil(config.windowMs / 1000);

          logger.warn('Rate limit spécifique dépassé', {
            ipAddress: this.getClientIP(req),
            userId: req.user?.id,
            path: req.path,
            method: req.method,
            limit: config.maxRequests,
          });

          return res.status(429).json({
            error: 'Limite dépassée',
            message: 'Vous avez dépassé la limite pour cette opération',
            retryAfter,
          });
        }

        await this.redis.zadd(key, now, now.toString());
        await this.redis.expire(key, Math.ceil(config.windowMs / 1000));

        next();
      } catch (error) {
        logger.error('Erreur rate limiting spécifique:', error);
        next();
      }
    };
  }

  /**
   * Réinitialiser les compteurs pour un utilisateur
   */
  async resetUserLimits(userId: string): Promise<void> {
    try {
      const pattern = `rate_limit:user:${userId}:*`;
      const keys = await this.redis.keys(pattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.info(`Limites réinitialisées pour l'utilisateur ${userId}`);
      }
    } catch (error) {
      logger.error('Erreur réinitialisation limites:', error);
    }
  }

  /**
   * Obtenir les statistiques de rate limiting
   */
  async getStats(): Promise<{
    totalKeys: number;
    blockedRequests: number;
    activeLimits: number;
  }> {
    try {
      const keys = await this.redis.keys('rate_limit:*');
      const totalKeys = keys.length;

      // Compter les clés actives (non expirées)
      let activeLimits = 0;
      for (const key of keys) {
        const exists = await this.redis.exists(key);
        if (exists) activeLimits++;
      }

      return {
        totalKeys,
        blockedRequests: 0, // À implémenter avec un compteur
        activeLimits,
      };
    } catch (error) {
      logger.error('Erreur récupération stats rate limiting:', error);
      return {
        totalKeys: 0,
        blockedRequests: 0,
        activeLimits: 0,
      };
    }
  }

  /**
   * Nettoyer les anciennes entrées
   */
  async cleanup(): Promise<void> {
    try {
      const keys = await this.redis.keys('rate_limit:*');
      const now = Date.now();

      for (const key of keys) {
        const windowMs = 15 * 60 * 1000; // 15 minutes par défaut
        const windowStart = now - windowMs;

        // Supprimer les entrées expirées
        await this.redis.zremrangebyscore(key, '-inf', windowStart);
      }

      logger.debug('Nettoyage rate limiting effectué');
    } catch (error) {
      logger.error('Erreur nettoyage rate limiting:', error);
    }
  }
}

// Instance singleton
export const rateLimiter = new RateLimiter();

// Middleware par défaut
export const rateLimitMiddleware = rateLimiter.middleware();
