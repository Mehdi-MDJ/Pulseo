/**
 * ==============================================================================
 * NurseLink AI - Configuration NextAuth.js v5
 * ==============================================================================
 *
 * Configuration complète de l'authentification avec NextAuth.js v5
 * Support multi-providers : Google, GitHub, Email/Password, Magic Links
 * ==============================================================================
 */

import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import EmailProvider from "next-auth/providers/email"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    // OAuth Providers
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "NURSE", // Par défaut
        }
      },
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          role: "NURSE", // Par défaut
        }
      },
    }),

    // Email/Password Provider
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { nurseProfile: true, establishmentProfile: true }
          })

          if (!user) {
            return null
          }

          // Pour l'instant, on accepte tous les utilisateurs existants
          // TODO: Implémenter la vérification du mot de passe quand on aura migré
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          }
        } catch (error) {
          console.error("Erreur authentification:", error)
          return null
        }
      }
    }),

    // Magic Links (Email)
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Ajout des informations personnalisées au token JWT
      if (user) {
        token.role = user.role
        token.establishmentId = user.establishmentId
      }
      return token
    },

    async session({ session, token }) {
      // Ajout des informations personnalisées à la session
      if (token) {
        session.user.role = token.role as string
        session.user.establishmentId = token.establishmentId as string
      }
      return session
    },

    async signIn({ user, account, profile }) {
      // Logique personnalisée lors de la connexion
      if (account?.provider === "google" || account?.provider === "github") {
        // Créer ou mettre à jour le profil utilisateur
        await prisma.user.upsert({
          where: { email: user.email! },
          update: {
            name: user.name,
            image: user.image,
            emailVerified: new Date(),
          },
          create: {
            email: user.email!,
            name: user.name,
            image: user.image,
            role: "NURSE", // Par défaut
            emailVerified: new Date(),
          },
        })
      }

      return true
    },
  },

  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },

  events: {
    async signIn({ user, account, profile }) {
      console.log(`🔐 Connexion réussie: ${user.email} via ${account?.provider}`)
    },
    async signOut({ session, token }) {
      console.log(`🚪 Déconnexion: ${session?.user?.email}`)
    },
  },

  debug: process.env.NODE_ENV === "development",
})
