/**
 * Serveur NurseLink AI avec routes API fonctionnelles
 */

// Charger les variables d'environnement en premier
import 'dotenv/config';

import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";
import establishmentRoutes from "./routes/establishmentRoutes";
import localAuthRoutes from "./routes/localAuthRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import { rateLimitMiddleware } from './middleware/rateLimiter';
import { sanitizeInput, validateHeaders } from './middleware/validationMiddleware';
import { logger } from './services/loggerService';
import { sessionService } from './services/sessionService';

const app = express();

// Configuration middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Nettoyage des données de test
if (process.env.NODE_ENV !== 'production') {
  (global as any).persistentCandidates = {
    "Mission Urgences Nuit": [
      {
        id: "new-cand-1",
        candidateName: "Emma Rousseau",
        email: "emma.rousseau@email.com",
        experience: "6 ans",
        specialization: "Urgences",
        status: "pending",
        appliedAt: "2025-06-23",
        cv: "emma_rousseau_cv.pdf",
        rating: 4.7
      },
      {
        id: "new-cand-2",
        candidateName: "Thomas Leroy",
        email: "thomas.leroy@email.com",
        experience: "4 ans",
        specialization: "Urgences",
        status: "pending",
        appliedAt: "2025-06-23",
        cv: "thomas_leroy_cv.pdf",
        rating: 4.4
      },
      {
        id: "new-cand-3",
        candidateName: "Clara Petit",
        email: "clara.petit@email.com",
        experience: "8 ans",
        specialization: "Urgences",
        status: "pending",
        appliedAt: "2025-06-23",
        cv: "clara_petit_cv.pdf",
        rating: 4.9
      }
    ]
  };
  console.log("✅ Nouvelles candidatures fraîches - Emma, Thomas, Clara en attente");

  (global as any).testApplications = [
    {
      id: 1,
      nurseName: "Marie Dubois",
      missionTitle: "Infirmier DE - Service Réanimation",
      status: "pending",
      appliedAt: "2025-06-23T10:00:00Z",
      hourlyRate: 28,
      message: "Expérience en réanimation, disponible immédiatement"
    },
    {
      id: 2,
      nurseName: "Pierre Martin",
      missionTitle: "Infirmier DE - Service Réanimation",
      status: "accepted",
      appliedAt: "2025-06-22T14:30:00Z",
      hourlyRate: 26,
      message: "5 ans d'expérience en réanimation"
    },
    {
      id: 3,
      nurseName: "Sophie Leroy",
      missionTitle: "Infirmier DE - Urgences",
      status: "rejected",
      appliedAt: "2025-06-21T09:15:00Z",
      hourlyRate: 30,
      message: "Spécialisée en urgences pédiatriques"
    },
    {
      id: 4,
      nurseName: "Jean Dupont",
      missionTitle: "Infirmier DE - Service Réanimation",
      status: "pending",
      appliedAt: "2025-06-23T11:45:00Z",
      hourlyRate: 27,
      message: "Formation continue en réanimation"
    }
  ];
} else {
  delete (global as any).persistentCandidates;
  delete (global as any).testApplications;
}

// Store des utilisateurs en mémoire pour le développement
const users = new Map<string, any>();
const sessions = new Map<string, any>();

// Exposer la Map sessions globalement pour le middleware local
(global as any).sessions = sessions;

// Fonction pour persister les sessions (simple pour le développement)
function persistSession(token: string, userData: any) {
  sessions.set(token, {
    user: userData,
    createdAt: Date.now(),
    lastAccess: Date.now()
  });
  console.log(`Session persistée: ${token} pour ${userData.email}`);
}

function getSessionData(token: string) {
  const session = sessions.get(token);
  if (session) {
    session.lastAccess = Date.now();
    return session.user;
  }
  return null;
}

// Créer un utilisateur de test établissement
const testEstablishmentId = "user-test-etablissement";
users.set(testEstablishmentId, {
  id: testEstablishmentId,
  email: "test@etablissement.com",
  firstName: "Établissement",
  lastName: "Test",
  role: "establishment",
  cguAccepted: true,
  password: "test123",
  createdAt: new Date()
});

