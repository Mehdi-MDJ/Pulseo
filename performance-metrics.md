# 📊 Métriques de Performance - NurseLinkAI

## 🎯 **KPIs Critiques à Surveiller**

### **1. Performance API**
```javascript
// Métriques de réponse
- Temps de réponse moyen: < 200ms
- Temps de réponse 95e percentile: < 500ms
- Taux d'erreur: < 1%
- Throughput: > 1000 req/s
```

### **2. Base de Données**
```sql
-- Requêtes lentes
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Connexions actives
SELECT count(*) FROM pg_stat_activity;

-- Cache hit ratio
SELECT
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as cache_hit_ratio
FROM pg_statio_user_tables;
```

### **3. Cache Redis**
```bash
# Performance Redis
redis-cli info memory
redis-cli info stats
redis-cli info keyspace
```

## 📈 **Dashboards Recommandés**

### **Dashboard Principal**
- **Temps de réponse API** (graphique en temps réel)
- **Taux d'erreur** (gauge)
- **Requêtes par seconde** (counter)
- **Utilisation CPU/Mémoire** (line chart)
- **Connexions DB actives** (gauge)

### **Dashboard Base de Données**
- **Requêtes lentes** (table)
- **Cache hit ratio** (gauge)
- **Taille des tables** (bar chart)
- **Index usage** (pie chart)

### **Dashboard Mobile**
- **Temps de chargement** (histogram)
- **Erreurs réseau** (counter)
- **Utilisateurs actifs** (gauge)
- **Sessions par jour** (line chart)

## 🚨 **Alertes Automatiques**

### **Alertes Critiques**
```yaml
# Temps de réponse élevé
- alert: HighResponseTime
  expr: http_request_duration_seconds > 2
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Temps de réponse élevé"
    description: "L'API met plus de 2 secondes à répondre"

# Taux d'erreur élevé
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: "Taux d'erreur élevé"
    description: "Plus de 10% d'erreurs 5xx"

# Base de données surchargée
- alert: DatabaseOverloaded
  expr: pg_stat_activity_count > 100
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Base de données surchargée"
    description: "Plus de 100 connexions actives"
```

## 🔧 **Optimisations Recommandées**

### **1. Indexation Stratégique**
```sql
-- Index pour les requêtes fréquentes
CREATE INDEX CONCURRENTLY idx_missions_location_status
ON missions(location, status);

CREATE INDEX CONCURRENTLY idx_contracts_created_at
ON contracts(created_at DESC);

CREATE INDEX CONCURRENTLY idx_users_email_role
ON users(email, role);
```

### **2. Cache Redis**
```javascript
// Cache des missions populaires
const CACHE_TTL = 3600; // 1 heure

async function getPopularMissions() {
  const cacheKey = 'missions:popular';
  let missions = await redis.get(cacheKey);

  if (!missions) {
    missions = await db.query(`
      SELECT * FROM missions
      WHERE status = 'active'
      ORDER BY applications_count DESC
      LIMIT 20
    `);
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(missions));
  }

  return JSON.parse(missions);
}
```

### **3. Pagination Optimisée**
```javascript
// Pagination avec curseur
async function getMissionsPaginated(cursor, limit = 20) {
  const query = cursor
    ? `SELECT * FROM missions WHERE id > $1 ORDER BY id LIMIT $2`
    : `SELECT * FROM missions ORDER BY id LIMIT $1`;

  const params = cursor ? [cursor, limit] : [limit];
  return await db.query(query, params);
}
```

## 📊 **Métriques Business**

### **1. Engagement Utilisateurs**
- **DAU/MAU** (Daily/Monthly Active Users)
- **Temps de session moyen**
- **Taux de rétention**
- **Taux de conversion**

### **2. Performance Business**
- **Missions créées/jour**
- **Contrats signés/jour**
- **Taux de matching**
- **Revenus générés**

### **3. Qualité de Service**
- **Temps de résolution des incidents**
- **Satisfaction utilisateur**
- **Taux de disponibilité**
- **Temps de déploiement**

## 🎯 **Objectifs de Performance**

| Métrique | Objectif | Seuil d'Alerte |
|----------|----------|----------------|
| Temps de réponse API | < 200ms | > 500ms |
| Taux d'erreur | < 0.1% | > 1% |
| Disponibilité | > 99.9% | < 99% |
| Temps de chargement mobile | < 2s | > 5s |
| Cache hit ratio | > 95% | < 80% |
| Connexions DB | < 50 | > 100 |

## 🔄 **Processus d'Amélioration Continue**

### **1. Monitoring en Temps Réel**
- Dashboards Grafana
- Alertes Slack/Email
- Métriques personnalisées

### **2. Tests de Performance**
- Tests de charge (JMeter/LoadRunner)
- Tests de stress
- Tests de régression

### **3. Optimisations Régulières**
- Analyse des requêtes lentes
- Optimisation des index
- Tuning de la configuration
