# 🏗️ Architecture d'Authentification NurseLink AI

## 🎯 Objectif
Créer une architecture d'authentification robuste, évolutive et sécurisée pour NurseLink AI

## 📋 Plan de Migration

### Phase 1 : Nettoyage et Préparation
- [ ] Supprimer les dépendances inutilisées (Replit OAuth, ancien NextAuth)
- [ ] Migrer vers NextAuth.js v5
- [ ] Configurer Prisma comme ORM principal
- [ ] Mettre en place les providers d'authentification

### Phase 2 : Configuration NextAuth.js v5
```typescript
// lib/auth.ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    // OAuth Providers
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    // Email/Password
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        // Logique d'authentification locale
      }
    }),
    // Magic Links
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Personnalisation du token JWT
      if (user) {
        token.role = user.role
        token.establishmentId = user.establishmentId
      }
      return token
    },
    async session({ session, token }) {
      // Personnalisation de la session
      session.user.role = token.role
      session.user.establishmentId = token.establishmentId
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error",
  },
})
```

### Phase 3 : Schéma de Base de Données
```sql
-- Tables NextAuth (générées automatiquement)
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  role          UserRole  @default(NURSE)
  establishmentId String?

  accounts      Account[]
  sessions      Session[]

  // Relations métier
  nurseProfile     NurseProfile?
  establishmentProfile EstablishmentProfile?
  missions         Mission[]
  applications     MissionApplication[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

-- Tables métier
model NurseProfile {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id])

  specializations   String[] // Array PostgreSQL
  experience        Int      // Années d'expérience
  certifications   String[]
  availability      Json?    // Horaires de disponibilité
  hourlyRate        Decimal?
  rating            Decimal  @default(0)
  missionsCompleted Int      @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model EstablishmentProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])

  name            String
  type            EstablishmentType
  address         String
  phone           String?
  specialties     String[]
  capacity        Int?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum UserRole {
  NURSE
  ESTABLISHMENT
  ADMIN
}

enum EstablishmentType {
  HOSPITAL
  CLINIC
  NURSING_HOME
  PRIVATE_PRACTICE
}
```

### Phase 4 : Middleware de Protection
```typescript
// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Protection des routes par rôle
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/access-denied", req.url))
    }

    if (path.startsWith("/establishment") && token?.role !== "ESTABLISHMENT") {
      return NextResponse.redirect(new URL("/auth/access-denied", req.url))
    }

    if (path.startsWith("/nurse") && token?.role !== "NURSE") {
      return NextResponse.redirect(new URL("/auth/access-denied", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/establishment/:path*",
    "/nurse/:path*",
    "/missions/:path*",
    "/profile/:path*",
  ]
}
```

### Phase 5 : Hooks et Utilitaires
```typescript
// hooks/useAuth.ts
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isAuthenticated = status === "authenticated"
  const isLoading = status === "loading"

  const requireAuth = (redirectTo = "/auth/signin") => {
    if (!isAuthenticated && !isLoading) {
      router.push(redirectTo)
      return false
    }
    return true
  }

  const requireRole = (roles: string[]) => {
    if (!isAuthenticated) return false
    return roles.includes(session?.user?.role || "")
  }

  return {
    session,
    user: session?.user,
    isAuthenticated,
    isLoading,
    requireAuth,
    requireRole,
  }
}

// lib/auth-utils.ts
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireServerAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Non authentifié")
  }
  return user
}
```

## 🚀 Avantages de cette Architecture

### 1. **Sécurité**
- ✅ JWT rotation automatique
- ✅ Protection CSRF intégrée
- ✅ Validation des sessions
- ✅ Gestion sécurisée des cookies

### 2. **Évolutivité**
- ✅ Ajout facile de nouveaux providers
- ✅ Support multi-rôles
- ✅ Architecture modulaire
- ✅ Compatible microservices

### 3. **Performance**
- ✅ Cache intelligent des sessions
- ✅ Optimisations base de données
- ✅ Lazy loading des providers
- ✅ Compression des tokens

### 4. **Développement**
- ✅ TypeScript natif
- ✅ DX excellente
- ✅ Documentation complète
- ✅ Communauté active

## 📦 Migration Step-by-Step

### Étape 1 : Installation
```bash
npm uninstall next-auth@4 @next-auth/prisma-adapter
npm install next-auth@beta @auth/prisma-adapter
npm install prisma @prisma/client
```

### Étape 2 : Configuration Prisma
```bash
npx prisma init
npx prisma generate
npx prisma db push
```

### Étape 3 : Migration des données
```typescript
// scripts/migrate-users.ts
import { prisma } from "@/lib/prisma"

async function migrateUsers() {
  // Migration des utilisateurs existants vers le nouveau schéma
}
```

### Étape 4 : Tests et Validation
- [ ] Tests unitaires d'authentification
- [ ] Tests d'intégration des providers
- [ ] Validation des permissions
- [ ] Tests de performance

## 🎯 Résultat Final

Une architecture d'authentification :
- **Moderne** : NextAuth.js v5 + Prisma
- **Sécurisée** : Best practices intégrées
- **Évolutive** : Facile d'ajouter de nouveaux providers
- **Maintenable** : Code propre et documenté
- **Performante** : Optimisée pour la production

Cette architecture vous permettra de gérer facilement l'évolution de votre application tout en maintenant un niveau de sécurité élevé.
