# ==============================================================================
# NurseLink AI - Dockerfile Production
# ==============================================================================
#
# Dockerfile optimisé pour la production avec multi-stage build
# Sécurité renforcée et performances optimisées
# ==============================================================================

# Stage 1: Dependencies
FROM node:18-alpine AS deps

# Installer les dépendances système nécessaires
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json ./

# Installer toutes les dépendances (incluant devDependencies)
RUN npm ci

# Copier le code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Builder l'application
RUN npm run build

# Stage 3: Production
FROM node:18-alpine AS runner

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

# Variables d'environnement pour la production
ENV NODE_ENV=production
ENV PORT=5000

# Copier les fichiers nécessaires depuis les stages précédents
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/generated ./generated
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Créer les dossiers nécessaires
RUN mkdir -p /app/logs && chown nextjs:nodejs /app/logs

# Passer à l'utilisateur non-root
USER nextjs

# Exposer le port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Commande de démarrage
CMD ["npm", "start"]
