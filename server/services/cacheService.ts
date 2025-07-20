/**
 * Service de cache en mémoire pour optimiser les performances MVP
 * Cache gratuit et efficace pour les données fréquemment accédées
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  size: number;
  lastReset: number;
}

export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    size: 0,
    lastReset: Date.now()
  };

  // TTL par défaut : 5 minutes
  private readonly DEFAULT_TTL = 5 * 60 * 1000;

  /**
   * Récupère une valeur du cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    // Vérifier si l'entrée a expiré
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.metrics.misses++;
      this.metrics.size--;
      return null;
    }

    this.metrics.hits++;
    return entry.data;
  }

  /**
   * Stocke une valeur dans le cache
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    this.metrics.size = this.cache.size;
  }

  /**
   * Supprime une clé du cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.metrics.size = this.cache.size;
    }
    return deleted;
  }

  /**
   * Vide tout le cache
   */
  clear(): void {
    this.cache.clear();
    this.metrics.size = 0;
  }

  /**
   * Nettoie les entrées expirées
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    this.metrics.size = this.cache.size;
    return cleaned;
  }

  /**
   * Récupère les métriques du cache
   */
  getMetrics(): CacheMetrics {
    const hitRate = this.metrics.hits + this.metrics.misses > 0
      ? (this.metrics.hits / (this.metrics.hits + this.metrics.misses) * 100).toFixed(2)
      : '0.00';

    return {
      ...this.metrics,
      hitRate: `${hitRate}%`
    };
  }

  /**
   * Réinitialise les métriques
   */
  resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      size: this.cache.size,
      lastReset: Date.now()
    };
  }

  /**
   * Cache avec fonction de fallback
   */
  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetchFunction();
    this.set(key, data, ttl);
    return data;
  }

  /**
   * Invalide les clés par pattern
   */
  invalidatePattern(pattern: string): number {
    let invalidated = 0;
    const regex = new RegExp(pattern);

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    this.metrics.size = this.cache.size;
    return invalidated;
  }
}

// Instance singleton
export const cacheService = new CacheService();

// Nettoyage automatique toutes les 10 minutes
setInterval(() => {
  const cleaned = cacheService.cleanup();
  if (cleaned > 0) {
    console.log(`🧹 Cache cleanup: ${cleaned} expired entries removed`);
  }
}, 10 * 60 * 1000);

// Log des métriques toutes les 5 minutes
setInterval(() => {
  const metrics = cacheService.getMetrics();
  console.log(`📊 Cache metrics: ${metrics.hitRate} hit rate, ${metrics.size} entries`);
}, 5 * 60 * 1000);
