# NurseLink AI - Healthcare Staffing Platform

## Overview

NurseLink AI is an intelligent healthcare staffing platform that connects nurses with medical establishments using artificial intelligence for optimized matching. The platform features automated contract generation, smart matching algorithms, and a comprehensive mobile application for seamless healthcare recruitment.

## System Architecture

### Frontend Architecture
- **Web Application**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Tailwind CSS with shadcn/ui components
- **Form Handling**: React Hook Form with Zod validation
- **Mobile Application**: React Native with Expo for cross-platform mobile access

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: OAuth via Replit with Passport.js
- **AI Integration**: OpenAI GPT-4o for intelligent matching and contract generation
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple

### Database Schema
The system uses PostgreSQL with Drizzle ORM, featuring:
- User management (authentication, roles, profiles)
- Nurse and establishment profiles with specialized fields
- Mission posting and application tracking
- Automated contract generation and storage
- AI-powered absence forecasting
- Document management and verification

## Key Components

### 1. Authentication System
- **OAuth Integration**: Replit OAuth for secure authentication
- **Role-based Access**: Separate interfaces for nurses and establishments
- **Session Persistence**: Secure session storage in PostgreSQL
- **Token Management**: Automatic token refresh and validation

### 2. Hybrid Matching Engine
- **Deterministic Algorithm**: 8-criteria transparent scoring system without external AI dependencies
- **Fixed Core Criteria (70%)**: Non-modifiable weights ensuring consistency - Specialization (30%), Experience (20%), Geography (15%), Ratings (5%)
- **Customizable Criteria (30%)**: Establishment-specific weighting for Availability (15%), Certifications (8%), History (5%), Language (2%)
- **Transparent Scoring**: Fully explainable matching results for GDPR compliance
- **Real-time Recommendations**: Dynamic mission recommendations based on configurable business rules

### 3. Automated Contract Generation
- **Template Engine**: AI-generated HTML contract templates using OpenAI GPT-4o
- **Financial Calculations**: Automatic salary, tax, and benefit calculations
- **Electronic Signatures**: Integrated digital signature workflow
- **Legal Compliance**: Template generation following healthcare employment regulations

### 4. Mobile Application
- **Cross-platform**: React Native with Expo for iOS and Android
- **Real-time Sync**: API integration with backend services
- **Offline Capability**: Limited offline functionality for essential features
- **Push Notifications**: Mission alerts and application status updates

## Data Flow

### Mission Publication Flow
1. Establishment creates mission via web interface
2. Mission data validated and stored in database
3. AI matching engine analyzes and scores potential nurse candidates
4. Automated notifications sent to qualified nurses
5. Applications tracked and managed through the platform

### Contract Generation Flow
1. Mission application accepted by establishment
2. System automatically collects mission, nurse, and establishment data
3. OpenAI GPT-4o generates professional HTML contract template
4. Financial calculations performed (salary, taxes, benefits)
5. Contract stored with unique identifier
6. Electronic signature workflow initiated
7. All parties notified of contract availability

### Matching Algorithm Flow
1. New mission triggers matching analysis
2. AI evaluates all available nurses against mission requirements
3. Scoring based on specialization match, geographic proximity, experience level, and availability
4. Top candidates identified and ranked
5. Automated notifications sent to qualified candidates
6. Application tracking and response management

## External Dependencies

### Required Services
- **PostgreSQL Database**: Primary data storage (provided by Replit)
- **OpenAI API**: GPT-4o for AI features (contract generation, matching intelligence)
- **Replit OAuth**: Authentication and user management
- **Email Service**: For notifications and contract delivery

### Optional Integrations
- **SMS Service**: Mobile notifications and alerts
- **Document Storage**: Cloud storage for CV uploads and certifications
- **Payment Processing**: Future integration for payroll management
- **Calendar Integration**: Schedule synchronization

## Deployment Strategy

