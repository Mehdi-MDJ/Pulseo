# 🚀 Instructions de Déploiement Production

## **Configuration Docker Optimisée**

### **Fichiers de Configuration :**

#### **📁 `docker-compose.yml`**
- **Usage** : Développement local uniquement
- **Fonctionnalités** : Hot-reload, volumes montés, monitoring complet
- **⚠️ Ne pas utiliser en production**

#### **📁 `docker-compose.prod.yml`**
- **Usage** : Production uniquement
- **Fonctionnalités** : Configuration optimisée, sans volumes de développement
- **✅ Utiliser pour le déploiement**

---

## **🚀 Déploiement en Production**

### **Commande de Déploiement :**
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

### **Explication des Paramètres :**
- `-f docker-compose.prod.yml` : Spécifie d'utiliser notre fichier de production
- `--build` : Force la reconstruction de l'image Docker avec les dernières modifications
- `-d` : Lance les conteneurs en arrière-plan (detached mode)

### **Commandes Utiles :**

#### **Démarrer en Production :**
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

#### **Arrêter en Production :**
```bash
docker-compose -f docker-compose.prod.yml down
```

#### **Voir les logs :**
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

#### **Redémarrer en Production :**
```bash
docker-compose -f docker-compose.prod.yml restart
```

---

## **🔧 Développement Local**

### **Commande de Développement :**
```bash
docker-compose up --build
```

### **Fonctionnalités Développement :**
- ✅ Hot-reload des fichiers
- ✅ Volumes montés pour le développement
- ✅ Monitoring complet (Prometheus + Grafana)
- ✅ Base de données PostgreSQL
- ✅ Cache Redis

---

## **📊 Monitoring**

### **Accès aux Services :**
- **Application** : http://localhost:80
- **API Backend** : http://localhost:3001
- **Prometheus** : http://localhost:9090
- **Grafana** : http://localhost:3000

### **Logs et Debugging :**
```bash
# Logs de l'application
docker-compose -f docker-compose.prod.yml logs app

# Logs de tous les services
docker-compose -f docker-compose.prod.yml logs

# Logs en temps réel
docker-compose -f docker-compose.prod.yml logs -f
```

---

## **🔒 Sécurité**

### **Variables d'Environnement :**
- ✅ Toutes les variables sensibles sont externalisées
- ✅ Pas de secrets hardcodés dans les fichiers
- ✅ Utilisation de `.env` pour la production

### **Bonnes Pratiques :**
- 🔒 Utiliser des mots de passe forts en production
- 🔒 Configurer SSL/TLS pour HTTPS
- 🔒 Limiter l'accès aux ports sensibles
- 🔒 Surveiller les logs pour détecter les anomalies

---

## **📋 Checklist de Déploiement**

### **Avant le Déploiement :**
- [ ] Variables d'environnement configurées
- [ ] Certificats SSL installés (si HTTPS)
- [ ] Base de données initialisée
- [ ] Tests passés localement

### **Pendant le Déploiement :**
- [ ] Utiliser `docker-compose.prod.yml`
- [ ] Vérifier les logs de démarrage
- [ ] Tester l'accessibilité des services
- [ ] Vérifier la santé des conteneurs

### **Après le Déploiement :**
- [ ] Monitoring configuré et fonctionnel
- [ ] Logs surveillés
- [ ] Performance testée
- [ ] Sauvegarde configurée

---

## **🆘 Dépannage**

### **Problèmes Courants :**

#### **Conteneur ne démarre pas :**
```bash
docker-compose -f docker-compose.prod.yml logs app
```

#### **Port déjà utilisé :**
```bash
# Vérifier les ports utilisés
netstat -tulpn | grep :80
netstat -tulpn | grep :3001

# Arrêter les services conflictuels
sudo systemctl stop nginx  # si nécessaire
```

#### **Problème de permissions :**
```bash
# Donner les bonnes permissions
sudo chown -R $USER:$USER .
chmod +x scripts/*.sh
```

---

**🎯 Configuration optimisée et sécurisée pour la production !**
