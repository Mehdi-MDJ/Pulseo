/**
 * ==============================================================================
 * NurseLink AI - Service de Logging Sécurisé
 * ==============================================================================
 *
 * Service de logging centralisé avec masquage des données sensibles
 * Structure les logs pour faciliter l'analyse et le monitoring
 * ==============================================================================
 */

import winston from 'winston';
import { createLogger, format, transports } from 'winston';

// Types pour les niveaux de log
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  duration?: number;
  [key: string]: any;
}

interface SensitiveData {
  password?: string;
  token?: string;
  apiKey?: string;
  siret?: string;
  phone?: string;
  email?: string;
  address?: string;
}

/**
 * Logger sécurisé avec masquage automatique des données sensibles
 */
class SecureLogger {
  private logger: winston.Logger;
  private sensitiveFields: Set<string>;

  /**
   * Format personnalisé pour masquer les données sensibles
   */
  private sanitizeFormat() {
    return format.printf(({ timestamp, level, message, ...meta }) => {
      const sanitizedMeta = this.sanitizeData(meta);
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...sanitizedMeta
      }, null, 2);
    });
  }

  constructor() {
    this.sensitiveFields = new Set([
      'password', 'token', 'apiKey', 'secret', 'key',
      'siret', 'phone', 'email', 'address', 'postalCode',
      'city', 'country', 'birthDate', 'socialSecurityNumber'
    ]);

    this.logger = createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.json(),
        this.sanitizeFormat()
      ),
      defaultMeta: { service: 'nurselink-ai' },
      transports: [
        // Console pour développement
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple(),
            this.sanitizeFormat()
          )
        }),
        // Fichier pour production
        new transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        new transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        })
      ],
      // Gestion des exceptions non capturées
      exceptionHandlers: [
        new transports.File({ filename: 'logs/exceptions.log' })
      ],
      // Gestion des rejets de promesses non gérés
      rejectionHandlers: [
        new transports.File({ filename: 'logs/rejections.log' })
      ]
    });
  }

  /**
   * Masquer les données sensibles dans les objets
   */
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();

      // Masquer les champs sensibles
      if (this.sensitiveFields.has(lowerKey) ||
          lowerKey.includes('password') ||
          lowerKey.includes('token') ||
          lowerKey.includes('secret')) {
        sanitized[key] = '[MASKED]';
        continue;
      }

      // Masquer partiellement les emails
      if (lowerKey === 'email' && typeof value === 'string') {
        sanitized[key] = this.maskEmail(value);
        continue;
      }

      // Masquer partiellement les numéros de téléphone
      if (lowerKey === 'phone' && typeof value === 'string') {
        sanitized[key] = this.maskPhone(value);
        continue;
      }

      // Masquer partiellement les SIRET
      if (lowerKey === 'siret' && typeof value === 'string') {
        sanitized[key] = this.maskSiret(value);
        continue;
      }

      // Récursion pour les objets imbriqués
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Masquer partiellement un email
   */
  private maskEmail(email: string): string {
    if (!email || !email.includes('@')) return '[MASKED]';

    const [local, domain] = email.split('@');
    if (local.length <= 2) return '[MASKED]';

    const maskedLocal = local.charAt(0) + '*'.repeat(local.length - 2) + local.charAt(local.length - 1);
    return `${maskedLocal}@${domain}`;
  }

  /**
   * Masquer partiellement un numéro de téléphone
   */
  private maskPhone(phone: string): string {
    if (!phone || phone.length < 4) return '[MASKED]';

    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 4) return '[MASKED]';

    return cleaned.slice(0, 2) + '*'.repeat(cleaned.length - 4) + cleaned.slice(-2);
  }

  /**
   * Masquer partiellement un SIRET
   */
  private maskSiret(siret: string): string {
    if (!siret || siret.length < 4) return '[MASKED]';

    const cleaned = siret.replace(/\D/g, '');
    if (cleaned.length < 4) return '[MASKED]';

    return cleaned.slice(0, 4) + '*'.repeat(cleaned.length - 6) + cleaned.slice(-2);
  }

  /**
   * Logger une erreur
   */
  error(message: string, context?: LogContext, error?: Error): void {
    const logData = {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };

    this.logger.error(message, logData);
  }

  /**
   * Logger un avertissement
   */
  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, context);
  }

  /**
   * Logger une information
   */
  info(message: string, context?: LogContext): void {
    this.logger.info(message, context);
  }

  /**
   * Logger un debug
   */
  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, context);
  }

  /**
   * Logger une requête HTTP
   */
  logRequest(method: string, endpoint: string, duration: number, statusCode: number, context?: LogContext): void {
    const level = statusCode >= 400 ? 'warn' : 'info';
    const message = `${method} ${endpoint} - ${statusCode} (${duration}ms)`;

    this.logger.log(level, message, {
      ...context,
      method,
      endpoint,
      duration,
      statusCode
    });
  }

  /**
   * Logger une authentification
   */
  logAuth(action: 'login' | 'logout' | 'register' | 'failed', userId?: string, context?: LogContext): void {
    const message = `Authentification: ${action}`;
    const level = action === 'failed' ? 'warn' : 'info';

    this.logger.log(level, message, {
      ...context,
      userId,
      authAction: action
    });
  }

  /**
   * Logger une action de mission
   */
  logMission(action: 'create' | 'update' | 'delete' | 'apply', missionId?: string, context?: LogContext): void {
    const message = `Mission: ${action}`;

    this.logger.info(message, {
      ...context,
      missionId,
      missionAction: action
    });
  }

  /**
   * Logger une action d'établissement
   */
  logEstablishment(action: 'create' | 'update' | 'delete', establishmentId?: string, context?: LogContext): void {
    const message = `Établissement: ${action}`;

    this.logger.info(message, {
      ...context,
      establishmentId,
      establishmentAction: action
    });
  }

  /**
   * Logger une erreur de sécurité
   */
  logSecurity(violation: string, context?: LogContext): void {
    const message = `Violation de sécurité: ${violation}`;

    this.logger.warn(message, {
      ...context,
      securityViolation: violation,
      severity: 'high'
    });
  }

  /**
   * Logger une performance
   */
  logPerformance(operation: string, duration: number, context?: LogContext): void {
    const message = `Performance: ${operation}`;
    const level = duration > 1000 ? 'warn' : 'info';

    this.logger.log(level, message, {
      ...context,
      operation,
      duration,
      performance: true
    });
  }

  /**
   * Obtenir les statistiques des logs
   */
  getStats(): Promise<{
    totalLogs: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
  }> {
    // Implémentation pour récupérer les stats depuis les fichiers de log
    return Promise.resolve({
      totalLogs: 0,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0
    });
  }

  /**
   * Nettoyer les anciens logs
   */
  async cleanupOldLogs(daysToKeep: number = 30): Promise<void> {
    // Implémentation pour nettoyer les logs anciens
    this.info(`Nettoyage des logs de plus de ${daysToKeep} jours`);
  }
}

// Instance singleton
export const logger = new SecureLogger();