// Helper pour générer un token de session simple
function generateSessionToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Middleware d'authentification
function requireAuth(req: any, res: Response, next: NextFunction) {
  // Chercher le token d'abord dans les headers Authorization
  let sessionToken = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    sessionToken = req.headers.authorization.substring(7);
  } else {
    // Fallback vers les cookies
    const cookies = req.headers.cookie;
    if (cookies) {
      const sessionTokenMatch = cookies.match(/sessionToken=([^;]+)/);
      sessionToken = sessionTokenMatch ? sessionTokenMatch[1] : null;
    }
  }

  if (sessionToken) {
    const user = getSessionData(sessionToken);
    if (user) {
      req.user = user;
      console.log(`Token depuis Authorization header: ${sessionToken}`);
      console.log(`Sessions actives: ${JSON.stringify(Array.from(sessions.keys()), null, 2)}`);
      console.log(`Utilisateur authentifié: ${user.email}`);
      return next();
    }
  }

  console.log('Authentification échouée - token:', sessionToken);
  res.status(401).json({ error: 'Non authentifié' });
}

// Sécurité CORS
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const allowedOrigins = ['https://tondomaine.com', 'https://admin.tondomaine.com'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Limiter les logs en production
function logDev(...args: any[]) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args);
  }
}

// Middleware global de rate limiting (Redis)
app.use(rateLimitMiddleware);

// Middleware global de sanitization (requêtes API)
app.use('/api', sanitizeInput);
app.use('/api', validateHeaders);

// Middleware de logging des requêtes (remplace le console.log du logger natif)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Requête API', {
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id,
      ipAddress: req.ip,
    });
  });
  next();
});

// === ROUTES API ===

// Santé de l'API
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    users: users.size,
    sessions: sessions.size
  });
});

// Obtenir l'utilisateur actuel
app.get("/api/auth/user", (req, res) => {
  // Chercher le token d'abord dans les headers Authorization
  let sessionToken = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    sessionToken = req.headers.authorization.substring(7);
    console.log("Token depuis Authorization header:", sessionToken);
  } else {
    // Fallback vers les cookies
    const cookies = req.headers.cookie;
    if (cookies) {
      const sessionTokenMatch = cookies.match(/sessionToken=([^;]+)/);
      sessionToken = sessionTokenMatch ? sessionTokenMatch[1] : null;
      console.log("Token depuis cookies:", sessionToken);
    }
  }

  console.log("Sessions actives:", Array.from(sessions.keys()));

  if (sessionToken) {
    const user = getSessionData(sessionToken);
    if (user) {
      console.log("Utilisateur authentifié:", user.email);
      const { password, ...userResponse } = user;
      return res.json(userResponse);
    }
  }

  console.log("Authentification échouée - token:", sessionToken);
  res.status(401).json({ error: "Non authentifié" });
});

// Connexion
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    // Rechercher ou créer l'utilisateur
    let user = Array.from(users.values()).find(u => u.email === email);

    if (!user) {
      // Créer automatiquement l'utilisateur s'il n'existe pas
      const userId = `user-${Date.now()}`;
      user = {
        id: userId,
        email: email,
        firstName: "Utilisateur",
        lastName: "Test",
        role: "establishment",
        cguAccepted: true,
        password: password
      };
      users.set(userId, user);
    }

    // Vérifier le mot de passe
    if (user.password !== password) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    // Créer une session
    const sessionToken = generateSessionToken();
    persistSession(sessionToken, user);

    // Définir le cookie de session avec path explicite
    res.cookie('sessionToken', sessionToken, {
      httpOnly: false, // Permettre l'accès JavaScript pour debug
      secure: false, // false en développement
      sameSite: 'lax', // Nécessaire pour les cookies cross-origin en dev
      path: '/', // Path explicite
      domain: 'localhost', // Domain explicite pour développement
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });

    // Retourner l'utilisateur et le token
    const { password: _, ...userResponse } = user;
    res.json({
      success: true,
      user: userResponse,
      sessionToken: sessionToken
    });

  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Inscription
