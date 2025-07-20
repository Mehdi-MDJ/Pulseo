/**
 * ==============================================================================
 * NurseLink AI - Client Prisma
 * ==============================================================================
 *
 * Client Prisma configuré pour la connexion à la base de données
 * Optimisé pour les performances et la gestion des connexions
 * ==============================================================================
 */

import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