### Development Environment
- **Local Development**: npm run dev for concurrent client/server development
- **Database**: PostgreSQL with Drizzle migrations
- **Environment Variables**: Comprehensive .env configuration with validation
- **Hot Reload**: Vite for frontend and tsx for backend development

### Production Deployment
- **Platform**: Configured for Replit Deployments with autoscale support
- **Build Process**: Vite for client build, esbuild for server bundle
- **Database Migration**: Automated schema updates via Drizzle
- **Environment Validation**: Strict environment variable validation using Zod
- **Session Storage**: PostgreSQL-backed sessions for scalability

### Mobile App Deployment
- **Development**: Expo Go for rapid testing and development
- **Production**: Expo Application Services (EAS) for app store deployment
- **Platform Support**: iOS and Android with shared codebase
- **OTA Updates**: Expo's over-the-air update system for rapid deployment

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **June 23, 2025**: Système complet établissement production-ready
  - Authentification localStorage robuste avec gestion d'erreurs réseau améliorée
  - Tous endpoints établissement implémentés : profile, stats, candidates, templates, analytics
  - Algorithme de matching intelligent 8-critères avec scores détaillés transparents  
  - Actions candidatures opérationnelles : accepter/rejeter avec logs complets
  - Sécurité par rôles : accès 403 pour infirmiers sur endpoints établissement
  - Gestion emails dupliqués avec code 409 approprié
  - Tests validation : 8 endpoints 200 OK, authentification multi-rôles fonctionnelle
  - Utilisateur test établissement : test@etablissement.com / test123

- **June 21, 2025**: Nouvelle section "Gestion d'équipe" orientée missions-candidatures
  - Interface moderne organisée par missions avec leurs candidatures
  - Indicateurs temps restant avec codes couleur (urgent/normal/en cours)
  - Statistiques visuelles par mission (total/en attente/acceptées candidatures)
  - Actions directes accepter/rejeter depuis la vue d'ensemble
  - Design UX expert avec micro-interactions et transitions fluides
  - Filtrage intelligent par recherche et service
  - Navigation cross-tab vers détails candidatures

- **June 21, 2025**: Optimisations UX expertes complètes du dashboard établissement
  - Interface modernisée : en-tête avec logo, statut en ligne, animations hover
  - Navigation intuitive : onglets avec icônes (Home, Briefcase, UserPlus, etc.)
  - Cartes métriques redesignées : bordures colorées, animations hover, hiérarchie visuelle
  - Microinteractions fluides : transitions shadow, états loading sophistiqués
  - Design responsive amélioré : affichage mobile adaptatif des onglets
  - Système de couleurs cohérent : bleu/orange/vert/jaune pour catégorisation
  - Typography optimisée : contraste renforcé mode sombre/clair
  - États de feedback visuels : indicateurs temps réel, badges notifications
  - Performance UX : chargement progressif, skeleton screens réalistes

- **June 21, 2025**: Authentification locale complète implémentée
  - Remplacement OAuth Replit par système email/mot de passe
  - Formulaires d'inscription adaptatifs (infirmier/établissement)
  - Création automatique des profils spécialisés lors de l'inscription
  - Application mobile adaptée avec authentification locale
  - Hook d'authentification unifié web/mobile
  - Tests en local sans dépendances externes OAuth
  - Redirection automatique vers dashboard après connexion/inscription
  - Correction erreurs React hooks avec redirection conditionnelle

- **June 15, 2025**: Migration complète vers algorithme déterministe
  - Remplacement total de l'API OpenAI par algorithme local 8-critères
  - Templates de contrats spécialisés par type (CDI/CDD/Auto-entrepreneur)
  - Conformité légale française pour chaque type de contrat
  - Génération instantanée sans coût API externe
  - Système de matching 100% explicable et RGPD-compliant

## Changelog

Changelog:
- June 13, 2025. Initial setup
- June 15, 2025. Complete AI-free implementation with specialized contract templates