# ==============================================================================
# NurseLink AI - Dockerfile Frontend Production
# ==============================================================================
#
# Dockerfile optimisé pour le frontend en production
# Multi-stage build avec Nginx pour servir les fichiers statiques
# ==============================================================================

# Stage 1: Build Frontend
FROM node:18 AS frontend-builder
WORKDIR /app

# Copier les fichiers de paquets et installer les dépendances à la racine
COPY package*.json ./
RUN npm install

# Copier le reste du code et construire l'application
COPY . .
RUN npm run build

# Stage 2: Production avec Nginx
FROM nginx:alpine AS production

# Copier la configuration Nginx personnalisée
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers buildés depuis le stage précédent
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nginx && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# Changer les permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Passer à l'utilisateur non-root
USER nginx

# Exposer le port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]