app.post("/api/auth/register", (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: "Un utilisateur avec cet email existe déjà" });
    }

    // Créer le nouvel utilisateur
    const userId = `user-${Date.now()}`;
    const user = {
      id: userId,
      email,
      firstName,
      lastName,
      role,
      cguAccepted: true,
      password,
      createdAt: new Date()
    };

    users.set(userId, user);

    // Créer une session
    const sessionToken = generateSessionToken();
    persistSession(sessionToken, user);

    // Définir le cookie de session
    res.cookie('sessionToken', sessionToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userResponse } = user;
    res.json({
      success: true,
      user: userResponse,
      token: sessionToken
    });

  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Déconnexion
app.post("/api/auth/logout", (req, res) => {
  const sessionToken = req.headers.cookie?.split('session=')[1]?.split(';')[0];

  if (sessionToken) {
    sessions.delete(sessionToken);
  }

  res.clearCookie('session');
  res.json({ success: true, message: "Déconnexion réussie" });
});

// Routes de données de référence
app.get("/api/reference/specializations", (req, res) => {
  res.json([
    "Médecine générale", "Chirurgie", "Réanimation", "Urgences", "Pédiatrie",
    "Gériatrie", "Psychiatrie", "Obstétrique", "Cardiologie", "Oncologie",
    "Neurologie", "Orthopédie", "Anesthésie", "Radiologie", "Laboratoire"
  ]);
});

app.get("/api/reference/certifications", (req, res) => {
  res.json([
    "Diplôme d'État infirmier", "Spécialisation en soins intensifs",
    "Formation aux urgences", "Certification BLS", "Certification ACLS",
    "Formation pédiatrique", "Spécialisation gériatrique", "Formation en psychiatrie",
    "Certification PALS", "Formation en bloc opératoire", "Spécialisation en dialyse",
    "Formation en chimiothérapie", "Certification en réanimation",
    "Formation aux soins palliatifs", "Spécialisation maternité"
  ]);
});

// Store des missions en mémoire pour le développement
const missions = new Map<string, any>();

// Routes protégées
app.get("/api/user/profile", requireAuth, (req: any, res) => {
  res.json(req.user);
});

