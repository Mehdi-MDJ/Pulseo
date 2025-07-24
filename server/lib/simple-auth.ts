/**
 * ==============================================================================
 * NurseLink AI - Service d'Authentification Simple
 * ==============================================================================
 *
 * Service d'authentification JWT custom pour Express
 * Remplace NextAuth.js pour éviter les conflits
 * ==============================================================================
 */

import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import { UserRole } from "@prisma/client"

export interface User {
  id: string
  email: string | null
  name?: string | null
  role: UserRole
  image?: string | null
  establishmentId?: string | null
}

export interface Session {
  user: User
  expires: string
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
  private readonly JWT_EXPIRES_IN = "30d"

  async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { nurseProfile: true, establishmentProfile: true }
      })

      if (!user) {
        return null
      }

      // TODO: Implémenter la vérification du mot de passe
      // const isValidPassword = await bcrypt.compare(password, user.password)
      // if (!isValidPassword) return null

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
        establishmentId: user.establishmentId,
      }
    } catch (error) {
      console.error("Erreur authentification:", error)
      return null
    }
  }

  createToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        establishmentId: user.establishmentId
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    )
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET)
    } catch (error) {
      return null
    }
  }

  extractTokenFromHeader(req: any): string | null {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }
    return authHeader.substring(7)
  }

  async getSession(req: any): Promise<Session | null> {
    try {
      const token = this.extractTokenFromHeader(req)
      if (!token) {
        return null
      }

      const decoded = this.verifyToken(token)
      if (!decoded) {
        return null
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      })

      if (!user) {
        return null
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          establishmentId: user.establishmentId,
        },
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    } catch (error) {
      console.error("Erreur récupération session:", error)
      return null
    }
  }

  async createUser(userData: {
    email: string
    name?: string
    role: UserRole
    establishmentId?: string
  }): Promise<User | null> {
    try {
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          role: userData.role,
          establishmentId: userData.establishmentId,
        }
      })

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
        establishmentId: user.establishmentId,
      }
    } catch (error) {
      console.error("Erreur création utilisateur:", error)
      return null
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User | null> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: userData
      })

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
        establishmentId: user.establishmentId,
      }
    } catch (error) {
      console.error("Erreur mise à jour utilisateur:", error)
      return null
    }
  }
}

export const authService = new AuthService()