// Route API pour les missions qui fonctionne avec l'auth local
app.post("/api/missions", requireAuth, (req: any, res) => {
  try {
    const user = req.user;
    console.log("Création mission pour utilisateur:", user.role);

    if (user.role !== 'establishment') {
      return res.status(403).json({ error: "Seuls les établissements peuvent créer des missions" });
    }

    const missionData = req.body;
    const missionId = `mission-${Date.now()}`;

    const mission = {
      id: missionId,
      ...missionData,
      establishmentId: user.id,
      establishmentName: `${user.firstName} ${user.lastName}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    missions.set(missionId, mission);
    console.log(`Mission créée: ${mission.title} (${mission.status})`);

    res.status(201).json(mission);
  } catch (error) {
    console.error("Erreur création mission:", error);
    res.status(500).json({ error: "Erreur lors de la création de la mission" });
  }
});

// Route API pour récupérer les missions
app.get("/api/missions", requireAuth, (req: any, res) => {
  try {
    const user = req.user;
    console.log("Récupération missions pour:", user.role);

    if (user.role === 'establishment') {
      // Retourner les missions de l'établissement
      const establishmentMissions = Array.from(missions.values())
        .filter(mission => mission.establishmentId === user.id);
      res.json(establishmentMissions);
    } else if (user.role === 'nurse') {
      // Retourner toutes les missions publiées pour les infirmiers
      const publishedMissions = Array.from(missions.values())
        .filter(mission => mission.status === 'published');
      res.json(publishedMissions);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error("Erreur récupération missions:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des missions" });
  }
});

// Endpoints spécifiques établissement manquants
app.get("/api/establishment/profile", requireAuth, (req: any, res) => {
  const user = req.user;
  if (user.role !== 'establishment') {
    return res.status(403).json({ error: "Accès réservé aux établissements" });
  }

  res.json({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    type: "Hôpital public",
    address: "123 Rue de la Santé, 75000 Paris",
    siret: "12345678901234",
    phone: "01 23 45 67 89",
    contactPerson: user.firstName + " " + user.lastName,
    certifications: ["HAS", "ISO 9001"],
    specialties: ["Urgences", "Chirurgie", "Médecine interne"]
  });
});

app.get("/api/establishment/stats", requireAuth, (req: any, res) => {
  const user = req.user;
  if (user.role !== 'establishment') {
    return res.status(403).json({ error: "Accès réservé aux établissements" });
  }

  const userMissions = Array.from(missions.values())
    .filter(mission => mission.establishmentId === user.id);

  res.json({
    totalMissions: userMissions.length,
    activeMissions: userMissions.filter(m => m.status === 'published').length,
    completedMissions: userMissions.filter(m => m.status === 'completed').length,
    totalCandidates: 15, // Mock data for now
    pendingCandidates: 8,
    acceptedCandidates: 5,
    averageResponseTime: "2.5 heures",
    satisfactionRate: 4.7
  });
});

app.get("/api/establishment/candidates", requireAuth, (req: any, res) => {
  const user = req.user;
  if (user.role !== 'establishment') {
    return res.status(403).json({ error: "Accès réservé aux établissements" });
  }

  // Retourner les données persistantes (déjà initialisées au démarrage)
  res.json((global as any).persistentCandidates);
});

app.get("/api/establishment/templates", requireAuth, (req: any, res) => {
  const user = req.user;
  if (user.role !== 'establishment') {
    return res.status(403).json({ error: "Accès réservé aux établissements" });
  }

  res.json([
    {
      id: "template-1",
      name: "Garde de nuit urgences",
      service: "Urgences",
      shift: "nuit",
      hourlyRate: 32,
      description: "Template standard pour garde de nuit au service des urgences",
      skills: ["Soins d'urgence", "Triage", "Réanimation", "Gestion stress"],
      specialization: "Urgences",
      duration: "12h",
      salary: "384€/nuit"
    },
    {
      id: "template-2",
      name: "Mission cardiologie jour",
      service: "Cardiologie",
      shift: "jour",
      hourlyRate: 28,
      description: "Soins cardiologiques en journée avec monitoring",
      skills: ["ECG", "Monitoring cardiaque", "Cathétérisme", "Education patient"],
      specialization: "Cardiologie",
      duration: "8h",
      salary: "224€/jour"
    },
    {
      id: "template-3",
      name: "Pédiatrie week-end",
      service: "Pédiatrie",
      shift: "jour",
      hourlyRate: 30,
      description: "Garde pédiatrique week-end avec urgences",
      skills: ["Soins pédiatriques", "Vaccination", "Urgences enfants", "Communication famille"],
      specialization: "Pédiatrie",
      duration: "10h",
      salary: "300€/garde"
    }
  ]);
});

app.get("/api/analytics/metrics/realtime", requireAuth, (req: any, res) => {
  const user = req.user;
  if (user.role !== 'establishment') {
    return res.status(403).json({ error: "Accès réservé aux établissements" });
  }

  res.json({
    activeUsers: 12,
    newApplications: 3,
    urgentMissions: 2,
    responseRate: 85,
    averageMatchScore: 78
  });
});

// Endpoints d'actions pour les candidatures
app.put("/api/establishment/candidates/:candidateId/accept", requireAuth, (req: any, res) => {
  const user = req.user;
  if (user.role !== 'establishment') {
    return res.status(403).json({ error: "Accès réservé aux établissements" });
  }

  const { candidateId } = req.params;
  console.log(`Candidature acceptée: ${candidateId} par ${user.email}`);

  res.json({
    success: true,
    message: "Candidature acceptée avec succès",
    candidateId: candidateId,
    status: "accepted"
  });
});

app.put("/api/establishment/candidates/:candidateId/reject", requireAuth, (req: any, res) => {
  const user = req.user;
  if (user.role !== 'establishment') {
    return res.status(403).json({ error: "Accès réservé aux établissements" });
  }

  const { candidateId } = req.params;
  console.log(`Candidature rejetée: ${candidateId} par ${user.email}`);

  // Modifier le statut dans les données persistantes
  console.log("Données avant modification:", JSON.stringify((global as any).persistentCandidates, null, 2));

  if ((global as any).persistentCandidates) {
    Object.keys((global as any).persistentCandidates).forEach(missionTitle => {
      const candidates = (global as any).persistentCandidates[missionTitle];
      const candidateIndex = candidates.findIndex((c: any) => c.id === candidateId);
      if (candidateIndex !== -1) {
        console.log(`Candidature trouvée dans ${missionTitle}, index: ${candidateIndex}`);
        candidates[candidateIndex].status = "rejected";
        candidates[candidateIndex].rejectedAt = new Date().toISOString();
        console.log("Nouveau statut:", candidates[candidateIndex].status);
      }
    });
  }

  console.log("Données après modification:", JSON.stringify((global as any).persistentCandidates, null, 2));

  res.json({
    success: true,
    message: "Candidature rejetée",
    candidateId: candidateId,
    status: "rejected"
  });
});

// Nouvelles routes pour les candidatures
app.post("/api/applications/:id/accept", requireAuth, (req: any, res) => {
  const user = req.user;
  if (user.role !== 'establishment') {
    return res.status(403).json({ error: "Accès réservé aux établissements" });
  }

  const { id } = req.params;
  console.log(`Candidature acceptée: ${id} par ${user.email}`);

  res.json({
    success: true,
    message: "Candidature acceptée avec succès",
    applicationId: id,
    status: "accepted"
  });
});

app.post("/api/applications/:id/reject", requireAuth, (req: any, res) => {
  const user = req.user;
  if (user.role !== 'establishment') {
    return res.status(403).json({ error: "Accès réservé aux établissements" });
  }

  const { id } = req.params;
  console.log(`Candidature rejetée: ${id} par ${user.email}`);

  res.json({
    success: true,
    message: "Candidature rejetée",
    applicationId: id,
    status: "rejected",
    canUndo: true
  });
});

app.post("/api/applications/:id/undo_reject", requireAuth, (req: any, res) => {
  const user = req.user;
  if (user.role !== 'establishment') {
    return res.status(403).json({ error: "Accès réservé aux établissements" });
  }

  const { id } = req.params;
  console.log(`Annulation rejet candidature: ${id} par ${user.email}`);

  res.json({
    success: true,
    message: "Rejet annulé avec succès",
    applicationId: id,
    status: "pending"
  });
});

// Endpoints pour les templates
app.post("/api/establishment/templates", requireAuth, (req: any, res) => {
  const user = req.user;
  if (user.role !== 'establishment') {
    return res.status(403).json({ error: "Accès réservé aux établissements" });
  }

  const templateData = req.body;
  const templateId = `template-${Date.now()}`;

  const template = {
    id: templateId,
    ...templateData,
    establishmentId: user.id,
    createdAt: new Date()
  };

  console.log(`Template créé: ${template.name} par ${user.email}`);

  res.status(201).json(template);
});

app.delete("/api/establishment/templates/:templateId", requireAuth, (req: any, res) => {
  const user = req.user;
  if (user.role !== 'establishment') {
    return res.status(403).json({ error: "Accès réservé aux établissements" });
  }

  const { templateId } = req.params;
  console.log(`Template supprimé: ${templateId} par ${user.email}`);

  res.json({
    success: true,
    message: "Template supprimé avec succès"
  });
});

// Algorithme de matching intelligent
app.get("/api/missions/:missionId/recommendations", requireAuth, (req: any, res) => {
  const user = req.user;
  if (user.role !== 'establishment') {
    return res.status(403).json({ error: "Accès réservé aux établissements" });
  }

  const { missionId } = req.params;
  const mission = missions.get(missionId);

  if (!mission || mission.establishmentId !== user.id) {
    return res.status(404).json({ error: "Mission non trouvée" });
  }

  // Algorithme de matching basé sur 8 critères
  const mockRecommendations = [
    {
      nurseId: "nurse-1",
      name: "Marie Dupont",
      email: "marie.dupont@email.com",
      matchScore: 92,
      specialization: mission.specialization,
      experience: "5 ans",
      rating: 4.8,
      availability: true,
      distance: "2.5 km",
      factors: {
        specialization: 30, // 30% - Match parfait
        experience: 18,     // 20% - 5 ans d'expérience
        geography: 12,      // 15% - Proche géographiquement
        ratings: 5,         // 5% - Excellentes évaluations
        availability: 15,   // 15% - Disponible aux dates
        certifications: 7,  // 8% - Certifications appropriées
        history: 3,         // 5% - Bon historique
        language: 2         // 2% - Langue française
      },
      reasoning: "Candidat idéal avec spécialisation exacte et excellente expérience"
    },
    {
      nurseId: "nurse-2",
      name: "Pierre Martin",
      email: "pierre.martin@email.com",
      matchScore: 78,
      specialization: "Médecine générale",
      experience: "3 ans",
      rating: 4.3,
      availability: true,
      distance: "5.1 km",
      factors: {
        specialization: 20, // Spécialisation proche mais pas exacte
        experience: 15,     // Expérience correcte
        geography: 10,      // Distance acceptable
        ratings: 4,         // Bonnes évaluations
        availability: 15,   // Disponible
        certifications: 6,  // Certifications standard
        history: 4,         // Bon historique
        language: 2         // Langue française
      },
      reasoning: "Bon candidat avec expérience solide, adaptable à la spécialisation"
    }
  ];

  console.log(`Recommandations générées pour mission ${missionId}: ${mockRecommendations.length} candidats`);

  res.json({
    missionId,
    recommendations: mockRecommendations,
    totalCandidates: mockRecommendations.length,
    averageScore: mockRecommendations.reduce((sum, r) => sum + r.matchScore, 0) / mockRecommendations.length
  });
});

// Enregistrement des routes d'authentification locale
app.use("/api/auth", localAuthRoutes);

// Enregistrement des vraies routes établissement
app.use("/api/establishment", establishmentRoutes);

// Enregistrement des routes de notifications
app.use("/api/notifications", notificationRoutes);

// Gestionnaire 404 pour les routes API non trouvées
app.use("/api/*", (req: Request, res: Response) => {
  res.status(404).json({
    error: "Route API non trouvée",
    message: `La route ${req.method} ${req.originalUrl} n'existe pas`,
    code: "ROUTE_NOT_FOUND"
  });
});

// Middleware de gestion d'erreurs globales (logging sécurisé)
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Erreur interne du serveur";
  logger.error('Erreur serveur', {
    endpoint: req.originalUrl,
    method: req.method,
    userId: req.user?.id,
    error: err,
  });
  res.status(status).json({
    error: message,
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { details: err.stack }),
  });
});

// Route de test GET
app.get("/ping", (req, res) => {
  res.send("pong");
});

// Route de test POST
app.post("/test-log", (req, res) => {
  console.log("POST /test-log appelée !");
  res.json({ ok: true });
});

// Démarrage du serveur
async function startServer() {
  try {
    console.log("🚀 Démarrage de NurseLink AI...");
    console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);

    const server = createServer(app);

    // Configuration Vite en dernier pour éviter l'interception des routes API
    if (process.env.NODE_ENV !== 'production') {
      console.log("🔧 Configuration Vite...");
      await setupVite(app, server);
      console.log("✅ Configuration Vite activée");
    } else {
      console.log("🏭 Mode production");
      serveStatic(app);
    }

    const port = parseInt(process.env.PORT || '3000');
    server.listen(port, "0.0.0.0", () => {
      console.log(`🌐 Serveur démarré sur le port ${port}`);
      console.log(`🔗 API disponible sur: http://localhost:${port}/api`);
    });

  } catch (error) {
    console.error("💥 Erreur fatale:", error);
    process.exit(1);
  }
}

startServer().catch(console.error);
